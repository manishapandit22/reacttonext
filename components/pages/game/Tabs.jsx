import { useState } from 'react';
import NPCs from "./NPCs";
import Locations from "./Locations";

export default function Tabs({ game }) {
  const [activeTab, setActiveTab] = useState('characters');

  const tabs = [
    {
      id: 'characters',
      label: 'Characters',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      component: <NPCs npcs={game?.game_npc} />
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      component: <Locations locations={game?.game_location} />
    }
  ];

  return (
    <div className="mt-8 max-w-6xl mx-auto pb-12">
      {/* Modern Tab Navigation */}
      <div className="relative">
        <div className="flex space-x-2 rounded-xl bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 p-1 shadow-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-out
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-slate-400 text-slate-700 dark:text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }
              `}
            >
              <span className={`transition-colors duration-200 ${
                activeTab === tab.id ? 'text-blue-500' : ''
              }`}>
                {tab.icon}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
        
        {/* Animated underline */}
        {/* <div className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
             style={{
               left: `${tabs.findIndex(tab => tab.id === activeTab) * 50}%`,
               width: `${100 / tabs.length}%`
             }} /> */}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`transition-all duration-300 ease-out ${
              activeTab === tab.id
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 absolute pointer-events-none translate-y-4'
            }`}
          >
            {activeTab === tab.id && tab.component}
          </div>
        ))}
      </div>
    </div>
  );
}