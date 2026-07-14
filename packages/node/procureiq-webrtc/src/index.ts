import http from "http";
import { WebRtcService } from "./features/webrtc";
import { SignalingHandler } from "./api/rest/v1/handlers/signaling";
import { ApiV1Router } from "./api/rest/v1/router";

const PORT = process.env.PORT || 8082;

// Initialize Core Services
const webrtcService = new WebRtcService();
const signalingHandler = new SignalingHandler(webrtcService);

// Create HTTP Server
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "UP", service: "webrtc-signaling" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// Create and Initialize Router
const router = new ApiV1Router(server, signalingHandler);
router.init();

// Boot Server
server.listen(PORT, () => {
  console.log(`[webrtc-server] Booted successfully. Listening on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("[webrtc-server] Shutting down gracefully...");
  await router.close();
  server.close(() => {
    console.log("[webrtc-server] Server stopped. Goodbye.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
