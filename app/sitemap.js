import axios from 'axios';

/**
 * Fetches blog data from the CMS API
 * @returns {Promise<Array>} Array of blog posts
 */
async function getBlogData() {
  const CMS_API_BASE = process.env.BLOG_SERVER_URL || "https://cms.openbook.games";
  
  try {
    const response = await axios.get(`${CMS_API_BASE}/api/posts`);
     
    if (response.status === 200) {
      return response.data?.docs || [];
    } else {
      console.error("Failed to fetch blog data for sitemap");
      return [];
    }
  } catch (error) {
    console.error("Encountered error fetching blog data for sitemap", error);
    return [];
  }
}

/**
 * Fetches all games data
 * @returns {Promise<Array>} Array of all game objects
 */
async function getAllGames() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = `${baseUrl}/ai-games/games/all/published`;
  const fallbackGames = [];

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
    });

    if (!response.ok) {
      console.error(`Error fetching all games: ${response.status} ${response.statusText}`);
      return fallbackGames;
    }
    const data = await response.json();

    if(data.status=="success" && data.success.data){
      return data.success.data
    }

    return fallbackGames;
  } catch (err) {
    console.error("Error fetching all games:", err);
    return fallbackGames; 
  }
}

/**
 * Generates the sitemap for the website
 * @returns {Promise<Array>} Array of URL objects for the sitemap
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://openbook.games';
  const lastModified = new Date();

  // Fetch data for dynamic routes with error handling
  let blogPosts = [],  allGames = [];
  
  try {
    [blogPosts, allGames] = await Promise.all([
      getBlogData().catch(err => {
        console.error("Error fetching blog data for sitemap:", err);
        return [];
      }),
      getAllGames().catch(err => {
        console.error("Error fetching all games for sitemap:", err);
        return [];
      })
    ]);

  } catch (error) {
    console.error("Error fetching data for sitemap:", error);
    // Continue with empty arrays if there's an error
  }
  
  // Static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/create`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacyPolicy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Blog routes
  const blogRoutes = blogPosts.map((post) => {
    return {
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || lastModified),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });


  // Game routes
  const gameRoutes = allGames.map((game) => {
    return {
      url: `${baseUrl}/games/${game.game_id}`,
      lastModified: new Date(game.updated_at || game.created_at || lastModified),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  // Combine all routes
  return [...staticRoutes, ...blogRoutes, ...gameRoutes];
}
