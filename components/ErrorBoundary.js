'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ErrorBoundary({ error, reset }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (error.message?.includes('auth') || 
        error.message?.includes('unauthorized') || 
        error.message?.includes('token') ||
        error.message?.includes('session') ||
        error.message?.includes('cookie')) {
      router.push('/login');
    }
    
    console.error('Application error:', error);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-white border-opacity-20 shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex justify-center mb-6"
          variants={itemVariants}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white"
            variants={pulseVariants}
            animate="pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold text-center text-white mb-2"
          variants={itemVariants}
        >
          Oops! Something went wrong
        </motion.h2>
        
        <motion.p
          className="text-center text-gray-200 mb-6"
          variants={itemVariants}
        >
          {error.message || "An unexpected error occurred"}
        </motion.p>

        <motion.div 
          className="w-full bg-black bg-opacity-30 rounded-lg p-4 mb-6 font-mono text-sm overflow-x-auto"
          variants={itemVariants}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-red-400 mb-2"
          />
          <p className="text-red-400">
            Error: {error.name} | Code: {error.code || "500"}
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => router.push('/')}
            className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/login')}
            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-4"
          variants={itemVariants}
        >
          <motion.button
            onClick={reset}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </motion.button>
        </motion.div>

        <motion.p
          className="text-center text-gray-300 text-sm mt-6"
          variants={itemVariants}
        >
          Redirecting to home in {countdown} seconds...
        </motion.p>
      </motion.div>
    </div>
  );
}