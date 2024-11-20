export interface JoinBoardPayload {
  boardId: number;
}

export interface CanvasUpdatePayload {
  boardId: number;
  canvas: string; // JSON string of the canvas state
}

export interface UserJoinedPayload {
  username: string;
}

export interface LoadCanvasPayload {
  canvasData: string;
}

export interface DuplicateLoginPayload {
  message: string;
}

export interface BoardDetails {
  id: number;
  name: string;
}
