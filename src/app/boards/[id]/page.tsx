// src/app/boards/[id]/page.tsx

"use client";

import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { io, Socket } from "socket.io-client";
import * as fabric from "fabric"; // Correct import for fabric.js
import ProtectedRoute from "@/components/ProtectedRoute";

import toast from "react-hot-toast"; // For notifications

interface CanvasData {
  boardId: number;
  canvas: string;
}

const SingleBoardPage: React.FC = () => {
  const params = useParams();
  const idParam = params?.id;
  const boardId = Array.isArray(idParam)
    ? parseInt(idParam[0], 10)
    : parseInt(idParam || "0", 10);

  const { token, username } = useContext(AuthContext);
  const [boardName, setBoardName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]); // For real-time user list

  const canvasRef = useRef<fabric.Canvas | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.io
  useEffect(() => {
    if (!token) return; // Ensure token is available

    // Initialize Socket.io client
    const socket = io("http://localhost:3000", {
      auth: { token },
    });
    socketRef.current = socket;

    // Join the specific board room
    socket.emit("joinBoard", boardId);

    // Handle incoming canvas data
    socket.on("loadCanvas", (canvasData: string) => {
      if (canvasRef.current) {
        canvasRef.current.loadFromJSON(canvasData, () => {
          canvasRef.current?.renderAll();
        });
      }
    });

    socket.on("canvasUpdate", (canvasData: string) => {
      if (canvasRef.current) {
        // Prevent self-triggered updates
        const currentData = JSON.stringify(canvasRef.current.toJSON());
        if (currentData !== canvasData) {
          canvasRef.current.loadFromJSON(canvasData, () => {
            canvasRef.current?.renderAll();
          });
        }
      }
    });

    // Handle real-time user list updates
    socket.on("currentUsers", (users: string[]) => {
      setConnectedUsers(users);
    });

    socket.on("userJoined", (user: string) => {
      setConnectedUsers((prev) => [...prev, user]);
      toast.success(`${user} joined the board.`);
    });

    socket.on("userLeft", (user: string) => {
      setConnectedUsers((prev) => prev.filter((u) => u !== user));
      toast.info(`${user} left the board.`);
    });

    // Handle connection errors
    socket.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err.message);
      toast.error("Socket connection failed. Please try again.");
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [boardId, token]);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    const canvasElement = document.getElementById(
      "fabric-canvas"
    ) as HTMLCanvasElement;
    if (!canvasElement) return;

    const canvas = new fabric.Canvas("fabric-canvas", {
      isDrawingMode: true,
      backgroundColor: "#fff",
      selection: true,
    });
    canvasRef.current = canvas;

    // Adjust canvas size based on container
    const resizeCanvas = () => {
      const container = canvasElement.parentElement;
      if (container) {
        canvas.setWidth(container.clientWidth);
        canvas.setHeight(container.clientHeight);
        canvas.renderAll();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Handle canvas changes with debouncing
    let timeout: NodeJS.Timeout;
    const debounceTime = 300; // milliseconds

    const handleCanvasChange = () => {
      if (socketRef.current && canvasRef.current) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const canvasData = canvasRef.current
            ? JSON.stringify(canvasRef.current.toJSON())
            : "";
          socketRef.current?.emit("canvasUpdate", canvasData);
        }, debounceTime);
      }
    };

    // Listen to relevant canvas events
    canvas.on("object:added", handleCanvasChange);
    canvas.on("object:modified", handleCanvasChange);
    canvas.on("object:removed", handleCanvasChange);

    // Clean up on unmount
    return () => {
      clearTimeout(timeout);
      canvas.dispose();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [boardId]);

  // Fetch board details
  useEffect(() => {
    const fetchBoard = async () => {
      if (!token || boardId === 0) return;
      try {
        const res = await fetch(`/api/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBoardName(data.name);
        } else {
          console.error("Failed to fetch board details.");
          toast.error("Failed to fetch board details.");
        }
      } catch (error) {
        console.error("Error fetching board details:", error);
        toast.error("Error fetching board details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        loading
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-1/4 p-4 border-r overflow-y-auto flex flex-col">
          <h2 className="text-2xl mb-4">{boardName}</h2>
          <h3 className="text-xl mb-2">Connected Users:</h3>
          <ul className="mb-4">
            {connectedUsers.map((user, index) => (
              <li key={index} className="mb-1">
                {user}
              </li>
            ))}
          </ul>
          {/* Tools for Pencil and Sticker */}
          <div className="mt-auto space-x-2">
            <button
              onClick={() => {
                if (canvasRef.current) {
                  canvasRef.current.isDrawingMode = true;
                }
              }}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Pencil
            </button>
            <button
              onClick={() => {
                if (canvasRef.current) {
                  canvasRef.current.isDrawingMode = false;
                  const text = prompt("Enter sticker text:");
                  if (text) {
                    const textbox = new fabric.Textbox(text, {
                      left: 100,
                      top: 100,
                      fill: "#000",
                      fontSize: 20,
                    });
                    canvasRef.current.add(textbox);
                    canvasRef.current.renderAll();
                  }
                }
              }}
              className="bg-yellow-300 px-3 py-1 rounded"
            >
              Sticker
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <canvas id="fabric-canvas" className="border w-full h-full"></canvas>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SingleBoardPage;
