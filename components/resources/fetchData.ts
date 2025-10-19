"use server"
import axios from 'axios';

export async function fetchSinglePost(id) {
  try {
    console.log(`Fetching post with ID: ${id}`);
    
    const res = await axios.get(`https://cms.openbook.games/api/posts/${id}?depth=1&draft=true`, {
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 }
    });
    
    console.log('Response Status:', res.status);
    
    if (res.status !== 200) {
      console.error('Error Response:', res.data);
      throw new Error(`Failed to fetch post: ${res.statusText}`);
    }
    
    console.log('Fetched Post Data:', JSON.stringify(res.data, null, 2));
    
    return res.data;
  } catch (error) {
    console.error('Error in fetchSinglePost:', error);
    return null;
  }
}

export async function fetchSinglePostBySlug(slug) {
  try {
    console.log(`Fetching post with Slug: ${slug}`);
    
    const res = await axios.get(`https://cms.openbook.games/api/posts?where[slug][equals]=${slug}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 }
    });
    
    console.log('Response Status:', res.status);
    
    if (res.status !== 200) {
      console.error('Error Response:', res.data);
      throw new Error(`Failed to fetch post: ${res.statusText}`);
    }
    
    console.log('Fetched Post Data:', JSON.stringify(res.data, null, 2));
    if (!res.data.docs.length){
      throw new Error(`No post found with this slug`);
    }
    return res.data.docs[0];
  } catch (error) {
    console.error('Error in fetchSinglePost:', error);
    return null;
  }
}

export async function fetchRelatedPosts() {
  try {
    const res = await axios.get('https://cms.openbook.games/api/posts?limit=2', {
      next: { revalidate: 60 }
    });

    if (res.status !== 200) {
      throw new Error('Failed to fetch related posts');
    }

    return res.data;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return { docs: [] };
  }
}