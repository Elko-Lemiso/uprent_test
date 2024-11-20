// src/components/CreateBoardModal.tsx

"use client";

import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

type CreateBoardModalProps = object;

const CreateBoardModal: React.FC<CreateBoardModalProps> = () => {
  const { token } = useContext(AuthContext);
  const [boardName, setBoardName] = useState("");
  const router = useRouter();

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/boards",
        { name: boardName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardName("");
      // Close the dialog by redirecting
      router.push(`/boards/${res.data.id}`);
    } catch (error) {
      console.log(error);

      alert("Failed to create board.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Board</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Create a New Board</DialogTitle>
          <DialogDescription className="mb-4">
            Please enter a name for your new board.
          </DialogDescription>
          <form
            onSubmit={handleCreateBoard}
            className="flex flex-col space-y-4"
          >
            <Input
              type="text"
              placeholder="Board Name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              required
              minLength={3}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CreateBoardModal;
