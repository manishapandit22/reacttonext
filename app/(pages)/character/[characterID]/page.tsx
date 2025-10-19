import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import ItemDetails from "@/components/pages/item/ItemDetails";
import { Metadata } from "next";
import { CharacterPageParams } from "@/types";

export const metadata: Metadata = {
  title: "Character Details || Xhibiter | NFT Marketplace Nextjs Template",
};

export default async function CharacterDetailPage({ params }: CharacterPageParams) {
  const { characterID } = await params;
  
  return (
    <>
      <Header />
      <main className="mt-24">
        <ItemDetails id={characterID} />
      </main>
      <Footer />
    </>
  );
}

