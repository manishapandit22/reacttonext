import { cookies } from "next/headers";

export default async function fetchCreatorProfile(id) {
  try {
    if (!id) {
      console.error("Cannot fetch profile without id");
      return null;
    }

    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams({
      games: 'true',
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile/public/${id}?games=true`,
      {
        method: 'GET',
        headers,
        next: {
          revalidate: 300,
          tags: [`profile-${id}`, 'profiles']
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success?.data || null;
  } catch (error) {
    console.error("Error encountered while fetching the creator profile:", error);
    return null;
  }
}