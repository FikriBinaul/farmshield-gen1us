// src/pages/forum.js (versi dikembangkan)
// Fitur utama yang ditambahkan:
// - Pagination (load more) untuk post utama
// - Optimistic UI untuk create post, reply, like
// - Modal edit post/reply (bukan prompt)
// - Konfirmasi hapus (modal)
// - Sanitasi input (escape HTML) untuk mencegah XSS
// - Per-post reply realtime listener dengan cleanup yang benar
// - Loading / error state handling
// - Limit panjang input & UX mobile-friendly
// - Simple toast notif (bawaan, tidak memerlukan lib eksternal)

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  limit as fsLimit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
} from "firebase/firestore";

/* OPTIONAL: path of uploaded STL from conversation history (see note above) */
const UPLOADED_STL_PATH = "/mnt/data/farmshield.stl"; // move to /public/models/... for browser access

/* -------------------- Helper Components -------------------- */

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600" />
    </div>
  );
}

/* Escape HTML to avoid XSS (simple) */
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* -------------------- Main Page -------------------- */

export default function Forum() {
  const router = useRouter();
  const cookie = Cookies.get("user");
  const [userData, setUserData] = useState(null);

  // posts + pagination
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const PAGE_SIZE = 6;
  const lastDocRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  // new post + replies
  const [newPost, setNewPost] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});

  // replies (per post)
  const [repliesData, setRepliesData] = useState({});
  const replyUnsubs = useRef({}); // mapping postId -> unsubscribe function

  // modals / editing
  const [editModal, setEditModal] = useState({ open: false, type: null, postId: null, replyId: null, content: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, payload: null });

  // optimistic UI / simple toasts
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Like optimistic map to disable double clicks
  const likingRef = useRef(new Set());

  // sanitize length limits
  const MAX_POST_LENGTH = 1200;
  const MAX_REPLY_LENGTH = 600;

  // INITIAL: read cookie user
  useEffect(() => {
    if (!cookie) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(cookie);
      setUserData(parsed);
    } catch (err) {
      Cookies.remove("user");
      router.push("/login");
    }
  }, [cookie, router]);

  const Layout = userData?.role === "admin" ? AdminLayout : UserLayout;

  /* -------------------- POSTS: load with pagination -------------------- */
  useEffect(() => {
    if (!userData) return;

    setLoadingPosts(true);
    setErrorPosts(null);
    lastDocRef.current = null;
    setHasMore(true);

    // initial load
    (async () => {
      try {
        const col = collection(db, "forum");
        const q = query(col, orderBy("createdAt", "desc"), fsLimit(PAGE_SIZE));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPosts(docs);
        if (snap.docs.length < PAGE_SIZE) setHasMore(false);
        lastDocRef.current = snap.docs[snap.docs.length - 1] || null;

        // subscribe realtime for this current page (we'll also subscribe replies below)
        // for overall realtime updates on page 1 we can still use onSnapshot for the same query:
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const arr = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setPosts(arr);
        });

        // cleanup: unsubscribe realtime when component unmounts or user changes
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error("Load posts error:", err);
        setErrorPosts("Gagal memuat post");
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [userData]);

  /* Load more (pagination) */
  const loadMore = async () => {
    if (!lastDocRef.current || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const col = collection(db, "forum");
      const q = query(col, orderBy("createdAt", "desc"), startAfter(lastDocRef.current), fsLimit(PAGE_SIZE));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(prev => [...prev, ...docs]);
      if (snap.docs.length < PAGE_SIZE) setHasMore(false);
      lastDocRef.current = snap.docs[snap.docs.length - 1] || lastDocRef.current;
    } catch (err) {
      console.error("Load more error:", err);
      setToast("Gagal memuat lebih banyak post");
    } finally {
      loadingMoreRef.current = false;
    }
  };

  /* -------------------- Replies: realtime per post with cleanup -------------------- */
  useEffect(() => {
    // whenever posts change, ensure we have reply listeners for each post in `posts`
    posts.forEach(post => {
      const pid = post.id;
      if (replyUnsubs.current[pid]) {
        // already listening
        return;
      }
      const repliesCol = collection(db, "forum", pid, "replies");
      const q = query(repliesCol, orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRepliesData(prev => ({ ...prev, [pid]: arr }));
      }, err => {
        console.error("Reply listener error:", err);
      });
      replyUnsubs.current[pid] = unsub;
    });

    // cleanup unsubscribes for posts that are no longer in the list
    const currentPostIds = new Set(posts.map(p => p.id));
    Object.keys(replyUnsubs.current).forEach(pid => {
      if (!currentPostIds.has(pid)) {
        try {
          replyUnsubs.current[pid]?.();
        } catch {}
        delete replyUnsubs.current[pid];
        setRepliesData(prev => {
          const copy = { ...prev };
          delete copy[pid];
          return copy;
        });
      }
    });

    // on unmount: cleanup all
    return () => {
      Object.values(replyUnsubs.current).forEach(unsub => {
        try { unsub(); } catch {}
      });
      replyUnsubs.current = {};
    };
  }, [posts]);

  /* -------------------- CREATE POST (optimistic + validation) -------------------- */
  const handleCreatePost = async () => {
    if (!userData?.id) return setToast("User belum terdeteksi!");
    const content = newPost.trim();
    if (!content) return setToast("Tulis post dulu!");
    if (content.length > MAX_POST_LENGTH) return setToast(`Panjang post maksimal ${MAX_POST_LENGTH} karakter`);

    setCreatingPost(true);

    // optimistic UI: prepend a temporary post
    const tempId = `temp-${Date.now()}`;
    const tempPost = {
      id: tempId,
      author: userData.name,
      authorId: userData.id,
      content: escapeHtml(content),
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
      optimistic: true,
    };
    setPosts(prev => [tempPost, ...prev]);
    setNewPost("");

    try {
      const ref = await addDoc(collection(db, "forum"), {
        author: userData.name,
        authorId: userData.id,
        content,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });
      // we rely on realtime snapshot to replace temporary post with real one;
      setToast("Post berhasil dibuat");
    } catch (err) {
      console.error("Create post error:", err);
      // rollback optimistic UI
      setPosts(prev => prev.filter(p => p.id !== tempId));
      setToast("Gagal membuat post");
    } finally {
      setCreatingPost(false);
    }
  };

  /* -------------------- REPLY -------------------- */
  const handleReply = async (postId) => {
    const contentRaw = (replyContent[postId] || "").trim();
    if (!userData?.id) return setToast("User belum terdeteksi!");
    if (!contentRaw) return setToast("Tulis balasan dulu!");
    if (contentRaw.length > MAX_REPLY_LENGTH) return setToast(`Panjang balasan maksimal ${MAX_REPLY_LENGTH} karakter`);

    // optimistic update: append reply locally
    const tempReplyId = `temp-reply-${Date.now()}`;
    const tempReply = {
      id: tempReplyId,
      author: userData.name,
      authorId: userData.id,
      content: escapeHtml(contentRaw),
      createdAt: new Date(),
      optimistic: true,
    };
    setRepliesData(prev => {
      const copy = { ...prev };
      copy[postId] = [...(copy[postId] || []), tempReply];
      return copy;
    });
    setReplyContent(prev => ({ ...prev, [postId]: "" }));
    setShowReplyForm(prev => ({ ...prev, [postId]: false }));

    try {
      await addDoc(collection(db, "forum", postId, "replies"), {
        author: userData.name,
        authorId: userData.id,
        content: contentRaw,
        createdAt: serverTimestamp(),
      });
      setToast("Balasan terkirim");
    } catch (err) {
      console.error("Reply error:", err);
      // rollback optimistic reply
      setRepliesData(prev => {
        const copy = { ...prev };
        copy[postId] = (copy[postId] || []).filter(r => r.id !== tempReplyId);
        return copy;
      });
      setToast("Gagal mengirim balasan");
    }
  };

  /* -------------------- LIKE (optimistic) -------------------- */
  const toggleLike = async (postId, likedBy = []) => {
    if (!userData?.id) return setToast("User belum terdeteksi!");
    if (likingRef.current.has(postId)) return; // prevent spamming
    likingRef.current.add(postId);

    // optimistic UI change
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const hasLiked = (p.likedBy || []).includes(userData.id);
      const newLikedBy = hasLiked ? (p.likedBy || []).filter(id => id !== userData.id) : [...(p.likedBy || []), userData.id];
      return { ...p, likedBy: newLikedBy, likes: (p.likes || 0) + (hasLiked ? -1 : 1) };
    }));

    try {
      const ref = doc(db, "forum", postId);
      const hasLiked = (likedBy || []).includes(userData.id);
      // server update
      await updateDoc(ref, {
        likes: increment(hasLiked ? -1 : +1),
        likedBy: hasLiked ? arrayRemove(userData.id) : arrayUnion(userData.id),
      });
    } catch (err) {
      console.error("Like toggle error:", err);
      setToast("Gagal memperbarui like");
      // best-effort: revert by reloading the post from server (simple approach)
      // we could also more precisely revert, but keeping it simple:
      // Note: realtime listener should sync soon; as fallback, reload posts:
      try {
        const col = collection(db, "forum");
        const q = query(col, orderBy("createdAt", "desc"), fsLimit(PAGE_SIZE));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
    } finally {
      likingRef.current.delete(postId);
    }
  };

  /* -------------------- EDIT via modal -------------------- */
  const openEditPost = (postId, currentContent) => {
    setEditModal({ open: true, type: "post", postId, replyId: null, content: currentContent });
  };
  const openEditReply = (postId, replyId, currentContent) => {
    setEditModal({ open: true, type: "reply", postId, replyId, content: currentContent });
  };

  const submitEdit = async () => {
    const { type, postId, replyId, content } = editModal;
    try {
      if (type === "post") {
        await updateDoc(doc(db, "forum", postId), { content });
        setToast("Post diupdate");
      } else if (type === "reply") {
        await updateDoc(doc(db, "forum", postId, "replies", replyId), { content });
        setToast("Balasan diupdate");
      }
      setEditModal({ open: false, type: null, postId: null, replyId: null, content: "" });
    } catch (err) {
      console.error("Edit submit error:", err);
      setToast("Gagal mengupdate");
    }
  };

  /* -------------------- DELETE via confirm modal -------------------- */
  const confirmDeletePost = (postId) => {
    setConfirmModal({ open: true, action: "deletePost", payload: postId });
  };
  const confirmDeleteReply = (postId, replyId) => {
    setConfirmModal({ open: true, action: "deleteReply", payload: { postId, replyId } });
  };

  const performConfirmedAction = async () => {
    const { action, payload } = confirmModal;
    try {
      if (action === "deletePost") {
        await deleteDoc(doc(db, "forum", payload));
        setToast("Post dihapus");
      } else if (action === "deleteReply") {
        await deleteDoc(doc(db, "forum", payload.postId, "replies", payload.replyId));
        setToast("Balasan dihapus");
      }
    } catch (err) {
      console.error("Confirm action error:", err);
      setToast("Gagal menghapus");
    } finally {
      setConfirmModal({ open: false, action: null, payload: null });
    }
  };

  /* -------------------- small toast handling -------------------- */
  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast]);

  /* -------------------- clean up on unmount -------------------- */
  useEffect(() => {
    return () => {
      Object.values(replyUnsubs.current || {}).forEach(fn => {
        try { fn(); } catch {}
      });
      replyUnsubs.current = {};
    };
  }, []);

  /* -------------------- Render -------------------- */
  if (!userData) return <div className="p-6"><Spinner /></div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Forum Petani 💬</h1>
          <div className="text-sm text-gray-600">Signed in as <strong>{userData.name}</strong></div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed right-6 top-6 z-50 bg-green-700 text-white px-4 py-2 rounded shadow">
            {toast}
          </div>
        )}

        {/* Create Post */}
        <div className="mb-6 bg-white p-4 rounded shadow">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Tulis post baru..."
            className="w-full p-2 border rounded mb-2 resize-none min-h-[80px]"
            maxLength={MAX_POST_LENGTH}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">{newPost.length}/{MAX_POST_LENGTH}</div>
            <div className="flex gap-2">
              <button
                onClick={() => { setNewPost(""); }}
                className="px-3 py-1 rounded border text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleCreatePost}
                disabled={creatingPost}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              >
                {creatingPost ? "Memproses..." : "Tambah Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        {loadingPosts ? (
          <Spinner />
        ) : errorPosts ? (
          <div className="text-red-600">{errorPosts}</div>
        ) : (
          <>
            {posts.length === 0 && <div className="text-gray-500">Belum ada post.</div>}

            {posts.map((post) => {
              const liked = (post.likedBy || []).includes(userData.id);
              return (
                <article key={post.id} className="bg-white p-4 rounded shadow mb-4">
                  <header className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-xs text-gray-400">
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : (post.createdAt?.toString ? post.createdAt.toString() : "")}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggleLike(post.id, post.likedBy)}
                        className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${liked ? "bg-red-500 text-white" : "bg-white border"}`}
                      >
                        ❤️ {post.likes || 0}
                      </button>

                      {(userData.role === "admin" || userData.id === post.authorId) && (
                        <>
                          <button onClick={() => openEditPost(post.id, post.content)} className="px-2 py-1 rounded bg-yellow-400 text-sm">Edit</button>
                          <button onClick={() => confirmDeletePost(post.id)} className="px-2 py-1 rounded bg-red-500 text-white text-sm">Hapus</button>
                        </>
                      )}
                    </div>
                  </header>

                  <div className="mt-3 break-words text-gray-800" dangerouslySetInnerHTML={{ __html: escapeHtml(post.content) }} />

                  {/* Reply controls */}
                  <div className="mt-3">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    >
                      {showReplyForm[post.id] ? "Batal" : "Balas"}
                    </button>
                    {showReplyForm[post.id] && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Tulis balasan..."
                          value={replyContent[post.id] || ""}
                          onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="border p-2 rounded flex-1"
                          maxLength={MAX_REPLY_LENGTH}
                        />
                        <button onClick={() => handleReply(post.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Kirim</button>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  <div className="mt-4 space-y-3">
                    {(repliesData[post.id] || []).map((r) => (
                      <div key={r.id} className="pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{r.author}</p>
                            <p className="text-xs text-gray-400">
                              {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : (r.createdAt?.toString ? r.createdAt.toString() : "")}
                            </p>
                          </div>
                          {(userData.role === "admin" || userData.id === r.authorId) && (
                            <div className="flex gap-2">
                              <button onClick={() => openEditReply(post.id, r.id, r.content)} className="px-2 py-1 text-sm rounded bg-yellow-300">Edit</button>
                              <button onClick={() => confirmDeleteReply(post.id, r.id)} className="px-2 py-1 text-sm rounded bg-red-500 text-white">Hapus</button>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-gray-700 break-words" dangerouslySetInnerHTML={{ __html: escapeHtml(r.content) }} />
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}

            {/* Load more */}
            <div className="flex justify-center mt-6">
              {hasMore ? (
                <button onClick={loadMore} className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200">Load more</button>
              ) : (
                <div className="text-sm text-gray-400">Tidak ada post lagi</div>
              )}
            </div>
          </>
        )}

        {/* Edit Modal */}
        <Modal open={editModal.open} title={editModal.type === "post" ? "Edit Post" : "Edit Balasan"} onClose={() => setEditModal({ open: false, type: null, content: "" })}>
          <textarea
            value={editModal.content}
            onChange={(e) => setEditModal(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border p-2 rounded h-32"
          />
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setEditModal({ open: false, type: null, content: "" })} className="px-3 py-1 rounded border">Batal</button>
            <button onClick={submitEdit} className="px-3 py-1 rounded bg-green-600 text-white">Simpan</button>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <Modal open={confirmModal.open} title="Konfirmasi" onClose={() => setConfirmModal({ open: false, action: null, payload: null })}>
          <p>Apakah kamu yakin ingin menghapus?</p>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setConfirmModal({ open: false, action: null, payload: null })} className="px-3 py-1 rounded border">Batal</button>
            <button onClick={performConfirmedAction} className="px-3 py-1 rounded bg-red-600 text-white">Hapus</button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
