"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import tippy from "tippy.js";

const categories = [
  "Tabletop",
  "Romance", 
  "Romantasy",
  "Isekai",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Steampunk",
  "Contemporary",
  "Historical",
  "Thriller",
  "Horror",
];

// Color themes for each category - to create visual interest
const categoryThemes = {
  "Tabletop": "from-amber-500 to-orange-600",
  "Romance": "from-pink-400 to-rose-600",
  "Romantasy": "from-purple-400 to-pink-600",
  "Isekai": "from-cyan-400 to-blue-600",
  "Fantasy": "from-indigo-400 to-violet-600",
  "Sci-Fi": "from-blue-400 to-cyan-600",
  "Mystery": "from-slate-500 to-gray-700",
  "Steampunk": "from-amber-600 to-brown-700",
  "Contemporary": "from-emerald-400 to-green-600",
  "Historical": "from-amber-700 to-yellow-600",
  "Thriller": "from-red-500 to-rose-700",
  "Horror": "from-gray-800 to-black",
};

export default function Sidebar({ games, setFilteredGames }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoverCategory, setHoverCategory] = useState(null);

  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  useEffect(() => {
    let filtered = games;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(game => {
        if (!game.game_tags) return false;
        return game.game_tags.some(tag => selectedCategories.includes(tag));
      });
    }

    setFilteredGames(filtered);
  }, [selectedCategories, searchTerm, games, setFilteredGames]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Calculate count of games per category
  const getCategoryCount = (category) => {
    return games.filter(game => game.game_tags && game.game_tags.includes(category)).length;
  };

  return (
    <div className="lg:w-1/5 mb-10 js-collections-sidebar lg:h-[calc(100vh_-_232px)] lg:overflow-auto lg:sticky lg:top-32 lg:mr-12 pr-4 scrollbar-hide divide-y divide-jacarta-100 dark:divide-jacarta-600 bg-gradient-to-b from-gray-50 to-white dark:from-jacarta-900 dark:to-gray-800 rounded-2xl shadow-lg p-6">
      {/* Game Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Game Filter</h1>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="fill-white">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
          </svg>
        </div>
      </div>

      {/* Collections filter */}
      <div>
        <div
          id="filters-collections"
          className="mt-3 collapse show visible"
          aria-labelledby="filters-collections-heading"
        >
          <form onSubmit={(e) => e.preventDefault()} className="relative mb-6">
            <input
              type="search"
              className="w-full rounded-xl border border-jacarta-100 py-3 px-4 pl-12 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white shadow-sm transition-all duration-200 focus:shadow-md"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-5 w-5 fill-jacarta-500 dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"></path>
              </svg>
            </span>
          </form>
        </div>
      </div>

      {/* Categories filter */}
      <div className="mt-4 pt-4">
        <h2 id="filters-categories-heading">
          <button
            className="accordion-button relative flex w-full items-center justify-between py-3 text-left font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#filters-categories"
            aria-expanded="true"
            aria-controls="filters-categories"
          >
            <span>Categories</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="accordion-arrow h-5 w-5 shrink-0 fill-jacarta-700 transition-transform dark:fill-white"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
            </svg>
          </button>
        </h2>
        <div
          id="filters-categories"
          className="mt-3 collapse show visible"
          aria-labelledby="filters-categories-heading"
        >
          <ul className="flex flex-wrap items-center gap-2">
            {categories.map((category, i) => {
              const count = getCategoryCount(category);
              const isSelected = selectedCategories.includes(category);
              const colorTheme = categoryThemes[category] || "from-gray-400 to-gray-600";
              
              return (
                <li
                  key={i}
                  onClick={() => toggleCategory(category)}
                  className="my-1" 
                  onMouseEnter={() => setHoverCategory(category)}
                  onMouseLeave={() => setHoverCategory(null)}
                >
                  <button
                    className={`
                      group flex h-10 items-center rounded-xl px-4 font-display text-sm font-semibold transition-all duration-300 hover:shadow-lg
                      ${isSelected 
                        ? `bg-gradient-to-r ${colorTheme} text-white shadow-md scale-105` 
                        : "bg-white text-jacarta-700 border border-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-900 dark:text-white hover:border-transparent"
                      }
                      ${hoverCategory === category && !isSelected ? `hover:bg-gradient-to-r hover:${colorTheme} hover:text-white` : ""}
                    `}
                  >
                    <span>{category}</span>
                    <span className={`ml-2 rounded-full px-2 py-1 text-xs transition-colors duration-300 ${
                      isSelected 
                        ? "bg-white/20 text-white" 
                        : "bg-jacarta-100 dark:bg-jacarta-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      {/* Game statistics */}
      <div className="mt-6 pt-6">
        <div className="flex justify-between items-center">
          {/* <span className="text-sm text-gray-500 dark:text-gray-400">Total Games</span> */}
          {/* <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">{games.length}</span> */}
        </div>
        <div className="mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" 
            style={{ 
              width: selectedCategories.length > 0 
                ? `${(games.filter(game => game.game_tags && game.game_tags.some(tag => selectedCategories.includes(tag))).length / games.length) * 100}%` 
                : '100%' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}