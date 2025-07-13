"use client";

import { usePathname } from "next/navigation";
import HeaderTop from "@/app/components/HeaderTop";
import HeaderMain from "@/app/components/HeaderMain";
import Navbar from "@/app/components/Navbar";
import MobNavbar from "@/app/components/MobNavbar";
import Footer from "@/app/components/Footer";
import ChatButton from "./components/ChatButton";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = pathname === "/";
  const isHome = pathname === "/home";

  return (
    <html lang="en">
      <body>
        {!isAuth && (
          <>
            {isHome && <HeaderTop />}
            <HeaderMain />
            <Navbar />
            <ChatButton />
          </>
        )}

        {children}
        <Footer />
      </body>
    </html>
  );
}
