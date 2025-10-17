import { FaGamepad, FaArrowRight } from "react-icons/fa";

export default function HeroInfo(): JSX.Element {
  return (
    <div className="w-full max-w-md lg:max-w-none lg:w-1/2 flex justify-center items-center mt-8 lg:mt-0 py-4 sm:py-6">
      <div className="w-full max-w-sm sm:max-w-md game-preview">
        <div className="bg-[#141428] rounded-xl overflow-hidden shadow-2xl border border-accent/10 transition-all duration-300 hover:shadow-accent/5 hover:border-accent/30">
          <div className="bg-gradient-to-r from-[#1c1c3a] to-[#252550] p-4 sm:p-6 border-b border-accent/10">
            <div className="flex items-center">
              <div className="bg-accent/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                <FaGamepad className="text-accent text-lg sm:text-xl" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-display text-lg sm:text-xl">The Lost Ruins</h3>
                <div className="flex flex-wrap items-center text-xs text-white/50 mt-1">
                  <span>Interactive Adventure</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"></div>
                    <span>Chapter 1 of 8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-b border-white/5 bg-[#1a1a36]">
            <p className="text-white mb-4 sm:mb-6 text-left leading-relaxed text-sm sm:text-base">
              As you enter the ancient temple, moonlight filters through cracks in the ceiling, illuminating strange markings on the walls. Your torch reveals three possible paths ahead...
            </p>
            
            <div className="space-y-2 sm:space-y-3 mt-6 sm:mt-8">
              <button className="game-choice-button w-full text-left flex items-center px-3 sm:px-4 py-3 sm:py-3.5 rounded bg-accent/20 text-white border-l-4 border-accent text-sm sm:text-base">
                <FaArrowRight className="mr-2 sm:mr-3 text-accent" />
                <span>Continue exploring the ruins</span>
              </button>
              
              <button className="game-choice-button w-full text-left flex items-center px-3 sm:px-4 py-3 sm:py-3.5 rounded bg-[#22224b]/70 text-white hover:bg-accent/20 border-l-4 border-transparent hover:border-accent text-sm sm:text-base">
                <FaArrowRight className="mr-2 sm:mr-3 text-accent/70" />
                <span>Speak with the mysterious figure</span>
              </button>
              
              <button className="game-choice-button w-full text-left flex items-center px-3 sm:px-4 py-3 sm:py-3.5 rounded bg-[#22224b]/70 text-white hover:bg-accent/20 border-l-4 border-transparent hover:border-accent text-sm sm:text-base">
                <FaArrowRight className="mr-2 sm:mr-3 text-accent/70" />
                <span>Return to the village</span>
              </button>
            </div>
          </div>
          
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#121225] flex flex-wrap sm:flex-nowrap justify-between items-center">
            <div className="flex flex-wrap sm:flex-nowrap items-center text-xs text-white/50 w-full sm:w-auto mb-2 sm:mb-0">
              <div className="flex items-center mr-3 sm:mr-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
                <span>450 players</span>
              </div>
              <div className="pl-0 sm:pl-4 border-l-0 sm:border-l border-white/10 mt-1 sm:mt-0">
                <span>Updated 2h ago</span>
              </div>
            </div>
            
            <div className="flex items-center bg-white/5 px-2 py-1 rounded">
              <div className="flex mr-1.5">
                {[1, 2, 3, 4, 5].map((star: number) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-white">4.9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}