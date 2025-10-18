import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Banner from "@/components/pages/collection/Banner";
import Collcetions from "@/components/pages/user/Collcetions";
import { Metadata } from "next";
import { WorldPageParams } from "@/types";

export const metadata: Metadata = {
  title: "World Details || Xhibiter | NFT Marketplace Nextjs Template",
};

export default async function WorldDetailPage({ params }: WorldPageParams) {
  const { worldID } = await params;
  
  return (
    <>
      <Header />
      <main className="mt-24">
        <Banner />
        <Collcetions />
      </main>
      <Footer />
    </>
  );
}

