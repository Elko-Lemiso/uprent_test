// src/app/api/boards/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, JwtPayload } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded: JwtPayload = verifyToken(token);
    const boards = await prisma.board.findMany({
      where: { creatorId: decoded.id },
      select: { id: true, name: true },
    });
    return NextResponse.json(boards, { status: 200 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded: JwtPayload = verifyToken(token);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Board name is required." },
        { status: 400 }
      );
    }

    const existingBoard = await prisma.board.findUnique({ where: { name } });
    if (existingBoard) {
      return NextResponse.json(
        { message: "Board name already exists." },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        name,
        creatorId: decoded.id,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
