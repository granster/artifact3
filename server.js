const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const floorData = {
  "1": {
    id: 1,
    name: "Floor 1",
    theme: "Welcome + Community",
    facts: [
      "Reception desk and welcome area",
      "Student support and counseling",
      "Fast access to campus grounds"
    ]
  },
  "2": {
    id: 2,
    name: "Floor 2",
    theme: "Core Learning",
    facts: [
      "Main classrooms and teacher offices",
      "Computer suite and study hall",
      "Central hallway between wings"
    ]
  },
  "3": {
    id: 3,
    name: "Floor 3",
    theme: "Advanced Spaces",
    facts: [
      "Science labs and project rooms",
      "Quiet reading and study corners",
      "Top-floor views with natural light"
    ]
  }
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function serveStatic(res, pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = path.normalize(decodedPath);
  const safePath = normalizedPath.replace(/^(\.\.[/\\])+/, "");
  const cleanedPath = safePath.replace(/^[/\\]+/, "");
  const relativePath = safePath === "/" || safePath === "\\" || cleanedPath === "" ? "index.html" : cleanedPath;
  const filePath = path.join(ROOT, relativePath);

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Forbidden path" });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "artifact3-node-server" });
    return;
  }

  if (pathname === "/api/floors") {
    sendJson(res, 200, { floors: Object.values(floorData) });
    return;
  }

  if (pathname.startsWith("/api/floors/")) {
    const floorId = pathname.split("/").pop();
    const floor = floorData[floorId];
    if (!floor) {
      sendJson(res, 404, { error: "Floor not found" });
      return;
    }
    sendJson(res, 200, floor);
    return;
  }

  serveStatic(res, pathname);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
