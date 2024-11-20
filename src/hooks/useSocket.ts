import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  JoinBoardPayload,
  CanvasUpdatePayload,
  UserJoinedPayload,
  LoadCanvasPayload,
  DuplicateLoginPayload,
} from "@/types/socket";

interface ServerToClientEvents {
  duplicateLogin: (payload: DuplicateLoginPayload) => void;
  loadCanvas: (payload: LoadCanvasPayload) => void;
  canvasUpdate: (payload: CanvasUpdatePayload) => void;
  userJoined: (payload: UserJoinedPayload) => void;
}

interface ClientToServerEvents {
  joinBoard: (payload: JoinBoardPayload) => void;
  canvasUpdate: (payload: CanvasUpdatePayload) => void;
}

export const useSocket = (token: string | null) => {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3000", {
      auth: { token },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
