import Image from "next/image";
import Hero from "../components/Hero";
import NewProducts from "../components/NewProducts";
import Testimonials from "../components/Testimonials";
import ChatButton from "../components/ChatButton";

export default function Home() {
  return (
    <main>
      <Hero />
      <NewProducts />
      <Testimonials />
    </main>
  );
}
