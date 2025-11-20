import Cookies from "cookies";

export default function handler(req, res) {
  const cookies = new Cookies(req, res);
  cookies.set("user", "", { maxAge: 0 });
  res.status(200).json({ success: true });
}
