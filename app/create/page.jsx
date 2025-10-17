"use client";

import { useState, useEffect } from "react";
import Create from "@/components/create_async/Create";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import GameFormSkeleton from "@/components/skeleton/GameFormSkeleton";
import GameContextProvider from "@/contexts/GameContext";

export default function CreatePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
        <GameContextProvider>
          {isLoaded ? <Create /> : <GameFormSkeleton />}
        </GameContextProvider>
      <Footer />
    </>
  );
}
