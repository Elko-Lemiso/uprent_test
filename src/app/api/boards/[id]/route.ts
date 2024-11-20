// src/app/api/boards/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  const { id } = params;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    verifyToken(token) as { id: number; username: string };
    const board = await prisma.board.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true },
    });

    if (!board) {
      return NextResponse.json(
        { message: "Board not found." },
        { status: 404 }
      );
    }

    // Optionally, check if the user has access to the board
    // For simplicity, assuming all authenticated users can access all boards

    return NextResponse.json(board, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
