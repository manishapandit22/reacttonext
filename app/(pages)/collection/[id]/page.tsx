import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Banner from "@/components/pages/collection/Banner";
import Collection from "@/components/pages/collection/Collection";
import Profile from "@/components/pages/collection/Profile";
import { Metadata } from "next";
import { CollectionPageParams } from "@/types";

export const metadata: Metadata = {
  title: "Collection Details || Xhibiter | NFT Marketplace Nextjs Template",
};

export default async function CollectionSinglePage({ params }: CollectionPageParams) {
  const { id } = await params;
  
  return (
    <>
      <Header />
      <main className="pt-[5.5rem] lg:pt-24">
        <Banner />
        <Profile id={id} />
        <Collection />
      </main>
      <Footer />
    </>
  );
}

