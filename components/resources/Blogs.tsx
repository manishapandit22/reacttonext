"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Blogs({ blogData }) {
  const CMS_API_BASE = process.env.BLOG_SERVER_URL || "https://cms.openbook.games";

  if (!blogData) {
    return (
      <section className="relative py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center"
          >
            <div className="loader w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="ml-4 text-lg">Loading blog posts...</p>
          </motion.div>
        </div>
      </section>
    );
  }

  const posts = blogData?.props?.blogs?.docs || [];
  
  const featuredPosts = posts.slice(0, 1); 
  const regularPosts = posts.slice(1);     

  const extractSummary = (content) => {
    if (!content || !content.root || !content.root.children) return "";
    
    let summary = "";
    let paragraphCount = 0;
    
    for (const child of content.root.children) {
      if (child.type === 'paragraph' && child.children && child.children.length > 0) {
        const paragraphText = child.children.map(textItem => textItem.text || "").join(" ");
        if (paragraphText.trim()) {
          summary += paragraphText + " ";
          paragraphCount++;
          
          if (paragraphCount >= 2) break;
        }
      }
    }
    
    if (summary.length > 150) {
      summary = summary.substring(0, 150) + "...";
    }
    
    return summary;
  };

  const getImageUrl = (post) => {
    if (post.heroImage && post.heroImage.url) {
      return `${CMS_API_BASE}/${post.heroImage.url}`;
    }
      return "/img/blog/single_post_featured.jpg";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <section className="relative py-16 md:py-24">
      <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
        <Image
          width={1920}
          height={1080}
          src="/img/gradient_light.jpg"
          alt="gradient"
          className="h-full w-full"
        />
      </picture>
      <motion.div 
        className="container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Featured Post */}
        {featuredPosts.length > 0 && featuredPosts.map((post, i) => (
          <motion.article 
            key={post.id} 
            className="mb-[1.875rem] md:mb-16"
            variants={itemVariants}
          >
            <div className="flex flex-col overflow-hidden rounded-2.5xl transition-all duration-300 hover:shadow-lg md:flex-row bg-white dark:bg-jacarta-700 border border-jacarta-100 dark:border-jacarta-600 backdrop-blur-sm">
              <div className="group overflow-hidden md:w-1/2 relative">
                <Link href={`/blogs/${post.slug}`}>
                  <div className="relative overflow-hidden h-64 md:h-full">
                    <Image
                      width={1920}
                      height={1080}
                      src={getImageUrl(post)}
                      alt={post.title || "Featured post"}
                      className="h-full w-full object-cover transition-transform duration-1000 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>
                  </div>
                </Link>
              </div>

              {/* Body */}
              <div className="rounded-b-[1.25rem] border-t md:border-t-0 md:border-l border-jacarta-100 bg-white p-[10%] dark:border-jacarta-600 dark:bg-jacarta-700 md:w-1/2 md:rounded-none md:rounded-r-[1.25rem]">
                {/* Meta */}
                <div className="mb-3 flex flex-wrap items-center space-x-1 text-xs">
                  <a
                    href="#"
                    className="font-display text-jacarta-700 hover:text-accent dark:text-jacarta-200"
                  >
                    {post.populatedAuthors && post.populatedAuthors.length > 0 
                      ? post.populatedAuthors[0].name 
                      : "Admin"}
                  </a>
                  <span className="dark:text-jacarta-400">in</span>
                  <span className="inline-flex flex-wrap items-center space-x-1 text-accent">
                    {post.categories && post.categories.length > 0
                      ? post.categories.map((category, index) => (
                          <a key={category.id || index} href="#" className="hover:underline"> 
                            {category.title}
                            {index < post.categories.length - 1 ? ', ' : ''} 
                          </a>
                        ))
                      : <a className="hover:underline">Openbook</a>} 
                  </span>
                </div>

                <h2 className="mb-4 font-display text-xl text-jacarta-700 hover:text-accent dark:text-white dark:hover:text-accent sm:text-3xl transition-colors duration-300">
                  <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mb-8 dark:text-jacarta-200">
                  {extractSummary(post.content)}
                </p>

                {/* Date / Time */}
                <div className="flex flex-wrap items-center space-x-2 text-sm text-jacarta-400">
                  <span>
                    <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
                  </span>
                  <span>•</span>
                  <span>3 min read</span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}

        <motion.div 
          className="grid grid-cols-1 gap-[1.875rem] sm:grid-cols-2 md:grid-cols-3"
          variants={containerVariants}
        >
          {/* Regular Posts */}
          {regularPosts.length > 0 && regularPosts.map((post) => (
            <motion.article 
              key={post.id}
              variants={itemVariants}
              className="flex flex-col h-full"
            >
              <div className="overflow-hidden rounded-2.5xl transition-all duration-300 hover:shadow-lg flex flex-col h-full bg-white dark:bg-jacarta-700 border border-jacarta-100 dark:border-jacarta-600 hover:border-blue-300 dark:hover:border-blue-500">
                <div className="group relative overflow-hidden h-48 sm:h-56">
                  <Link href={`/blogs/${post.slug}`}>
                    <Image
                      width={1920}
                      height={1080}
                      src={getImageUrl(post)}
                      alt={post.title || "Blog post"}
                      className="h-full w-full object-cover transition-transform duration-1000 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>
                  </Link>
                </div>

                {/* Body */}
                <div className="rounded-b-[1.25rem] border-t border-jacarta-100 bg-white p-[10%] dark:border-jacarta-600 dark:bg-jacarta-700 flex flex-col flex-grow">
                  {/* Meta */}
                  <div className="mb-3 flex flex-wrap items-center space-x-1 text-xs">
                    <a
                      href="#"
                      className="font-display text-jacarta-700 hover:text-accent dark:text-jacarta-200"
                    >
                      {post.populatedAuthors && post.populatedAuthors.length > 0 
                        ? post.populatedAuthors[0].name 
                        : "Admin"}
                    </a>
                    <span className="dark:text-jacarta-400">in</span>
                    <span className="inline-flex flex-wrap items-center space-x-1 text-accent">
                      {post.categories && post.categories.length > 0
                        ? post.categories.map((category, index) => (
                            <a key={category.id || index} href="#" className="hover:underline"> 
                              {category.title}
                              {index < post.categories.length - 1 ? ', ' : ''} 
                            </a>
                          ))
                        : <a className="hover:underline">Openbook</a>} 
                    </span>
                  </div>

                  <h2 className="mb-4 font-display text-xl text-jacarta-700 hover:text-accent dark:text-white dark:hover:text-accent transition-colors duration-300">
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mb-8 dark:text-jacarta-200 flex-grow">
                    {extractSummary(post.content)}
                  </p>

                  {/* Date / Time */}
                  <div className="flex flex-wrap items-center space-x-2 text-sm text-jacarta-400 mt-auto">
                    <span>
                      <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
                    </span>
                    <span>•</span>
                    <span>3 min read</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {posts.length === 0 && (
          <motion.div 
            className="text-center py-8"
            variants={itemVariants}
          >
            <p className="text-lg">No blog posts available at the moment.</p>
          </motion.div>
        )}

        {blogData.hasNextPage && (
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href={`/blogs?page=${blogData.nextPage}`}
              className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark hover:shadow-lg relative group overflow-hidden"
            >
              <span className="relative z-10">Load More</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></span>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}