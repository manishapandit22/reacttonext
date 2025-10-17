import CreatorsList from "@/components/common/CreatorsList";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import CreatorSection from "@/components/home/CreatorSection";
import ForPlayers from "@/components/home/ForPlayers";
import Intro from "@/components/home/Intro";
import Process from "@/components/home/Process";
import InteractiveDemo from "@/components/home/InteractiveDemo";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import CoverFlowSlider from "@/components/home/CoverFlowSlider";

export const metadata = {
  title: "OpenBook.Games",
};

// Function to fetch games with caching
async function getShowcasedGames() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = `${baseUrl}/ai-games/api/showcased-games/`;
  const fallbackGames = [];

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 1 day (86400 seconds)
    });

    if (!response.ok) {
      console.error(`Error fetching games: ${response.status} ${response.statusText}`);
      return fallbackGames;
    }

    const data = await response.json();

    if (data?.success?.data) {
      const gamesData = data.success.data;
      return gamesData;
    } else {
      console.error("Unexpected response structure:", data);
      return fallbackGames; 
    }
  } catch (err) {
    console.error("Error fetching showcased games:", err);
    return fallbackGames; 
  }
}


export default async function Home() {
  const games = await getShowcasedGames(); 

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CoverFlowSlider games={games} /> {/* Pass games as props */}
        {/* <Intro /> */}
        <CreatorSection />

        {/* <section className="container flex flex-col py-24">
          <div className="flex items-center justify-between mb-8 ">
            <h2 className="text-center font-display text-3xl text-jacarta-700 dark:text-white">
              <span
                className="mr-4 inline-block h-6 w-6 animate-heartBeat bg-contain bg-center text-xl"
                style={{
                  backgroundImage:
                    "url(https://cdn.jsdelivr.net/npm/emoji-datasource-apple@7.0.2/img/apple/64/2764-fe0f.png)",
                }}
              ></span>
              Top creators
            </h2>{" "}
            <Link
              href="/all-creators"
              className="self-center inline-block rounded-md bg-accent-dark py-3 px-8 text-center font-semibold text-white  transition-all hover:bg-accent-dark"
            >
              Show All
            </Link>
          </div>
          <CreatorsList />
        </section> */}
        {/* <Process /> */}
        {/* <InteractiveDemo /> */}
        <ForPlayers />
      </main>
      <Footer />
    </>
  );
}
