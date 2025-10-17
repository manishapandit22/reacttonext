import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SinglePost from "@/components/resources/SinglePost";

export const metadata = {
  title: "Single Post || Openbook | AI create what you want game",
};

export default function SinglePostPage({ params }) {
  return (
    <>
    <Header />
      <main className="pt-[5.5rem] lg:pt-24">
        <SinglePost slug={params.slug} />
      </main>
    <Footer />
    </>
  );
}
