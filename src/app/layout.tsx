import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast"; // Optional: For toast notifications

export const metadata = {
  title: "My Collab App",
  description: "A collaborative board application",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {

  


  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
