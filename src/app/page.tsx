// src/app/page.tsx

"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { token, username } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Collab App</h1>
      {token ? (
        <>
          <p className="text-lg mb-4">Hello, {username}!</p>
          <Link href="/boards">
            <Button>Go to Boards</Button>
          </Link>
        </>
      ) : (
        <>
          <p className="text-lg mb-4">Please log in or register to continue.</p>
          <div className="flex space-x-4">
            <Link href="/auth">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
