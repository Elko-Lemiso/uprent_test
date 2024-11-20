// server.ts

import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import next from "next";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

// Initialize Next.js
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Prisma Client
const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Initialize Express App
const expressApp = express();

// Create HTTP server
const httpServer = createServer(expressApp);

// Initialize Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Change to your frontend URL in production
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

// Middleware to parse JSON
expressApp.use(express.json());

// Socket.io Authentication Middleware
io.use(async (socket: Socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error("Authentication token missing");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
    };
    // Attach user info to socket
    socket.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    next(new Error("Authentication error"));
  }
});

// Active Users Map: username -> socket.id
const activeUsers: Map<string, string> = new Map();

// Socket.io Connection Handling
io.on("connection", (socket: Socket) => {
  const user = socket.user as { id: number; username: string };

  // Prevent duplicate logins
  if (activeUsers.has(user.username)) {
    socket.emit("duplicateLogin", "Username is already in use.");
    socket.disconnect();
    return;
  }
  activeUsers.set(user.username, socket.id);
  console.log(`User connected: ${user.username}`);

  // Handle joining a board
  socket.on("joinBoard", async (boardId: number) => {
    if (!boardId || isNaN(boardId)) {
      socket.emit("error", "Invalid board ID.");
      return;
    }

    const boardRoom = `board-${boardId}`;
    socket.join(boardRoom);
    console.log(`${user.username} joined board ${boardId}`);

    // Fetch and send current canvas state
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (board?.canvas) {
      socket.emit("loadCanvas", board.canvas);
    }

    // Notify others in the room about the new user
    io.to(boardRoom).emit("userJoined", user.username);

    // Optionally, send the list of connected users in the board
    const clients = await io.in(boardRoom).allSockets();
    const usernames = Array.from(clients)
      .map((socketId) => {
        const clientSocket = io.sockets.sockets.get(socketId);
        return clientSocket?.user.username;
      })
      .filter(Boolean) as string[];
    socket.emit("currentUsers", usernames);
  });

  // Handle canvas updates
  socket.on("canvasUpdate", async (canvasData: string) => {
    const rooms = Array.from(socket.rooms);
    const boardRoom = rooms.find((room) => room.startsWith("board-"));
    if (!boardRoom) {
      socket.emit("error", "You are not in any board.");
      return;
    }

    const boardId = parseInt(boardRoom.split("-")[1], 10);
    if (isNaN(boardId)) {
      socket.emit("error", "Invalid board ID.");
      return;
    }

    // Update canvas data in the database
    try {
      await prisma.board.update({
        where: { id: boardId },
        data: { canvas: canvasData },
      });
    } catch (err) {
      console.error("Error updating canvas:", err);
      socket.emit("error", "Failed to update canvas.");
      return;
    }

    // Broadcast the updated canvas to other users in the board
    socket.to(boardRoom).emit("canvasUpdate", canvasData);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    activeUsers.delete(user.username);
    console.log(`User disconnected: ${user.username}`);

    // Notify others in the board about the user leaving
    socket.rooms.forEach((room) => {
      if (room.startsWith("board-")) {
        io.to(room).emit("userLeft", user.username);
      }
    });
  });
});

// Handle Next.js requests through Express
expressApp.all("*", (req, res) => {
  return handle(req, res);
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`> Server is running on http://localhost:${PORT}`);
});
