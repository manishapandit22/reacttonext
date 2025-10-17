/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      display: ["Inter", '"CalSans-SemiBold"', "sans-serif"],
      body: ["Inter", '"DM Sans"', "sans-serif"],
    },
    container: {
      center: true,
      padding: "1rem",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      gray: {
        50: "#EDF3F9",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#d4d4d8",
        400: "#A1A1AA",
        600: "#52525b",
        700: "#374151",
        800: "#27272a",
        900: "#171717",
        950: "#0a0a0a",
      },
      black: "#000000",
      white: "#ffffff",
      accent: {
        DEFAULT: "#8358FF",
        dark: "#7444FF",
        light: "#9E7CFF",
        lighter: "#B9A0FF",
        blue: "#5A8CFF",
        purple: "#A259FF",
      },
      "light-base": "#F5F8FA",
      green: ({ opacityValue }) => opacityValue ? `rgba(16, 185, 129, ${opacityValue})` : "#10b981", // Supports bg-green/10
      teal: {
        50: "#F0FDFA",
        100: "#CCFBF1",
        400: "#2DD4BF",
        500: "#14B8A6",
        600: "#0D9488",
        700: "#0F766E",
      },
      orange: {
        DEFAULT: "#FEB240",
        bright: "#FA6D1E",
        400: "#FB923C",
        500: "#F97316",
        600: "#EA580C",
        700: "#C2410C",
      },
      red: {
        DEFAULT: "#EF4444",
        500: "#EF4444",
        600: "#DC2626",
        700: "#B91C1C",
      },
      blue: {
        base: "#428AF8",
        50: "#EFF6FF",
        100: "#DBEAFE",
        400: "#60A5FA",
        500: "#3B82F6",
        600: "#2563EB",
        700: "#1D4ED8",
        900: "#1E3A8A",
      },
      purple: {
        50: "#F5F3FF",
        100: "#EDE9FE",
        400: "#A78BFA",
        500: "#8B5CF6",
        600: "#7C3AED",
        700: "#6D28D9",
        900: "#4C1D95",
      },
      yellow: {
        400: "#FBBF24",
        500: "#F59E0B",
        600: "#D97706",
      },
      amber: {
        500: "#F59E0B",
        600: "#D97706",
        700: "#B45309",
      },
      indigo: {
        400: "#818CF8",
        500: "#6366F1",
        600: "#4F46E5",
        700: "#4338CA",
      },
      pink: {
        400: "#F472B6",
        500: "#EC4899",
        600: "#DB2777",
        700: "#BE185D",
      },
      rose: {
        400: "#FB7185",
        500: "#F43F5E",
        600: "#E11D48",
        700: "#BE123C",
      },
      cyan: {
        400: "#22D3EE",
        500: "#06B6D4",
        600: "#0891B2",
        700: "#0E7490",
      },
      emerald: {
        400: "#34D399",
        500: "#10B981",
        600: "#059669",
        700: "#047857",
      },
      violet: {
        400: "#A78BFA",
        500: "#8B5CF6",
        600: "#7C3AED",
        700: "#6D28D9",
      },
      brown: {
        500: "#8B4513",
        600: "#6B3612",
        700: "#582F0E",
      },
      slate: {
        400: "#94A3B8",
        500: "#64748B",
        600: "#475569",
        700: "#334155",
      },
      muted: "#f5f6fa",
      jacarta: {
        base: "#5A5D79",
        50: "#F4F4F6",
        100: "#E7E8EC",
        200: "#C4C5CF",
        300: "#A1A2B3",
        400: "#7D7F96",
        500: "#5A5D79",
        600: "#363A5D",
        700: "#131740",
        800: "#101436",
        900: "#0D102D",
      },
    },
    boxShadow: {
      none: "none",
      sm: "0px 1px 2px 0px rgba(13, 16, 45, 0.1)",
      base: "0px 1px 2px -1px rgba(13, 16, 45, 0.1), 0px 2px 4px 0px rgba(13, 16, 45, 0.1)",
      md: "0px 2px 4px -2px rgba(13, 16, 45, 0.1), 0px 4px 6px -1px rgba(13, 16, 45, 0.1)",
      lg: "0px 4px 6px -4px rgba(13, 16, 45, 0.1), 0px 10px 15px -3px rgba(13, 16, 45, 0.1)",
      xl: "0px 8px 10px -6px rgba(13, 16, 45, 0.1), 0px 20px 25px -5px rgba(13, 16, 45, 0.1)",
      "2xl": "0px 25px 50px -12px rgba(13, 16, 45, 0.1), 0px 12px 24px 0px rgba(13, 16, 45, 0.1)",
      "accent-volume": "5px 5px 10px rgba(108, 106, 213, 0.25), inset 2px 2px 6px #A78DF0, inset -5px -5px 10px #6336E4",
      "white-volume": "5px 5px 10px rgba(108, 106, 212, 0.25), inset 2px 2px 6px #EEF1F9, inset -5px -5px 10px #DFE3EF",
      glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      glow: '0 0 8px 2px #8358FF',
    },
    fontSize: {
      xxs: ["0.625rem", { lineHeight: "normal" }],
      xs: ["0.75rem", { lineHeight: "normal" }],
      "2xs": ["0.8125rem", { lineHeight: "normal" }],
      sm: ["0.875rem", { lineHeight: "normal" }],
      base: ["1rem", { lineHeight: "normal" }],
      md: ["1.125rem", { lineHeight: "normal" }],
      lg: ["1.25rem", { lineHeight: "1.5" }],
      xl: ["1.5rem", { lineHeight: "normal" }],
      "2xl": ["1.75rem", { lineHeight: "normal" }],
      "3xl": ["2rem", { lineHeight: "normal" }],
      "4xl": ["2.25rem", { lineHeight: "normal" }],
      "5xl": ["2.5rem", { lineHeight: "normal" }],
      "6xl": ["3.5rem", { lineHeight: "normal" }],
      "7xl": ["4.25rem", { lineHeight: "normal" }],
    },
    extend: {
      borderRadius: {
        '3xl': '1.5rem',
      },
      width: {
        'content-with-sidebar': 'calc(100% - 300px)',
      },
      borderRadius: {
        "2lg": "0.625rem",
        "2.5xl": "1.25rem",
      },
      transitionProperty: {
        height: "height",
        width: "width",
      },
      boxShadow: {
        card: '0 8px 24px rgba(13,16,45,0.08), 0 2px 8px rgba(13,16,45,0.06)',
        popover: '0 12px 32px rgba(13,16,45,0.12), 0 2px 8px rgba(13,16,45,0.06)'
      },
      animation: {
        fly: "fly 6s cubic-bezier(0.75, 0.02, 0.31, 0.87) infinite",
        marquee: "marquee 60s linear infinite",
        marqueeRight: "marqueeRight 60s linear infinite",
        heartBeat: "heartBeat 1s cubic-bezier(0.75, 0.02, 0.31, 0.87) infinite",
        progress: "progress 5s linear",
        "spin-slow": "spin 10s linear infinite",
        gradient: "gradient 6s linear infinite",
        gradientDiagonal: "gradientDiagonal 6s linear infinite",
        'fade-in': 'fadeIn 0.7s ease',
        'bounce-slow': 'bounce 2.5s infinite',
      },
      keyframes: {
        fly: {
          "0%, 100%": { transform: "translateY(5%)" },
          "50%": { transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          to: { transform: "translateX(-2322px)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-2322px)" },
          to: { transform: "translateX(0)" },
        },
        heartBeat: {
          "0%, 40%, 80%, 100%": { transform: "scale(1.1)" },
          "20%, 60%": { transform: "scale(.8)" },
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        gradient: {
          "100%": { backgroundPosition: "200% center" },
        },
        gradientDiagonal: {
          "100%": { backgroundPosition: "200% center" },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(131,88,255,0.12) 100%)',
      },
      blur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
    },
    customGroups: {
      names: ["dropdown"],
    },
  },
  variants: {
    display: ["children", "children-not"],
  },
  corePlugins: {
    visibility: false,
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-custom-groups"),
    function({ addUtilities }) {
      const newUtilities = {
        // Hide scrollbar but keep functionality
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            'display': 'none'
          },
          '-ms-overflow-style': 'none'
        },
        
        // Custom styling for scrollbars when needed
        '.scrollbar-custom': {
          '&::-webkit-scrollbar': {
            'width': '4px',
            'height': '4px'
          },
          '&::-webkit-scrollbar-track': {
            'background': 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            'background': '#8358FF',
            'border-radius': '10px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background': '#7444FF'
          },
          'scrollbar-width': 'thin',
          'scrollbar-color': '#8358FF transparent'
        }
      };
      
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ],
};