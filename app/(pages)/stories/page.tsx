import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Collections from "@/components/pages/stories-collection/Collections";

export const metadata = {
  title:
    "Games | OpenBook.Games",
};

export default function CollectionWideSidebarPage() {
  return (
    <>
      <Header/>
      <main className="mt-24">
        <Collections/>
      </main>
      <Footer />
    </>
  );
}
