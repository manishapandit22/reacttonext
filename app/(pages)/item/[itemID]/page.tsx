import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Banner from "@/components/pages/collection/Banner";
import Collcetions from "@/components/pages/user/Collcetions";
import { Metadata } from "next";
import { ItemPageParams } from "@/types";

export const metadata: Metadata = {
  title: "Item Details || Xhibiter | NFT Marketplace Nextjs Template",
};

export default async function ItemDetailsPage({ params }: ItemPageParams) {
  const { itemID } = await params;
  
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

