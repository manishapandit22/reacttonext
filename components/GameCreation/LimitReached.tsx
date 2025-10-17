import React from 'react'
import { UserProfile } from '../create_async/Create'

type props = UserProfile;

const LimitReached = ({profile}: {profile: props}) => {
    return (
        <div className="z-10 relative top-[90px] left-0 w-full bg-[#4B5563] text-white p-8 text-center py-24">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-48 bg-gradient-to-br from-[#374151] to-[#1F2937] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <div className="flex flex-col items-center p-4">
                            <div className="text-lg font-medium text-gray-200 mb-4">
                                Game Limit
                            </div>
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg viewBox="0 0 36 36" className="w-full h-full">
                                        <path
                                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#374151"
                                            strokeWidth="3"
                                            strokeDasharray="100, 100"
                                        />
                                        <path
                                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#EF4444"
                                            strokeWidth="3"
                                            strokeDasharray={`${((profile as UserProfile)?.games_created ?? 0) / ((profile as UserProfile)?.max_games_creation_allowed ?? 1) * 100}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-3xl font-bold text-white">
                                            {(profile as UserProfile)?.games_created}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            of {(profile as UserProfile)?.max_games_creation_allowed}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm font-medium text-red-400 px-3 py-1 bg-red-400/10 rounded-full">
                                Limit Reached
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                        Game Creation Limit Reached
                    </h2>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-lg text-gray-300">
                        Need more game slots? Join our Discord community to request
                        additional capacity.
                    </p>
                    <a
                        href="https://discord.com/channels/1308231363522199683/1336183521601130590"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors rounded-lg font-medium"
                    >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 640 512">
                            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                        </svg>
                        Request More Slots on Discord
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LimitReached