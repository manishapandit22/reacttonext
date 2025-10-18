import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import GameDetails from "@/components/pages/game/GameDetails";
import { Metadata } from "next";
import { GamePageParams } from "@/types";

// Function to fetch game data for metadata generation
async function getGameData(gameId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${gameId}`,
      { next: { revalidate: 60 } } // Revalidate every 60 seconds
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch game data: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success?.data || null;
  } catch (error) {
    console.error("Error fetching game data for metadata:", error);
    return null;
  }
}

// Generate metadata for the page based on game data
export async function generateMetadata({ params }: GamePageParams): Promise<Metadata> {
  const { gameId } = await params;
  const gameData = await getGameData(gameId);
  
  if (!gameData) {
    return {
      title: "Game Details | OpenBook.Games",
      description: "Explore interactive games on OpenBook.Games",
      openGraph: {
        images: [
          {
            url: "https://storage.googleapis.com/kraken-4aa67.appspot.com/website_media/public/images/Thmbnail.jpg",
            secureUrl: "https://storage.googleapis.com/kraken-4aa67.appspot.com/website_media/public/images/Thmbnail.jpg",
            width: 1200,
            height: 1200,
            alt: "OpenBook.Games"
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        images: [
          {
            url: "https://storage.googleapis.com/kraken-4aa67.appspot.com/website_media/public/images/Thmbnail.jpg",
            width: 1200,
            height: 1200,
            alt: "OpenBook.Games"
          }
        ]
      },
    };
  }
  
  // Base URL for canonical links and sharing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://krakengames.quest";
  const gameUrl = `${baseUrl}/games/${gameId}`;
  
  const isUsingNpcImage = gameData.preview_image_type === "video/mp4";
  
  const rawImageUrl = (isUsingNpcImage
    ? (gameData.game_npc && gameData.game_npc[0] && gameData.game_npc[0].npc_images && gameData.game_npc[0].npc_images[0] && gameData.game_npc[0].npc_images[0].url)
    : gameData.preview_image) || "https://storage.googleapis.com/kraken-4aa67.appspot.com/website_media/public/images/Thmbnail.jpg";

  const imageUrl = rawImageUrl && rawImageUrl.startsWith('http')
    ? rawImageUrl.replace('http://', 'https://')
    : rawImageUrl;

  const cleanDescription = (gameData.description || "").replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  const truncatedDescription = cleanDescription.length > 180 ? `${cleanDescription.slice(0, 177)}...` : cleanDescription;

  let ogWidth: number | undefined, ogHeight: number | undefined;
  
  if (isUsingNpcImage) {
    ogWidth = undefined;
    ogHeight = undefined;
  } else {
    ogWidth = 1200;
    ogHeight = 1200;
  }
  
  const imageType = (imageUrl || '').toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const imageObject: any = {
    url: imageUrl,
    secureUrl: imageUrl,
    alt: gameData.game_name,
    type: imageType,
  };

  if (ogWidth && ogHeight) {
    imageObject.width = ogWidth;
    imageObject.height = ogHeight;
  }

  return {
    title: `${gameData.game_name} | OpenBook.Games`,
    description: truncatedDescription || `Play ${gameData.game_name} on OpenBook.Games`,
    keywords: gameData.tags ? gameData.tags.join(", ") : "interactive game, AI game, OpenBook",
    authors: [{ name: gameData.creator_name || "OpenBook Creator" }],
    openGraph: {
      title: gameData.game_name,
      description: truncatedDescription || `Play ${gameData.game_name} on OpenBook.Games`,
      url: gameUrl,
      siteName: "OpenBook.Games",
      locale: "en_US",
      type: "article",
      publishedTime: gameData.created_at,
      modifiedTime: gameData.updated_at,
      images: [imageObject],
    },
    twitter: {
      card: "summary_large_image",
      title: gameData.game_name,
      description: truncatedDescription || `Play ${gameData.game_name} on OpenBook.Games`,
      creator: `@${gameData.creator_name || "OpenBook"}`,
      images: [imageObject],
    },
    alternates: {
      canonical: gameUrl,
    },
  };
}

export default async function GamePage({ params }: GamePageParams) {
  const { gameId } = await params;
  
  return (
    <>
      <Header />
      <main className="pt-[5.5rem] lg:pt-24">
        <GameDetails gameId={gameId} />
      </main>
      <Footer />
    </>
  );
}

