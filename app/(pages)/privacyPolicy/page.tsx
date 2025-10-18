
import PrivacyPolicy from "@/components/pages/terms/PrivacyPolicy";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export const metadata = {
  title: "Create Game || OpenBook.Games",
};

export default function PrivacyAndPolicy() {
  return (
    <>
      <Header />
      <main>
        <PrivacyPolicy />
      </main>
      <Footer />
    </>
  );
}
