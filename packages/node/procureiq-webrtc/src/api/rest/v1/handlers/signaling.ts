import { WebSocket } from "ws";
import { WebRtcService } from "../../../../features/webrtc";

export class SignalingHandler {
  constructor(private readonly webrtcService: WebRtcService) {}

  public handleConnection(socket: WebSocket): void {
    console.log("[webrtc-signaling] New client socket connected.");

    socket.on("message", (data: string) => {
      this.webrtcService.handleMessage(socket, data.toString());
    });

    socket.on("close", () => {
      console.log("[webrtc-signaling] Client socket connection closed.");
      this.webrtcService.handleDisconnect(socket);
    });

    socket.on("error", (err) => {
      console.error("[webrtc-signaling] Socket error occurred:", err);
      this.webrtcService.handleDisconnect(socket);
    });
  }
}
