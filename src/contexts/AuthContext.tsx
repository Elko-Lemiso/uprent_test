// src/context/AuthContext.tsx

"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { JwtPayload } from "@/lib/jwt";

interface AuthContextType {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded: JwtPayload = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          setToken(storedToken);
          setUsername(decoded.username);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, []);

  const login = async (usernameInput: string, password: string) => {
    const res = await axios.post("/api/auth/login", {
      username: usernameInput,
      password,
    });
    const receivedToken: string = res.data.token;
    const decoded: JwtPayload = jwtDecode(receivedToken);
    setToken(receivedToken);
    setUsername(decoded.username);
    localStorage.setItem("token", receivedToken);
  };

  const register = async (usernameInput: string, password: string) => {
    const res = await axios.post("/api/auth/register", {
      username: usernameInput,
      password,
    });
    const receivedToken: string = res.data.token;
    const decoded: JwtPayload = jwtDecode(receivedToken);
    setToken(receivedToken);
    setUsername(decoded.username);
    localStorage.setItem("token", receivedToken);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ token, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
