import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingChatWidget />
    </div>
  );
}

export default Layout;
