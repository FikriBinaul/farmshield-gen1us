export default function handler(req, res) {
  // Clear cookie using Next.js res.setHeader (compatible with Vercel)
  res.setHeader('Set-Cookie', 'user=; Max-Age=0; Path=/; SameSite=Lax');
  res.status(200).json({ success: true });
}
