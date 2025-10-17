/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";

export default function SinglePost({ postData }) {
  if (!postData) {
    return <p className="text-center text-red-500">Failed to load post data.</p>;
  }

  const { title, heroImage, content } = postData;
  const imageUrl = heroImage?.url || "/img/gradient_light.jpg";

  return (
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
              <a href="#">NFT's</a>
              <a href="#">DIGITAL ART</a>
            </span>
          </div>

          <h1 className="mb-4 font-display text-2xl text-jacarta-700 dark:text-white sm:text-5xl">
            {title || "Untitled Post"}
          </h1>

          {/* Author */}
          <div className="inline-flex items-center">
            <Image
              width={40}
              height={40}
              src="/img/blog/author.jpg"
              alt="author"
              className="mr-4 h-10 w-10 shrink-0 rounded-full"
            />

            <div className="text-left">
              <span className="text-2xs font-medium tracking-tight text-jacarta-700 dark:text-jacarta-200">
                Deothemes
              </span>

              {/* Date / Time */}
              <div className="flex flex-wrap items-center space-x-2 text-sm text-jacarta-400">
                <span>
                  <time>5 Feb</time>
                </span>
                <span>•</span>
                <span>3 min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured image */}
        <figure className="mb-16">
          <Image
            width={1170}
            height={678}
            src={heroImage?.sizes?.large?.url || imageUrl}
            alt={title || "Blog Post"}
            className="w-full rounded-2.5xl"
          />
        </figure>

        {/* Article */}
        <article className="mb-12">
          <div className="article-content">
            {content?.root?.children?.map((block, index) => {
              if (block.type === "heading") {
                const Tag = block.tag || "h2";
                return (
                  <Tag key={index} className="text-xl">
                    {block.children.map(child => child.text).join(" ")}
                  </Tag>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p key={index} className="text-lg leading-normal">
                    {block.children.map((child, i) => (
                      <span key={i} className={child.format === 1 ? "font-bold" : ""}>
                        {child.text}
                      </span>
                    ))}
                  </p>
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={index} className={`${block.listType === "bullet" ? "list-disc" : "list-decimal"} pl-5`}>
                    {block.children.map((item, i) => (
                      <li key={i}>
                        {item.children.map((child, j) => (
                          <span key={j} className={child.format === 1 ? "font-bold" : ""}>
                            {child.text}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                );
              }

              return null;
            })}
          </div>
        </article>

        <div className="mx-auto max-w-[48.125rem]">
          {/* Share */}
          <div className="mb-16 flex items-center">
            <span className="mr-4 text-sm font-bold dark:text-jacarta-300">Share:</span>
            <div className="flex space-x-2">
              <a href="#" className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-accent">
                <svg className="h-4 w-4 fill-jacarta-400 transition-colors group-hover:fill-white dark:group-hover:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                </svg>
              </a>
              <a href="#" className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-accent">
                <svg className="h-4 w-4 fill-jacarta-400 transition-colors group-hover:fill-white dark:group-hover:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Author */}
          <div className="mb-16 flex rounded-2.5xl border border-jacarta-100 bg-white p-8 dark:border-jacarta-600 dark:bg-jacarta-700">
            <Image
              width={144}
              height={144}
              src="/img/blog/author_large.jpg"
              alt="author"
              className="mr-4 h-16 w-16 shrink-0 self-start rounded-lg md:mr-8 md:h-[9rem] md:w-[9rem]"
            />
            <div>
              <span className="mb-3 mt-2 block font-display text-base text-jacarta-700 dark:text-white">
                ib-themes
              </span>
              <p className="mb-4 dark:text-jacarta-300">
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis Theme natoque penatibus et magnis dis parturient montes.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="group">
                  <svg className="h-4 w-4 fill-jacarta-400 group-hover:fill-accent dark:group-hover:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
