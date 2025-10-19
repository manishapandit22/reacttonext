"use client";
import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow, Keyboard } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import PreviewMedia from "@/components/games/PreviewMedia";

export const getTagIcon = (tag, index) => {
  const tagLower = tag.toLowerCase();

  const iconType = index % 8;

  if (tagLower.includes('adventure') || tagLower.includes('quest') || tagLower.includes('journey')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0L7.854 3.756L12 4.363L9 7.284L9.708 11.412L6 9.463L2.292 11.412L3 7.284L0 4.363L4.146 3.756L6 0Z" fill="url(#paint0_linear_adventure)" />
        <defs>
          <linearGradient id="paint0_linear_adventure" x1="6" y1="0" x2="6" y2="11.412" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B6B" />
            <stop offset="1" stopColor="#FFE66D" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('puzzle') || tagLower.includes('strategy') || tagLower.includes('logic')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 0V4H7V0H5ZM3 5H0V7H3V12H5V7H7V12H9V7H12V5H9V0H7V4H5V0H3V5Z" fill="url(#paint0_linear_puzzle)" />
        <defs>
          <linearGradient id="paint0_linear_puzzle" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ECDC4" />
            <stop offset="1" stopColor="#556270" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('rpg') || tagLower.includes('role') || tagLower.includes('fantasy')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0L0 4V8L6 12L12 8V4L6 0ZM9 7.5L6 9.5L3 7.5V4.5L6 2.5L9 4.5V7.5Z" fill="url(#paint0_linear_rpg)" />
        <defs>
          <linearGradient id="paint0_linear_rpg" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('action') || tagLower.includes('fight') || tagLower.includes('battle')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 0L8 2.5L9.5 4L7 6.5L5.5 5L3 7.5L4.5 9L2 11.5L0.5 10L2 8.5L3.5 10L6 7.5L4.5 6L7 3.5L8.5 5L11 2.5L9.5 1L12 0L10.5 0Z" fill="url(#paint0_linear_action)" />
        <defs>
          <linearGradient id="paint0_linear_action" x1="6" y1="0" x2="6" y2="11.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F43F5E" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('sci') || tagLower.includes('future') || tagLower.includes('tech')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C9.3 12 12 9.3 12 6C12 2.7 9.3 0 6 0ZM6 2C8.2 2 10 3.8 10 6C10 8.2 8.2 10 6 10C3.8 10 2 8.2 2 6C2 3.8 3.8 2 6 2ZM6 4C4.9 4 4 4.9 4 6C4 7.1 4.9 8 6 8C7.1 8 8 7.1 8 6C8 4.9 7.1 4 6 4Z" fill="url(#paint0_linear_scifi)" />
        <defs>
          <linearGradient id="paint0_linear_scifi" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('horror') || tagLower.includes('scary') || tagLower.includes('thriller')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C4.9 0 4 0.9 4 2V3H2V7H4V12H8V7H10V3H8V2C8 0.9 7.1 0 6 0ZM6 1C6.6 1 7 1.4 7 2V3H5V2C5 1.4 5.4 1 6 1Z" fill="url(#paint0_linear_horror)" />
        <defs>
          <linearGradient id="paint0_linear_horror" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#475569" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (tagLower.includes('sport') || tagLower.includes('racing') || tagLower.includes('competition')) {
    return (
      <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C9.3 12 12 9.3 12 6C12 2.7 9.3 0 6 0ZM6 2C8.2 2 10 3.8 10 6C10 8.2 8.2 10 6 10C3.8 10 2 8.2 2 6C2 3.8 3.8 2 6 2ZM4 4V8L8 6L4 4Z" fill="url(#paint0_linear_sport)" />
        <defs>
          <linearGradient id="paint0_linear_sport" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
    );
  } else {
    // If no content match, use the index to determine the icon
    switch (iconType) {
      case 0:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H12V2H0V0ZM0 5H12V7H0V5ZM0 10H12V12H0V10Z" fill="url(#paint0_linear_misc1)" />
            <defs>
              <linearGradient id="paint0_linear_misc1" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 1:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0L12 6L6 12L0 6L6 0ZM6 2.83L2.83 6L6 9.17L9.17 6L6 2.83Z" fill="url(#paint0_linear_misc2)" />
            <defs>
              <linearGradient id="paint0_linear_misc2" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF4444" />
                <stop offset="1" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 2:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C9.3 12 12 9.3 12 6C12 2.7 9.3 0 6 0ZM5 2H7V4H5V2ZM5 5H7V10H5V5Z" fill="url(#paint0_linear_misc3)" />
            <defs>
              <linearGradient id="paint0_linear_misc3" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 3:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 0V12H10V0H2ZM8 10H4V2H8V10Z" fill="url(#paint0_linear_misc4)" />
            <defs>
              <linearGradient id="paint0_linear_misc4" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 4:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0L0 12H12L6 0ZM6 3L9 9H3L6 3Z" fill="url(#paint0_linear_misc5)" />
            <defs>
              <linearGradient id="paint0_linear_misc5" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="1" stopColor="#F43F5E" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 5:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0V12H12V0H0ZM10 10H2V2H10V10Z" fill="url(#paint0_linear_misc6)" />
            <defs>
              <linearGradient id="paint0_linear_misc6" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 6:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C9.3 12 12 9.3 12 6C12 2.7 9.3 0 6 0ZM6 10C3.8 10 2 8.2 2 6C2 3.8 3.8 2 6 2C8.2 2 10 3.8 10 6C10 8.2 8.2 10 6 10Z" fill="url(#paint0_linear_misc7)" />
            <defs>
              <linearGradient id="paint0_linear_misc7" x1="6" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14B8A6" />
                <stop offset="1" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return (
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_default)">
              <path d="M10.666 1.333v1.334H10v2.162c0 .772.167 1.534.49 2.234l2.855 6.184a1 1 0 01-.908 1.42H3.563a1 1 0 01-.909-1.42L5.51 7.063c.323-.7.49-1.462.49-2.234V2.667h-.666V1.333h5.333zm-2 1.334H7.333v2.666h1.333V2.667z" fill="url(#paint0_linear_default)" />
            </g>
            <defs>
              <linearGradient id="paint0_linear_default" x1="8" y1="14.667" x2="7.735" y2="1.641" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8054FF" />
                <stop offset="1" stopColor="#FF68D5" />
              </linearGradient>
              <clipPath id="clip0_default">
                <path fill="#fff" d="M0 0h16v16H0z" />
              </clipPath>
            </defs>
          </svg>
        );
    }
  }
};

export default function CoverFlowSlider({ games }) {
  const buttonRef = useRef(null);

  function formatDate(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    return `${month} ${day}, ${year}`;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("jello-horizontal");
          } else {
            entry.target.classList.remove("jello-horizontal");
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-w-full max-w-full overflow-hidden pt-2">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        allowSlidePrev={false}
        speed={600}
        slideToClickedSlide={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        // Remove mousewheel for pointer fix
        // mousewheel={{
        //   enabled: true,
        //   sensitivity: 1,
        //   thresholdDelta: 50,
        // }}
        touchEventsTarget="wrapper"
        touchRatio={1.2}
        navigation={{
          nextEl: ".snbn7",
          // Disable prev navigation by omitting prevEl
          // prevEl: ".snbp7",
        }}
        modules={[EffectCoverflow, Navigation, Keyboard]}
        breakpoints={{
          0: {
            slidesPerView: 2.5,
            spaceBetween: 15,
            coverflowEffect: {
              rotate: 45,
              stretch: 0,
              depth: 150,
              modifier: 1.2,
            },
          },
          480: {
            slidesPerView: 2.5,
            spaceBetween: 20,
            coverflowEffect: {
              rotate: 35,
              stretch: 0,
              depth: 120,
              modifier: 1.1,
            },
          },
          768: {
            slidesPerView: 2.5,
            spaceBetween: 25,
            coverflowEffect: {
              rotate: 30,
              stretch: 0,
              depth: 100,
              modifier: 1,
            },
          },
          1024: {
            slidesPerView: 3.5,
            spaceBetween: 30,
            coverflowEffect: {
              rotate: 25,
              stretch: 0,
              depth: 80,
              modifier: 0.9,
            },
          },
          1280: {
            slidesPerView: 3.5,
            spaceBetween: 30,
            coverflowEffect: {
              rotate: 20,
              stretch: 0,
              depth: 70,
              modifier: 0.8,
            },
          },
          1440: {
            slidesPerView: 3.5,
            spaceBetween: 35,
            coverflowEffect: {
              rotate: 18,
              stretch: 0,
              depth: 60,
              modifier: 0.7,
            },
          },
          1920: {
            slidesPerView: 5.5,
            spaceBetween: 40,
            coverflowEffect: {
              rotate: 15,
              stretch: 0,
              depth: 50,
              modifier: 0.6,
            },
          }
        }}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        className="swiper coverflow-slider !py-6 !overflow-visible"
      >
        {games.map((game, i) => (
          <SwiperSlide
            key={i}
            className="swiper-slide !flex justify-center items-center"
            style={{ cursor: "pointer" }}
          >
            <article className="w-full max-w-[300px] h-[440px] md:max-h-[460px] md:max-w-[340px] lg:min-h-[480px] lg:max-h-[480px] transition-transform duration-300 transform hover:scale-105 pointer-events-auto">
              <Link
                href={`/games/${game.game_id}`}
                className="gradient-border block h-full rounded-2.5xl"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <div className="h-full rounded-[1.125rem] bg-jacarta-900 flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 pointer-events-auto">
                  <Image
                    width={381}
                    height={381}
                    src="/img/nft-game/gradient_glow_small.png"
                    alt="image"
                    className="absolute inset-0 pointer-events-none"
                  />

                  {/* Fixed height image container */}
                  <figure className="relative w-full h-[240px] sm:h-[260px] lg:h-[280px] xl:h-[300px] flex justify-center bg-gradient-to-b from-jacarta-600 to-jacarta-700 rounded-t-[1.125rem] overflow-hidden flex-shrink-0 pointer-events-auto">
                    <div className="w-full h-full">
                      <PreviewMedia
                        musicUrl={game.opener_mp3}
                        mediaUrl={game.preview_image}
                        mediaType={game.preview_image_type}
                        alt="Game Preview"
                        width={300}
                        height={280}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </figure>

                  {/* Content container with fixed height */}
                  <div className="relative bg-jacarta-700 p-3 sm:p-4 flex flex-col flex-grow min-h-[240px] sm:min-h-[240px] lg:min-h-[240px] xl:min-h-[240px] pointer-events-auto">
                    {/* Title with fixed height */}
                    <div className="h-[48px] sm:h-[52px] lg:h-[56px] mb-3 flex items-start">
                      <h3
                        className="text-sm sm:text-md lg:text-lg font-semibold leading-tight text-white line-clamp-2"
                        title={game.game_name}
                      >
                        {game.game_name.length > 45
                          ? `${game.game_name.substring(0, 45)}...`
                          : game.game_name}
                      </h3>
                    </div>

                    {/* Creator info with fixed height */}
                    <div className="flex gap-2 sm:gap-3 mb-3 h-[32px] items-center">
                      {game.user && game.user.profile_photo ? (
                        <Image
                          loading="lazy"
                          src={game.user.profile_photo}
                          alt={game.user.username || "Creator"}
                          width={32}
                          height={32}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                          {game.user && game.user.username
                            ? game.user.username.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}

                      {game.user && (
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          by {game.user.username || "Unknown Creator"}
                        </p>
                      )}
                    </div>

                    {/* Tags container with fixed height and proper spacing */}
                    <div className="flex-grow flex">
                      <div className="w-full">
                        <div className="flex flex-wrap gap-x-2 gap-y-1 max-h-[80px] overflow-hidden">
                          {game.game_tags &&
                            game.game_tags.slice(0, 3).map((tag, i) => (
                              <div key={i} className="flex items-center mb-1">
                                <div className="mr-1 inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-jacarta-900 flex-shrink-0">
                                  {getTagIcon(tag, i)}
                                </div>
                                <span className="font-display text-xs sm:text-sm font-semibold text-white truncate max-w-[80px] sm:max-w-[100px]">
                                  {tag}
                                </span>
                              </div>
                            ))}
                          {game.game_tags && game.game_tags.length > 3 && (
                            <div className="flex items-center mb-1">
                              <span className="font-display text-xs sm:text-sm font-semibold text-gray-400">
                                +{game.game_tags.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons with responsive positioning (prev removed) */}

      <div className="snbn7 swiper-button-next swiper-button-next-4 group absolute top-1/2 right-1 sm:right-2 md:right-4 z-20 -mt-5 sm:-mt-6 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 cursor-pointer items-center justify-center rounded-full bg-white/90 backdrop-blur-sm p-1 sm:p-2 md:p-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="sm:w-5 sm:h-5 fill-jacarta-700 group-hover:fill-accent transition-colors duration-300"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </div>

      {/* Enhanced CSS for better responsiveness and pointer fixes */}
      <style jsx>{`
        .coverflow-slider .swiper-slide {
          height: auto !important;
          display: flex !important;
          align-items: stretch !important;
          cursor: pointer !important;
        }
        .coverflow-slider .swiper-slide * {
          cursor: pointer !important;
        }
        .coverflow-slider .swiper-wrapper {
          cursor: grab !important;
        }
        .coverflow-slider .swiper-slide-active,
        .coverflow-slider .swiper-slide-next,
        .coverflow-slider .swiper-slide-prev {
          z-index: 2;
        }
        .coverflow-slider .swiper-pagination {
          position: absolute !important;
          bottom: 10px !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          transform: none !important;
          text-align: center !important;
        }
        .coverflow-slider .swiper-pagination-bullets {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 4px !important;
        }
        @media (min-width: 640px) {
          .coverflow-slider .swiper-pagination-bullets {
            gap: 6px !important;
          }
        }
        .coverflow-slider .swiper-pagination-bullet {
          width: 6px !important;
          height: 6px !important;
          margin: 0 !important;
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }
        @media (min-width: 640px) {
          .coverflow-slider .swiper-pagination-bullet {
            width: 8px !important;
            height: 8px !important;
          }
        }
        .coverflow-slider .swiper-pagination-bullet-active {
          background: #ffffff !important;
          transform: scale(1.2) !important;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6) !important;
        }
        .coverflow-slider .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.8) !important;
          transform: scale(1.1) !important;
        }
        .coverflow-slider .swiper-pagination-horizontal {
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
        }
        .coverflow-slider .swiper-pagination-bullets.swiper-pagination-horizontal {
          bottom: 10px !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
        /* Ensure consistent card heights across all breakpoints */
        @media (max-width: 479px) {
          .coverflow-slider article {
            max-width: 260px !important;
            height: 460px !important;
          }
        }
        /* Ensure proper spacing on mobile */
        @media (max-width: 640px) {
          .coverflow-slider {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }
        /* Hard-disable previous interactions */
        .coverflow-slider .swiper-button-prev,
        .coverflow-slider .snbp7 {
          pointer-events: none !important;
          opacity: 0.35 !important;
          filter: grayscale(60%);
        }
        .coverflow-slider :root {
          --swiper-navigation-sides-offset: 0px;
        }
        /* Prevent left swipe gestures */
        .coverflow-slider .swiper {
          touch-action: pan-y; /* avoid horizontal back swipe */
        }
      `}</style>
    </div>
  );
}