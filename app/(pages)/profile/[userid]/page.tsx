import fetchCreatorProfile from '@/components/pages/user/getCreatorData';
import PublicCreatorProfile from '@/components/pages/user/PublicCreatorProfile';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ProfilePageParams } from '@/types';

export async function revalidateProfile(userId: string) {
  'use server'
  revalidatePath(`/profile/${userId}`);
  revalidateTag(`profile-${userId}`);
}

const Page = async ({ params }: ProfilePageParams) => {
  const { userid } = await params;
  
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

