"use client";

import { socialLinks } from "@/data/resources";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head"; // Import Head for metadata
import { useEffect, useState } from "react";
import {
  fetchRelatedPosts,
  fetchSinglePost,
  fetchSinglePostBySlug,
} from "./fetchData";
import useDeviceDetect from "@/utils/useDeviceDetect";
import ResponsiveImage from "./ResponsiveImage";

export default function SinglePost({ slug }) {
  const [postData, setPostData] = useState({});
  const [relatedPosts, setRelatedPosts] = useState({});
  const [error, setError] = useState(null);
  const deviceInfo = useDeviceDetect();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [post, related] = await Promise.all([
          fetchSinglePostBySlug(slug),
          fetchRelatedPosts(),
        ]);
        if (!post) {
          throw new Error("Post data not found");
        }
        setPostData(post);
        setRelatedPosts(related || {});
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, [slug]);

  if (error) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl text-red-500">Error: {error}</h2>
      </div>
    );
  }


  const getThumbnailUrl = () => {
    if (postData.heroImage?.thumbnailURL) {
      return `https://cms.openbook.games${postData.heroImage.thumbnailURL}`;
    }
    return "/img/blog/author.jpg";
  };

  const pageTitle = postData.title || "Untitled Post";
  const pageDescription =
    postData.excerpt || postData.description || "Read this amazing post!";
  const pageImage = postData.heroImage?.url
    ? `https://cms.openbook.games${postData.heroImage.url}`
    : "/img/blog/single_post_featured.jpg";
  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://qa.openbook.quest/blogs/${slug}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Openbook Games" />

        {postData.publishedAt && (
          <meta
            property="article:published_time"
            content={new Date(postData.publishedAt).toISOString()}
          />
        )}
        {postData.updatedAt && (
          <meta
            property="article:modified_time"
            content={new Date(postData.updatedAt).toISOString()}
          />
        )}
        {postData.categories?.map((category, index) => (
          <meta
            key={`article-tag-${index}`}
            property="article:tag"
            content={category?.title || "Openbook"}
          />
        ))}
        {postData.authors?.length > 0 && (
          <meta
            property="article:author"
            content={postData.authors[0].name || "Openbook Team"}
          />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <meta name="twitter:site" content="@openbookgames" />
        {postData.authors?.length > 0 && postData.authors[0].twitter && (
          <meta name="twitter:creator" content={postData.authors[0].twitter} />
        )}

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": pageUrl,
            },
            headline: pageTitle,
            image: pageImage,
            datePublished: postData.publishedAt
              ? new Date(postData.publishedAt).toISOString()
              : null,
            dateModified: postData.updatedAt
              ? new Date(postData.updatedAt).toISOString()
              : null,
            author: {
              "@type": "Person",
            name: postData.authors?.[0]?.name || "Openbook Team",
            },
            publisher: {
              "@type": "Organization",
              name: "Openbook Games",
              logo: {
                "@type": "ImageObject",
                url: "https://backstage.openbook.games/_next/image?url=%2Fimg%2Flogo.png&w=48&q=75&dpl=dpl_ALiAKcvz2sRwpSEypAvpuH7tHcAV",
              },
            },
            description: pageDescription,
          })}
        </script>

        <link rel="canonical" href={pageUrl} />
      </Head>

      <section className="relative py-16 md:py-24">
        <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
          <Image
            width={1920}
            height={789}
            src="/img/gradient_light.jpg"
            alt="gradient"
            className="h-full w-full"
          />
        </picture>
        <div className="container">
          <header className="mx-auto mb-16 max-w-lg text-center">
            <div className="mb-3 inline-flex flex-wrap items-center space-x-1 text-xs">
              <span className="inline-flex flex-wrap items-center space-x-1 text-accent">
                {postData.categories?.length > 0 ? (
                  postData.categories.map((category, index) => (
                    <a key={index} href="#">
                      {category?.title || "Openbook"}
                    </a>
                  ))
                ) : (
                  <a href="/">Openbook</a>
                )}
              </span>
            </div>

            <h1 className="mb-4 font-display text-2xl text-jacarta-700 dark:text-white sm:text-5xl">
              {pageTitle}
            </h1>

            <div className="inline-flex items-center">
              <Image
                width={40}
                height={40}
                src={getThumbnailUrl()}
                alt={postData.heroImage?.alt || "Author"}
                className="mr-4 h-10 w-10 shrink-0 rounded-full"
                onError={(e) => {
                  e.target.src = "/img/blog/author.jpg";
                }}
              />

              <div className="text-left">
                {(postData.authors?.length > 0
                  ? postData.authors
                  : postData.populatedAuthors) && (
                  <span className="text-2xs font-medium tracking-tight text-jacarta-700 dark:text-jacarta-200">
                    {postData.authors?.[0]?.name ||
                      postData.populatedAuthors?.[0]?.name ||
                      "Openbook Team"}
                  </span>
                )}
                <div className="flex flex-wrap items-center space-x-2 text-sm text-jacarta-400">
                  <span>
                    <time>
                      {postData.publishedAt
                        ? new Date(postData.publishedAt).toLocaleDateString()
                        : "No date"}
                    </time>
                  </span>
                  <span>•</span>
                  <span>3 min read</span>
                </div>
              </div>
            </div>
          </header>

          {postData.heroImage?.url && (
            <figure className="mb-16">
              <Image
                width={1170}
                height={678}
                src={pageImage}
                alt={postData.heroImage?.alt || "Default post image"}
                className="w-full rounded-2.5xl"
              />
            </figure>
          )}

          <article className="mb-12">
            <div className="article-content">
              {postData.content?.root?.children?.length > 0 ? (
                postData.content.root.children.map((child, index) => {
                  if (child?.tag) {
                    const Tag = child.tag;
                    return (
                      <Tag
                        key={index}
                        className={`mb-4 font-display ${
                          child.tag === "h2" ? "text-3xl" : "text-2xl"
                        } text-jacarta-700 dark:text-white`}
                        dir={child.direction || "ltr"}
                      >
                        {child.children?.map((textNode, i) => (
                          <span
                            key={i}
                            className={textNode.format === 1 ? "font-bold" : ""}
                          >
                            {textNode.text}
                          </span>
                        ))}
                      </Tag>
                    );
                  } else if (child?.type === "paragraph") {
                    return (
                      <p
                        key={index}
                        className="mb-4 text-lg leading-normal text-jacarta-700 dark:text-[#e3e5e8]"
                        dir={child.direction || "ltr"}
                      >
                        {child.children?.map((textNode, i) => (
                          <span
                            key={i}
                            className={textNode.format === 1 ? "font-bold" : ""}
                          >
                            {textNode.text}
                          </span>
                        ))}
                      </p>
                    );
                  }
                  return null;
                })
              ) : (
                <p className="text-center text-gray-500">
                  No content available
                </p>
              )}
            </div>
          </article>

          <div className="mx-auto max-w-[48.125rem]">
            <div className="mb-16 flex items-center">
              <span className="mr-4 text-sm font-bold dark:text-jacarta-300">
                Share:
              </span>
              <div className="flex space-x-2">
                {socialLinks?.map((elm, i) => (
                  <a
                    key={i}
                    href={`${elm.href}${encodeURIComponent(pageUrl)}`}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-accent"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="facebook"
                      className="h-4 w-4 fill-jacarta-400 transition-colors group-hover:fill-white dark:group-hover:fill-white"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d={elm.svgPath}></path>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* {postData.authors?.[0] && (
              <div className="mb-16 flex rounded-2.5xl border border-jacarta-100 bg-white p-8 dark:border-jacarta-600 dark:bg-jacarta-700">
                <ResponsiveImage
                  imageData={postData.authors[0].avatar}
                  fallbackSrc="/img/blog/author_large.jpg"
                  alt={postData.authors[0].name || "Author"}
                  width={144}
                  height={144}
                  className="mr-4 h-16 w-16 shrink-0 self-start rounded-lg md:mr-8 md:h-[9rem] md:w-[9rem]"
                />
                <div>
                  <span className="mb-3 mt-2 block font-display text-base text-jacarta-700 dark:text-white">
                    {postData.authors[0].name || "Anonymous"}
                  </span>
                  <p className="mb-4 dark:text-jacarta-300">
                    {postData.authors[0].bio || "No biography available"}
                  </p>
                  <div className="flex space-x-5">
                    {postData.authors[0].socialLinks?.map((social, i) => (
                      <a key={i} href={social.url || "#"} className="group">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fab"
                          data-icon={social.platform}
                          className="h-4 w-4 fill-jacarta-400 group-hover:fill-accent dark:group-hover:fill-white"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d={social.svgPath}></path>
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )} */}
            <h2 className="mb-8 font-display text-3xl text-jacarta-700 dark:text-white">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 gap-[1.875rem] sm:grid-cols-2">
              {relatedPosts?.docs?.map((elm, i) => (
                <article key={i} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2.5xl transition-shadow hover:shadow-lg">
                    <figure className="group overflow-hidden">
                      <Link href={`/blogs/${elm.slug}`}>
                        <ResponsiveImage
                          imageData={elm.heroImage}
                          fallbackSrc="/img/blog/default_post.jpg"
                          alt={elm.heroImage?.alt || "Related post image"}
                          width={370}
                          height={250}
                          className="h-full w-full object-cover transition-transform duration-[1600ms] will-change-transform group-hover:scale-105"
                        />
                      </Link>
                    </figure>

                    <div className="flex flex-1 flex-col rounded-b-[1.25rem] border border-t-0 border-jacarta-100 bg-white p-[10%] dark:border-jacarta-600 dark:bg-jacarta-700">
                      <div className="mb-3 flex flex-wrap items-center space-x-1 text-xs">
                        {elm.authors?.[0]?.name && (
                          <>
                            <Link
                              href={`/blogs/${elm.slug}`}
                              className="font-display text-jacarta-700 hover:text-accent dark:text-jacarta-200"
                            >
                              {elm.authors[0].name}
                            </Link>
                            <span className="dark:text-jacarta-400">in</span>
                          </>
                        )}
                        <span className="inline-flex flex-wrap items-center space-x-1 text-accent">
                          {elm.categories?.[0]?.title || "Openbook"}
                        </span>
                      </div>

                      <h2 className="mb-4 font-display text-xl text-jacarta-700 hover:text-accent dark:text-white dark:hover:text-accent">
                        <Link href={`/blogs/${elm.slug}`}>
                          {elm.title && elm.title}
                        </Link>
                      </h2>
                      <p className="mb-8 dark:text-jacarta-200">
                        {elm.excerpt || elm.description}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center space-x-2 text-sm text-jacarta-400">
                        <span>
                          <time>
                            {elm.publishedAt
                              ? new Date(elm.publishedAt).toLocaleDateString()
                              : "No date"}
                          </time>
                        </span>
                        <span>•</span>
                        <span>3 min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
