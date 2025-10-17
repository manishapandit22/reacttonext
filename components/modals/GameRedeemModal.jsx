import React, { useState, useEffect } from 'react';
import { Gift, Star, Zap, Copy, Check, Gamepad2, Crown, Sparkles, Trophy, Target, Shield, Flame } from 'lucide-react';

const RedeemCouponCard = ({isOpen}) => {
  const [copied, setCopied] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(23 * 3600 + 45 * 60 + 32); 
  
  const playerData = {
    username: "ShadowHunter92",
    level: 47,
    rank: "Diamond III",
    avatar: "🎮", /**@author Saksham - dont forget to replace it woht real game imgae */ 
    totalPlaytime: "247h",
    favoriteMode: "Battle Royale",
    achievements: 89,
    winRate: 73,
    personalizedCode: "SHADOW92-VIP"
  };

  const personalizedRewards = [
    { icon: Crown, text: "Legendary Skin Pack", color: "text-yellow-400", bgColor: "bg-yellow-400/20" },
    { icon: Zap, text: `${playerData.level}x XP Multiplier`, color: "text-accent-blue", bgColor: "bg-accent-blue/20" },
    { icon: Shield, text: "Battle Pass Premium", color: "text-teal-400", bgColor: "bg-teal-400/20" },
    { icon: Flame, text: "Exclusive Emotes Pack", color: "text-orange-400", bgColor: "bg-orange-400/20" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(playerData.personalizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = () => {
    setIsRedeemed(true);
    setTimeout(() => setIsRedeemed(false), 3000);
  };

  if(!isOpen){
    return null;
  }

else return (
    <div className="min-h-screen fixed min-w-full z-50  bg-black/60  p-6 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce-slow opacity-60">⭐</div>
          <div className="absolute top-32 right-16 w-2 h-2 bg-accent-light rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-20 w-4 h-4 text-teal-400 animate-bounce-slow opacity-70" style={{ animationDelay: '1s' }}>💎</div>
          <div className="absolute bottom-32 right-8 w-3 h-3 text-orange-400 animate-bounce-slow opacity-60" style={{ animationDelay: '1.5s' }}>🔥</div>
        </div>

        <div className="relative bottom-12 max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent via-teal-400 to-yellow-400 rounded-2.5xl blur-lg opacity-30 animate-gradient"></div>
          
          <div className="relative bg-jacarta-800/90 backdrop-blur-xl border border-white/10 rounded-2.5xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-accent/20 via-accent-blue/20 to-teal-400/20 p-6 pb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-teal-400/10 animate-gradientDiagonal"></div>
              
              <div className="relative flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-accent to-accent-dark p-3 rounded-full text-2xl">
                    {playerData.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-jacarta-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {playerData.level}
                  </div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Welcome back,</h2>
                  <p className="text-accent-light font-semibold">{playerData.username}</p>
                  <div className="flex items-center gap-2 text-xs text-jacarta-300">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span>{playerData.rank}</span>
                    <span>•</span>
                    <span>{playerData.winRate}% Win Rate</span>
                  </div>
                </div>
              </div>

              <div className="text-center relative z-10">
                <h1 className="text-xl font-bold text-white mb-1">Exclusive Creator Reward</h1>
                <p className="text-jacarta-200 text-sm flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Handpicked for {playerData.favoriteMode} Champions
                  <Sparkles className="w-4 h-4" />
                </p>
              </div>
            </div>

            <div className="p-6 pt-4">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-semibold">Limited Time</span>
                  </div>
                  <div className="text-white font-mono text-sm">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-jacarta-700/50 to-jacarta-600/30 rounded-2lg p-4 mb-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-accent to-teal-400 p-2 rounded-lg">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">75% OFF Premium Pack</h3>
                    <p className="text-jacarta-300 text-sm">Curated for Level {playerData.level}+ Players</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  {personalizedRewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-3 text-jacarta-200">
                      <div className={`p-1.5 rounded-lg ${reward.bgColor}`}>
                        <reward.icon className={`w-4 h-4 ${reward.color}`} />
                      </div>
                      <span>{reward.text}</span>
                      {index === 0 && <span className="text-yellow-400 text-xs font-bold ml-auto">NEW!</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-accent-light font-bold">{playerData.achievements}</div>
                      <div className="text-xs text-jacarta-400">Achievements</div>
                    </div>
                    <div>
                      <div className="text-teal-400 font-bold">{playerData.totalPlaytime}</div>
                      <div className="text-xs text-jacarta-400">Playtime</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-bold">+50%</div>
                      <div className="text-xs text-jacarta-400">Bonus XP</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-jacarta-300 text-sm font-medium mb-2">
                  Your Personal Code
                </label>
                <div className="relative">
                  <div className="flex items-center bg-jacarta-700/50 border border-accent/30 rounded-xl overflow-hidden">
                    <input
                      type="text"
                      value={playerData.personalizedCode}
                      readOnly
                      className="flex-1 bg-transparent text-accent-light px-4 py-3 text-lg font-mono tracking-wider focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 text-accent-light hover:text-accent transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {copied && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-lg animate-fade-in">
                      Code Copied!
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleRedeem}
                disabled={isRedeemed}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden ${
                  isRedeemed
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-accent to-teal-400 text-white hover:from-accent-dark hover:to-teal-500 shadow-glow hover:shadow-xl'
                } disabled:cursor-not-allowed`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-gradient"></div>
                {isRedeemed ? (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Welcome to Premium, {playerData.username}!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    Claim Your Rewards
                  </div>
                )}
              </button>

              <div className="mt-4 text-center text-xs text-jacarta-400">
                <p>Exclusive offer expires in {formatTime(timeLeft)}</p>
                <p className="mt-1">🎯 Recommended based on your {playerData.favoriteMode} performance</p>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full"></div>
            
            <div className="absolute top-4 right-4 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-2 py-1">
              <span className="text-yellow-400 text-xs font-bold">VIP</span>
            </div>
          </div>

          {isRedeemed && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-2.5xl flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="bg-green-500 p-6 rounded-full animate-bounce-slow mx-auto mb-3">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <p className="text-white font-bold">Premium Activated!</p>
                <p className="text-green-200 text-sm">+{playerData.level * 100} XP Bonus Applied</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedeemCouponCard;