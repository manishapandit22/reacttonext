import { motion } from "framer-motion";
import { HiOutlineWrenchScrewdriver, HiOutlineShieldCheck, HiOutlineClock } from "react-icons/hi2";

export default function StripeMaintenanceMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F21] to-jacarta-900/30 rounded-3xl  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-jacarta-200/60 rounded-2xl shadow-xl p-8 sm:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-jacarta-base/5 opacity-50 pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-8 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-bright rounded-2xl flex items-center justify-center shadow-lg shadow-orange/25">
            <HiOutlineWrenchScrewdriver className="text-white text-2xl" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl sm:text-4xl font-display font-bold text-jacarta-900 mb-4 tracking-tight"
        >
          Scheduled Maintenance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg font-body text-jacarta-600 mb-8 leading-relaxed"
        >
          We're upgrading our payment infrastructure to serve you better
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-gradient-to-r from-jacarta-50 to-blue-50 rounded-2xl p-6 mb-8 border border-jacarta-200/50"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3">
              <span className="text-jacarta-700 font-body font-medium">Powered by</span>
              {/* Stripe logo */}
              <div className="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg> 
              </div>
            </div>
          </div>
          <p className="text-jacarta-600 font-body text-sm leading-relaxed">
            We're working with Stripe to enhance our payment infrastructure with the latest security standards and improved performance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2lg p-4 border border-jacarta-200/50 shadow-sm">
            <HiOutlineShieldCheck className="text-teal-600 text-xl mb-2 mx-auto" />
            <p className="text-sm text-jacarta-700 font-body font-medium">Enhanced Security</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2lg p-4 border border-jacarta-200/50 shadow-sm">
            <HiOutlineClock className="text-blue-600 text-xl mb-2 mx-auto" />
            <p className="text-sm text-jacarta-700 font-body font-medium">Faster Processing</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-gradient-to-r from-teal-50 to-green/10 border border-teal-400/30 rounded-2lg p-4 mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
            <span className="text-teal-700 font-body font-semibold text-sm">Currently Available</span>
          </div>
          <p className="text-teal-700 font-body text-sm">
            All publishing features remain <strong className="text-teal-800">free to use</strong> during this maintenance period
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-jacarta-500 font-body">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span>Maintenance in progress</span>
          </div>
          <p className="text-xs text-jacarta-400 font-body">
            Payment features will be restored automatically upon completion
          </p>
        </motion.div>

        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-full blur-3xl -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-base/10 to-jacarta-base/10 rounded-full blur-3xl translate-x-20 translate-y-20" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-orange/5 to-orange-bright/5 rounded-full blur-2xl -translate-x-12 -translate-y-12" />
      </motion.div>
    </div>
  );
}