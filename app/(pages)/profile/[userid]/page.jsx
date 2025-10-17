import fetchCreatorProfile from '@/components/pages/user/getCreatorData';
import PublicCreatorProfile from '@/components/pages/user/PublicCreatorProfile';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateProfile(userId) {
  'use server'
  revalidatePath(`/profile/${userId}`);
  revalidateTag(`profile-${userId}`);
}

const Page = async ({ params }) => {
  const { userid } = params;
  
  const initialProfile = await fetchCreatorProfile(userid);

  return (
    <PublicCreatorProfile 
      username={userid} 
      initialProfile={initialProfile}
      revalidateAction={revalidateProfile}
    />
  );
};

export default Page;