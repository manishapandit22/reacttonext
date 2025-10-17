import { motion } from "framer-motion";
import { FiSettings } from "react-icons/fi";

export default function SettingsButton({ onClick, isOpen }) {
  return (
    <motion.button
      onClick={onClick}
      className={`group w-12 h-12 rounded-md text-white flex justify-center items-center font-medium transition-all duration-300 hover:scale-110 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 relative overflow-hidden ${
        isOpen ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.5 
      }}
      // style={{
      //   position: 'fixed',
      //   bottom: '24px',
      //   right: '24px',
      //   zIndex: 99999,
      //   pointerEvents: 'auto'
      // }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0  transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-95 group-hover:opacity-100'
      }`}></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out rounded-full"></div>

      {/* Animated dots */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-green-300 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Border */}
      <div className="absolute inset-0 border rounded-md border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiSettings className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
        </motion.div>
      </div>

      {/* Click effect */}
      <div className="absolute inset-0  opacity-0 group-active:opacity-100 transition-opacity duration-150">
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
      </div>

      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/80 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm border border-purple-500/30">
          Game Settings
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-black/80 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>
      </div>
    </motion.button>
  );
}