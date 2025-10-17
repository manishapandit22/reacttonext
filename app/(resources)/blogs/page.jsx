import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import Blogs from "@/components/resources/Blogs";
import axios from "axios";

async function getBlogData() {

  const CMS_API_BASE = process.env.BLOG_SERVER_URL || "https://cms.openbook.games";
  
  try {
    const response = await axios.get(`${CMS_API_BASE}/api/posts`);
     
    if (response.status === 200)  {
      return {
        props: {
          blogs: response.data
        }
      };
    } else {
      return {
        props: {
          blogs: []
        }
      };
    }
  } catch (error) {
    console.error("Encountered error fetching blog data", error);
    return {
      props: {
        blogs: []
      }
    };
  }
}

export const revalidate = 30;

export default async function BlogsPage() {
  const blogData = await getBlogData();
  return (
    <>
    <Header />
    <main className="pt-[5.5rem] lg:pt-24">
      <Blogs blogData={blogData} />
    </main>
    <Footer />
    </>
  );
}
