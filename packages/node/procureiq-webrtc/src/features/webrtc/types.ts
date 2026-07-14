import { WebSocket } from "ws";

export interface Peer {
  userId: string;
  socket: WebSocket;
}

export interface Room {
  roomId: string;
  peers: Map<string, Peer>; // userId -> Peer
}

export type SignalingMessage =
  | JoinMessage
  | LeaveMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage;

export interface JoinMessage {
  type: "join";
  roomId: string;
  userId: string;
}

export interface LeaveMessage {
  type: "leave";
  roomId: string;
  userId: string;
}

export interface OfferMessage {
  type: "offer";
  roomId: string;
  senderId: string;
  receiverId: string;
  sdp: string;
}

export interface AnswerMessage {
  type: "answer";
  roomId: string;
  senderId: string;
  receiverId: string;
  sdp: string;
}

export interface IceCandidateMessage {
  type: "candidate";
  roomId: string;
  senderId: string;
  receiverId: string;
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
}
