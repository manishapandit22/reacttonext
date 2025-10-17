import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import GameDetails from "@/components/pages/game/GameDetails";

// Function to fetch game data for metadata generation
async function getGameData(gameId) {
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
export async function generateMetadata({ params }) {
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

  let ogWidth, ogHeight;
  
  if (isUsingNpcImage) {
    ogWidth = undefined;
    ogHeight = undefined;
  } else {
    ogWidth = 1200;
    ogHeight = 1200;
  }
  
  const imageType = (imageUrl || '').toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const imageObject = {
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
    description: truncatedDescription || "Explore this interactive game on OpenBook.Games",
    openGraph: {
      title: gameData.game_name,
      description: truncatedDescription || "Explore this interactive game on OpenBook.Games",
      url: gameUrl,
      siteName: "OpenBook.Games",
      images: [imageObject],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: gameData.game_name,
      description: truncatedDescription || "Explore this interactive game on OpenBook.Games",
      images: [
        {
          url: imageUrl,
          alt: gameData.game_name,
          ...(ogWidth && ogHeight && { width: ogWidth, height: ogHeight }),
        }
      ],
      creator: "@OpenBookGames", 
      site: "@OpenBookGames",
    },
    other: {
      ...(ogWidth && ogHeight && {
        'og:image:width': String(ogWidth),
        'og:image:height': String(ogHeight),
      }),
      'og:image:alt': gameData.game_name,
      'og:image:type': imageType,
      'theme-color': '#5865F2', 
    },
    alternates: {
      canonical: gameUrl,
    },
  };
}

// This is a Server Component that will be pre-rendered to HTML
export default async function GameDetailsPage({ params }) {
  // No need to fetch game data here as it's already fetched in generateMetadata
  // and the GameDetails component will fetch it again on the client side
  const { gameId } = await params;
  return (
    <>
      <Header />
      <main className="mt-24">
        <GameDetails id={gameId} />
      </main>
      <Footer />
    </>
  );
}