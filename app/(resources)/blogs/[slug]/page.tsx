import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SinglePost from "@/components/resources/SinglePost";
import { Metadata } from "next";
import { BlogPageParams } from "@/types";

export const metadata: Metadata = {
  title: "Single Post || Openbook | AI create what you want game",
};

export default async function SinglePostPage({ params }: BlogPageParams) {
  const { slug } = await params;
  
  return (
    <>
    <Header />
      <main className="pt-[5.5rem] lg:pt-24">
        <SinglePost slug={slug} />
      </main>
    <Footer />
    </>
  );
}

