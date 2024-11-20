// src/app/boards/page.tsx

"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Board {
  id: number;
  name: string;
}

const BoardListPage = () => {
  const { token } = useContext(AuthContext);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchBoards = async () => {
      if (!token) {
        return;
      }
      try {
        const res = await axios.get("/api/boards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoards(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBoards();
  }, [token]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/boards",
        { name: boardName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoards([...boards, res.data]);
      router.push(`/boards/${res.data.id}`);
    } catch (error) {
      console.log(error);

      alert("Failed to create board.");
    }
  };

  const handleOpenBoard = (id: number) => {
    router.push(`/boards/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-3xl mb-6">Boards</h1>
        <form onSubmit={handleCreateBoard} className="mb-6">
          <input
            type="text"
            className="px-3 py-2 border rounded mr-2"
            placeholder="New Board Name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            required
            minLength={3}
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </form>
        <ul>
          {boards.map((board) => (
            <li key={board.id} className="mb-2">
              <button
                onClick={() => handleOpenBoard(board.id)}
                className="text-blue-500 underline"
              >
                {board.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
};

export default BoardListPage;
