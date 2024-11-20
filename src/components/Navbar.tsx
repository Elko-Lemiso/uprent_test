"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";

const Navbar = () => {
  const { token, logout, username } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <Link href="/" className="text-white text-lg font-semibold">
        My Collab App
      </Link>
      {token && (
        <div className="flex items-center space-x-4">
          <span className="text-white">Hello, {username}</span>
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
