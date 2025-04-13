"use client";

import { usePathname } from "next/navigation";
import HeaderTop from "@/app/components/HeaderTop";
import HeaderMain from "@/app/components/HeaderMain";
import Navbar from "@/app/components/Navbar";
import MobNavbar from "@/app/components/MobNavbar";
import Footer from "@/app/components/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome && <HeaderTop />}
      <HeaderMain />
      <Navbar />
      <MobNavbar />
      {children}
      <Footer />
    </>
  );
}
