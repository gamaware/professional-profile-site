// Minimal static file server for local preview and Playwright tests.
// Serves the repository root and answers unknown paths with error.html and
// status 404, the same way the CloudFront custom error response does.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.endsWith("/") ? decoded + "index.html" : decoded;
  const full = normalize(join(ROOT, relative));
  return full.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep) ? full : null;
}

const server = createServer(async (req, res) => {
  const file = resolvePath(req.url || "/");
  const type = file ? TYPES[extname(file)] : undefined;
  try {
    if (!file || !type) throw new Error("not served");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": type });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    const body = await readFile(join(ROOT, "error.html"));
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(req.method === "HEAD" ? undefined : body);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving ${ROOT} at http://127.0.0.1:${PORT}`);
});
