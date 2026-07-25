
export class WebRtcSignalingClient {
  private ws: WebSocket | null = null;

  constructor(
    private serverUrl: string,
    private roomId: string,
    private userId: string,
    private onMessage: (message: any) => void
  ) {}

  
  public connect(): void {
    this.ws = new WebSocket(this.serverUrl);

    this.ws.onopen = () => {
      console.log(`[webrtc-client] Connected to signaling server at ${this.serverUrl}`);
      this.send({
        type: "join",
        roomId: this.roomId,
        userId: this.userId
      });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[webrtc-client] Received message:", message);
        this.onMessage(message);
      } catch (err) {
        console.error("[webrtc-client] Failed to parse message:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("[webrtc-client] Disconnected from signaling server.");
    };

    this.ws.onerror = (err) => {
      console.error("[webrtc-client] WebSocket error:", err);
    };
  }

  
  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[webrtc-client] WebSocket is not open. Message queued or lost.");
    }
  }

  
  public sendOffer(receiverId: string, sdp: string): void {
    this.send({
      type: "offer",
      roomId: this.roomId,
      senderId: this.userId,
      receiverId,
      sdp
    });
  }

  
  public sendAnswer(receiverId: string, sdp: string): void {
    this.send({
      type: "answer",
      roomId: this.roomId,
      senderId: this.userId,
      receiverId,
      sdp
    });
  }

  
  public sendCandidate(
    receiverId: string,
    candidate: string,
    sdpMid: string,
    sdpMLineIndex: number
  ): void {
    this.send({
      type: "candidate",
      roomId: this.roomId,
      senderId: this.userId,
      receiverId,
      candidate,
      sdpMid,
      sdpMLineIndex
    });
  }

  
  public disconnect(): void {
    if (this.ws) {
      this.send({
        type: "leave",
        roomId: this.roomId,
        userId: this.userId
      });
      this.ws.close();
    }
  }
}
