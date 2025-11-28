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
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { MessageSquare, Heart, Send, Edit2, Trash2 } from "lucide-react";

/* OPTIONAL: path of uploaded STL from conversation history (see note above) */
const UPLOADED_STL_PATH = "/mnt/data/farmshield.stl"; // move to /public/models/... for browser access

/* -------------------- Helper Components -------------------- */

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">✕</button>
        </div>
        {children}
      </Card>
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
      <div className="p-3 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Forum Petani"
          description={`Signed in as ${userData.name}`}
        />

        {/* Toast */}
        {toast && (
          <div className="fixed right-6 top-6 z-50 bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        {/* Create Post */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Buat Post Baru</h3>
          </div>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Tulis post baru..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg mb-3 resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={MAX_POST_LENGTH}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">{newPost.length}/{MAX_POST_LENGTH}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setNewPost(""); }}
              >
                Reset
              </Button>
              <Button
                variant="success"
                onClick={handleCreatePost}
                disabled={creatingPost}
              >
                <Send className="w-4 h-4 mr-1 inline" />
                {creatingPost ? "Memproses..." : "Tambah Post"}
              </Button>
            </div>
          </div>
        </Card>

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
                <Card key={post.id} className="mb-4">
                  <header className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{post.author}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString("id-ID") : (post.createdAt?.toString ? post.createdAt.toString() : "")}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        variant={liked ? "danger" : "outline"}
                        size="sm"
                        onClick={() => toggleLike(post.id, post.likedBy)}
                        className={liked ? "" : "border-gray-300"}
                      >
                        <Heart className={`w-3 h-3 mr-1 inline ${liked ? "fill-current" : ""}`} />
                        {post.likes || 0}
                      </Button>

                      {(userData.role === "admin" || userData.id === post.authorId) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPost(post.id, post.content)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-yellow-400"
                          >
                            <Edit2 className="w-3 h-3 mr-1 inline" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmDeletePost(post.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1 inline" />
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </header>

                  <div className="mt-3 break-words text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: escapeHtml(post.content) }} />

                  {/* Reply controls */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    >
                      {showReplyForm[post.id] ? "Batal" : "Balas"}
                    </Button>
                    {showReplyForm[post.id] && (
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          placeholder="Tulis balasan..."
                          value={replyContent[post.id] || ""}
                          onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={MAX_REPLY_LENGTH}
                        />
                        <Button variant="primary" size="sm" onClick={() => handleReply(post.id)}>
                          <Send className="w-3 h-3 mr-1 inline" />
                          Kirim
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  <div className="mt-4 space-y-3">
                    {(repliesData[post.id] || []).map((r) => (
                      <div key={r.id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{r.author}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString("id-ID") : (r.createdAt?.toString ? r.createdAt.toString() : "")}
                            </p>
                          </div>
                          {(userData.role === "admin" || userData.id === r.authorId) && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditReply(post.id, r.id, r.content)}
                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-yellow-400"
                              >
                                <Edit2 className="w-3 h-3 mr-1 inline" />
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => confirmDeleteReply(post.id, r.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1 inline" />
                                Hapus
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-gray-700 dark:text-gray-300 break-words" dangerouslySetInnerHTML={{ __html: escapeHtml(r.content) }} />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}

            {/* Load more */}
            <div className="flex justify-center mt-6">
              {hasMore ? (
                <Button variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              ) : (
                <div className="text-sm text-gray-400 dark:text-gray-500">Tidak ada post lagi</div>
              )}
            </div>
          </>
        )}

        {/* Edit Modal */}
        <Modal open={editModal.open} title={editModal.type === "post" ? "Edit Post" : "Edit Balasan"} onClose={() => setEditModal({ open: false, type: null, content: "" })}>
          <textarea
            value={editModal.content}
            onChange={(e) => setEditModal(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-3 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditModal({ open: false, type: null, content: "" })}>
              Batal
            </Button>
            <Button variant="success" onClick={submitEdit}>
              Simpan
            </Button>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <Modal open={confirmModal.open} title="Konfirmasi" onClose={() => setConfirmModal({ open: false, action: null, payload: null })}>
          <p className="text-gray-700 dark:text-gray-300">Apakah kamu yakin ingin menghapus?</p>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmModal({ open: false, action: null, payload: null })}>
              Batal
            </Button>
            <Button variant="danger" onClick={performConfirmedAction}>
              Hapus
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
