"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { collections6, collections7 } from "@/data/collections";
import Sidebar from "./Sidebar";
import Sorting from "./Sorting";
import Image from "next/image";
import Link from "next/link";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import Button from "@/components/ui/Button";
import PreviewMedia from "@/components/games/PreviewMedia";
import useUserCookie from "@/hooks/useUserCookie";
import { getTagIcon } from "@/components/home/CoverFlowSlider";

const PAGE_SIZE = 6;

export default function Collections() {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const user = useUserCookie();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('interactions');
  const [isInitialized, setIsInitialized] = useState(false);

  const observer = useRef();
  const loadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const sortByRef = useRef('interactions');

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  const fetchGames = useCallback(async (page = 1, shouldAppend = false, sortType = 'interactions') => {
    if (loadingRef.current) {
      console.log("Already loading, skipping API call");
      return;
    }

    console.log("Fetching games - Page:", page, "Append:", shouldAppend, "Sort:", sortType);

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      let sortParam = '';
      switch (sortType) {
        case 'interactions':
          sortParam = '&sort=total_interactions&order=desc';
          break;
        case 'newest':
          sortParam = '&sort=created_at&order=desc';
          break;
        case 'oldest':
          sortParam = '&sort=created_at&order=asc';
          break;
        default:
          sortParam = '&sort=total_interactions&order=desc';
      }

      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/all/published?page_size=${PAGE_SIZE}&current_page=${page}${sortParam}`
      );

      if (response.data && response.data.success) {
        const newGames = response.data.success.data;

        setHasMore(newGames.length === PAGE_SIZE);

        if (shouldAppend) {
          setGames(prevGames => {
            const existingIds = new Set(prevGames.map(game => game.game_id));
            const uniqueNewGames = newGames.filter(game => !existingIds.has(game.game_id));
            return [...prevGames, ...uniqueNewGames];
          });
        } else {
          setGames(newGames);
          setCurrentPage(page);
        }
      } else {
        console.error("Unexpected response structure:", response);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    if (axiosInstance && !isInitialized) {
      console.log("Initial load triggered");
      setIsInitialized(true);
      fetchGames(1, false, sortBy);
    }
  }, [axiosInstance, isInitialized, sortBy, fetchGames]);

  const handleSortChange = useCallback((newSortBy) => {
    console.log("Sort changed to:", newSortBy);

    if (observer.current) {
      observer.current.disconnect();
    }

    setSortBy(newSortBy);
    setCurrentPage(1);
    setHasMore(true);
    setGames([]);

    if (axiosInstance) {
      fetchGames(1, false, newSortBy);
    }
  }, [axiosInstance, fetchGames]);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && isInitialized) {
      const nextPage = currentPageRef.current + 1;
      console.log("Loading more - Next page:", nextPage);
      setCurrentPage(nextPage);
      fetchGames(nextPage, true, sortByRef.current);
    }
  }, [hasMore, isInitialized, fetchGames]);

  const lastGameElementRef = useCallback(node => {
    if (loadingMore || !hasMore || !isInitialized) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && !loadingRef.current && hasMore) {
        console.log("Intersection observed, loading more");
        loadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: '200px'
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, isInitialized, loadMore]);

  useEffect(() => {
    if (games.length === 0) {
      setFilteredGames([]);
      return;
    }

    let sortedGames = [...games];

    switch (sortBy) {
      case 'interactions':
        sortedGames.sort((a, b) => (b.total_interactions || 0) - (a.total_interactions || 0));
        break;
      case 'newest':
        sortedGames.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        sortedGames.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        break;
    }

    setFilteredGames(sortedGames);
  }, [games, sortBy]);

  function formatDate(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    return `${month} ${day}, ${year}`;
  }

  function formatInteractions(count) {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  return (
    <section className="relative pt-16 pb-24 bg-gradient-to-b from-jacarta-700 to-black text-white">
      <div className="px-6 xl:px-24">
        <div className="lg:flex mt-6">
          <Sidebar games={games} setFilteredGames={setFilteredGames} />

          <div className="lg:w-4/5 js-collections-content">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="pt-3 mb-2 font-display text-3xl font-bold text-white tracking-tight">
                  Explore Epic Games
                </h1>
                <p className="text-gray-400 font-medium text-sm">
                  {filteredGames.length} adventures await
                </p>
              </div>

              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  disabled={loadingMore && currentPage === 1}
                  className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="interactions">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="view-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredGames.length === 0 && !loadingMore && isInitialized && (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h11M9 21V3m0 3H5m4-2h4M21 16.6A2.6 2.6 0 0118.4 19H5.6A2.6 2.6 0 013 16.4V5.6A2.6 2.6 0 015.6 3h12.8A2.6 2.6 0 0121 5.6v10.8z"
                        />
                      </svg>
                      <p className="text-gray-400 text-md font-medium">
                        No games yet. Craft your own epic adventure!
                      </p>
                    </div>
                  )}

                  {filteredGames.map((game, i) => (
                    <article
                      key={`${game.game_id}-${sortBy}`}
                      ref={i === filteredGames.length - 1 ? lastGameElementRef : null}
                      className="group relative w-full lg:max-w-full lg:min-h-full mx-auto bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="relative h-[350px] md:h-[400px] lg:h-[450px]">
                        <div className="absolute top-auto bottom-1 bg-black/40 p-1 rounded-md z-50 left-auto right-1">
                          <div className="flex flex-wrap items-center justify-center">
                            {game?.game_tags &&
                              game?.game_tags.map((tag, i) => (
                                <React.Fragment key={i}>
                                  {i < 3 && (
                                    <div className="flex items-center mr-2 mb-2">
                                      <div className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-jacarta-900">
                                        {getTagIcon(tag, i)}
                                      </div>
                                      <span className="font-display text-xs font-semibold text-white">
                                        {tag}
                                      </span>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        </div>

                        <div className="absolute bottom-12 right-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg z-50 flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-red-500 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="text-white text-xs font-medium">
                            {formatInteractions(game.total_interactions || 0)}
                          </span>
                        </div>

                        <Link href={`/games/${game.game_id}`}>
                          <PreviewMedia
                            musicUrl={game.opener_mp3}
                            mediaUrl={game.preview_image}
                            mediaType={game.preview_image_type}
                            alt="Game Preview"
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        {!game.is_free && (
                          <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>

                      <div className="p-5 h-[220px] flex flex-col justify-between">
                        <div className="flex-grow">
                          <Link href={`/games/${game.game_id}`}>
                            <h3 className="font-display text-lg font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                              {game.game_name}
                            </h3>
                          </Link>
                          <p className="text-gray-400 text-sm mt-2 line-clamp-3">
                            {game.description}
                          </p>
                        </div>

                        <div className="mt-4">
                          {game?.is_free || game?.is_purchased ? (
                            <a
                              href={`/games/${game.game_id}/play`}
                              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 py-3 px-6 rounded-xl font-semibold text-white shadow-md hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                            >
                              <svg
                                className="w-5 h-5 fill-white"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 3l14 9-14 9V3z" />
                              </svg>
                              Play Now
                            </a>
                          ) : (
                            <a
                              href={`/games/${game.game_id}`}
                              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 py-3 px-6 rounded-xl font-semibold text-white shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                            >
                              <svg
                                className="w-5 h-5 fill-white"
                                viewBox="0 0 330 330"
                              >
                                <path d="M65,330h200c8.284,0,15-6.716,15-15V145c0-8.284-6.716-15-15-15h-15V85c0-46.869-38.131-85-85-85 S80,38.131,80,85v45H65c-8.284,0-15,6.716-15,15v170C50,323.284,56.716,330,65,330z M180,234.986V255c0,8.284-6.716,15-15,15 s-15-6.716-15-15v-20.014c-6.068-4.565-10-11.824-10-19.986c0-13.785,11.215-25,25-25s25,11.215,25,25 C190,223.162,186.068,230.421,180,234.986z M110,85c0-30.327,24.673-55,55-55s55,24.673,55,55v45H110V85z" />
                              </svg>
                              Details
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </article>
                  ))}
                </div>

                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                )}

                {!hasMore && filteredGames.length > 0 && !loadingMore && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      You've reached the end of the adventures!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}