import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PublicCreatorProfile from '@/components/pages/user/PublicCreatorProfile';

async function getUserProfile(username) {
  try {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile`
      ); 
      
      if (response.data?.success) {
        const profileData = {
          ...response.data.success.data,
          gameStats: {
            published: response.data.success.data.games_created || 0,
            drafts: 0,
            favorites: 0,
          },
          is_premium: !!response.data.success.data.subscription,
          experience: response.data.success.data.game_points || 0,
          level: Math.floor((response.data.success.data.game_points || 0) / 1000) + 1,
        };
       const data = profileData; 
       return data;
      }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function getUserStories(username) {
  console.log("Get stories API called");
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/stories/`
      );
      if (response.data && response.data.success) {
        const data = response.data.success.data;
        return data;
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } 
}

export async function generateMetadata({ params }) {
  const profile = await getUserProfile(params.username);
  
  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }
  
  const userData = profile.success?.data || profile;
  
  return {
    title: `${userData.username || params.username} - Game Creator Profile`,
    description: userData.bio || `Check out ${userData.username || params.username}'s amazing games and creations!`,
    openGraph: {
      title: `${userData.username || params.username} - Game Creator`,
      description: userData.bio || `Check out ${userData.username || params.username}'s amazing games!`,
      images: [
        {
          url: userData.profile_photo || '/img/user/user_avatar.gif',
          width: 1200,
          height: 630,
          alt: `${userData.username || params.username}'s profile`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userData.username || params.username} - Game Creator`,
      description: userData.bio || `Check out ${userData.username || params.username}'s amazing games!`,
      images: [userData.profile_photo || '/img/user/user_avatar.gif'],
    },
  };
}

// export async function generateStaticParams() {
//   // You could fetch popular usernames here for pre-generation
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/popular-creators`);
//     if (response.ok) {
//       const usernames = await response.json();
//       return usernames.map((username) => ({
//         username: username,
//       }));
//     }
//   } catch (error) {
//     console.error('Error generating static params:', error);
//   }
  
//   return []; // Return empty array to generate on-demand
// }

function LoadingProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
        <p className="text-white">Loading profile...</p>
      </div>
    </div>
  );
}

export default async function PublicProfilePage({ params }) {
  const [profileData, storiesData] = await Promise.all([
    getUserProfile(params.username),
    getUserStories(params.username)
  ]);
  
  // if (!profileData) {
  //   notFound();
  // }
  
  return (
    <Suspense fallback={<LoadingProfile />}>
      <PublicCreatorProfile 
        initialProfile={profileData} 
        initialStories={storiesData}
        username={params.username} 
      />
    </Suspense>
  );
}