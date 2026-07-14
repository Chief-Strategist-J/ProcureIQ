import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { SignalingHandler } from "./handlers/signaling";

export class ApiV1Router {
  private wss: WebSocketServer;

  constructor(
    private readonly server: Server,
    private readonly signalingHandler: SignalingHandler
  ) {
    // Mount the WebSocket server to the existing HTTP server instance
    this.wss = new WebSocketServer({
      server,
      path: "/api/v1/webrtc/signaling"
    });
  }

  public init(): void {
    this.wss.on("connection", (socket: WebSocket) => {
      this.signalingHandler.handleConnection(socket);
    });

    console.log("[webrtc-router] Mounted WebSocket signaling endpoint at ws://localhost:8082/api/v1/webrtc/signaling");
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        resolve();
      });
    });
  }
}
