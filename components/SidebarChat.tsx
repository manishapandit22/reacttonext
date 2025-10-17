"use client"

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const HERO_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiL9GPfMZnIJHlpD-TDI_s9wr14ETq78Aipg&s";
const ENEMY_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ80-VJKOKdETxoYhdnn4clEjyQ9NIYNS-V7w&s";

const CombatMessage = ({
  message,
  character,
  enemy,
  isPlayerMessage = false,
}) => {
  const [damageAmount, setDamageAmount] = useState(null);
  const [combatAction, setCombatAction] = useState(null);
  const [targetType, setTargetType] = useState(null);

  useEffect(() => {
    if (!message.content) return;

    const content = message.content.toLowerCase();
    const damageRegex = /(\d+)\s*(?:damage|hp|health|points?)/i;
    const damageMatch = message.content.match(damageRegex);
    if (damageMatch) {
      setDamageAmount(parseInt(damageMatch[1]));
    }

    const actionRegex =
      /(attack|hit|strike|cast|heal|defend|dodge|block|critical|miss)/i;
    const actionMatch = content.match(actionRegex);
    if (actionMatch) {
      setCombatAction(actionMatch[1]);
    }

    if (
      content.includes("you") ||
      content.includes("player") ||
      content.includes(character?.name?.toLowerCase())
    ) {
      setTargetType("player");
    } else if (enemy && content.includes(enemy.name?.toLowerCase())) {
      setTargetType("enemy");
    }
  }, [message.content, character, enemy]);

  const getActionColor = (action) => {
    switch (action) {
      case "attack":
      case "hit":
      case "strike":
        return "text-red-500";
      case "heal":
        return "text-green-500";
      case "defend":
      case "block":
        return "text-blue-500";
      case "critical":
        return "text-yellow-500";
      case "miss":
      case "dodge":
        return "text-gray-500";
      default:
        return "text-purple-500";
    }
  };

  const getDamageIndicator = () => {
    if (!damageAmount) return null;
    const isHealing = combatAction === "heal";
    const color = isHealing ? "text-green-400" : "text-red-400";
    const symbol = isHealing ? "+" : "-";
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 ${color} text-sm font-bold`}
      >
        <span>
          {symbol}
          {damageAmount}
        </span>
        {isHealing ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            />
          </svg>
        )}
      </div>
    );
  };

  const formatCombatContent = (content) => {
    if (!content) return content;
    content = content.replace(
      /(\d+)\s*(damage|hp|health|points?)/gi,
      '<span class="font-bold text-red-400">$1 $2</span>'
    );
    content = content.replace(
      /(attack|hit|strike|cast|heal|defend|dodge|block|critical|miss)/gi,
      '<span class="font-semibold text-purple-400">$1</span>'
    );
    if (character?.name) {
      content = content.replace(
        new RegExp(`(${character.name})`, "gi"),
        '<span class="font-bold text-blue-400">$1</span>'
      );
    }
    if (enemy?.name) {
      content = content.replace(
        new RegExp(`(${enemy.name})`, "gi"),
        '<span class="font-bold text-red-400">$1</span>'
      );
    }
    return content;
  };

  const getAvatar = () => {
    if (isPlayerMessage) {
      return HERO_IMAGE;
    } else {
      return ENEMY_IMAGE;
    }
  };

  const getCharacterInfo = () => {
    if (isPlayerMessage && character) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/50">
            <img
              src={getAvatar()}
              alt={character.name || "Character"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-blue-400">
              {character.name}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">
                HP: {character.current_hp || character.hp}
              </span>
              <span className="text-blue-400">
                MP: {character.current_mp || character.mp}
              </span>
            </div>
          </div>
        </div>
      );
    } else if (!isPlayerMessage && enemy) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500/50">
            <img
              src={getAvatar()}
              alt={enemy.name || "Enemy"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-red-400">
              {enemy.name}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400">
                HP: {enemy.current_hp || enemy.hp}
              </span>
              <span className="text-yellow-400">
                Level: {enemy.level || 1}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex mb-4 ${isPlayerMessage ? "justify-end" : "justify-start"
        }`}
    >
      <div
        className={`max-w-[85%] md:max-w-2xl ${isPlayerMessage ? "order-2" : ""
          }`}
      >
        {getCharacterInfo()}
        <div
          className={`relative px-4 py-3 rounded-2xl ${isPlayerMessage
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white border border-red-500/30 shadow-md"
            }`}
        >
          {combatAction && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 ${getActionColor(
                  combatAction
                )} text-xs font-medium uppercase`}
              >
                <span>{combatAction}</span>
                {combatAction === "critical" && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              {getDamageIndicator()}
            </div>
          )}
          <div
            dangerouslySetInnerHTML={{
              __html: formatCombatContent(message.content),
            }}
          />
        </div>
      </div>
    </div>
  );
};

function SidebarCombatModal({
  open,
  onClose,
  messages = [],
  character = null,
  enemy = null,
  onSendMessage,
  suggestions = [],
  onSuggestionClick,
  isNewCombat = false,
  combatStats = null,
}) {
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSendMessage = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCombatActions = () => [
    { label: "⚔️ Attack", action: "attack" },
    { label: "🛡️ Defend", action: "defend" },
    { label: "💨 Dodge", action: "dodge" },
    { label: "🔥 Special Attack", action: "special_attack" },
    { label: "💊 Use Item", action: "use_item" },
    { label: "🏃 Flee", action: "flee" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-label="Close combat chat sidebar"
      />
      {/* Sidebar */}
      <aside
        className="relative ml-auto h-full w-full sm:w-[420px] md:w-[480px] max-w-full bg-gradient-to-b from-gray-900 to-black shadow-2xl border-l border-purple-500/30 flex flex-col"
        style={{
          transition: "transform 0.3s",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-purple-500/30">
          <div>
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              🗡️ Combat Chat
            </h2>
            <p className="text-xs text-gray-400">
              Interactive combat messaging
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Combat Status Bar */}
        {(character || enemy) && (
          <div className="flex justify-between items-center p-4 bg-black/50 border-b border-purple-500/30">
            {character && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">
                  <img
                    src={HERO_IMAGE}
                    alt={character.name || "Character"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-blue-400">
                    {character.name}
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-green-400">
                      HP: {character.current_hp || character.hp}/
                      {character.max_hp || character.hp}
                    </span>
                    <span className="text-blue-400">
                      MP: {character.current_mp || character.mp}/
                      {character.max_mp || character.mp}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {enemy && (
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-bold text-red-400 text-right">
                    {enemy.name}
                  </div>
                  <div className="flex gap-3 text-sm justify-end">
                    <span className="text-red-400">
                      HP: {enemy.current_hp || enemy.hp}/
                      {enemy.max_hp || enemy.hp}
                    </span>
                    <span className="text-yellow-400">
                      Lvl: {enemy.level || 1}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/50">
                  <img
                    src={ENEMY_IMAGE}
                    alt={enemy.name || "Enemy"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <CombatMessage
              key={message.id || index}
              message={message}
              character={character}
              enemy={enemy}
              isPlayerMessage={message.sent_by_user}
            />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Combat Actions */}
        <div className="p-4 bg-black/50 border-t border-purple-500/30">
          <div className="flex gap-2 flex-wrap mb-4">
            {getCombatActions().map((action, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(action.action)}
                className="px-3 py-2 text-sm bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-200 border border-purple-500/30"
              >
                {action.label}
              </button>
            ))}
          </div>
          {/* Custom Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() =>
                    onSuggestionClick?.(
                      suggestion.title + " " + suggestion.subtitle
                    )
                  }
                  className="px-3 py-2 text-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 border border-indigo-500/30"
                >
                  {suggestion.title}
                </button>
              ))}
            </div>
          )}
          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your combat action..."
              className="flex-1 px-4 py-2 bg-gray-800/80 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function CombatChatSidebarDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content:
        "A wild Shadow Wolf appears! The creature's eyes glow with malevolent energy as it circles you menacingly.",
      sent_by_user: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      content: "I ready my sword and prepare to attack the Shadow Wolf!",
      sent_by_user: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      content:
        "Aria strikes with her enchanted blade! The Shadow Wolf howls as it takes 25 damage from the critical hit!",
      sent_by_user: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 4,
      content:
        "The Shadow Wolf retaliates with a fierce bite attack! Aria dodges gracefully but still takes 12 damage.",
      sent_by_user: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 5,
      content: "I cast healing light on myself!",
      sent_by_user: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: 6,
      content:
        "Aria channels divine energy and heals herself for 15 hp! Golden light surrounds her as her wounds close.",
      sent_by_user: false,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dummyCharacter = {
    name: "Aria Moonwhisper",
    avatar: HERO_IMAGE,
    current_hp: 78,
    hp: 100,
    max_hp: 100,
    current_mp: 45,
    mp: 60,
    max_mp: 60,
    level: 12,
    class: "Paladin",
  };

  const dummyEnemy = {
    name: "Shadow Wolf",
    image: ENEMY_IMAGE,
    current_hp: 35,
    hp: 60,
    max_hp: 60,
    level: 8,
    type: "Beast",
  };

  const dummySuggestions = [
    { title: "Power Strike", subtitle: "- Strong melee attack" },
    { title: "Shield Bash", subtitle: "- Stun enemy" },
    { title: "Divine Smite", subtitle: "- Holy damage" },
    { title: "Blessing", subtitle: "- Buff allies" },
  ];

  const handleSendMessage = (message) => {
    const newMessage = {
      id: messages.length + 1,
      content: message,
      sent_by_user: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => {
      const responses = [
        "Your attack connects! The Shadow Wolf snarls and takes 18 damage.",
        "The Shadow Wolf attempts to defend but your strike finds its mark for 22 damage!",
        "You miss! The Shadow Wolf nimbly dodges your attack.",
        "Critical hit! Your weapon glows with power as you deal 35 damage!",
        "The Shadow Wolf counters your attack, dealing 8 damage to you.",
        "You successfully heal yourself for 20 hp with a potion.",
      ];
      const aiResponse = {
        id: messages.length + 2,
        content:
          responses[Math.floor(Math.random() * responses.length)],
        sent_by_user: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="w-full h-screen max-w-4xl mx-auto relative">
      <div className="bg-gray-900 text-white p-4 border-b border-purple-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-400">
            🗡️ Combat Chat System Demo
          </h1>
          <p className="text-gray-400 mt-1">
            Interactive combat messaging with damage tracking and action parsing
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-200 border border-purple-500/30"
        >
          Open Combat Chat
        </button>
      </div>
      {/* Main content area */}
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <span className="text-gray-400 text-lg">
          Main app content goes here...
        </span>
      </div>
      {/* Sidebar Modal */}
      <SidebarCombatModal
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        messages={messages}
        character={dummyCharacter}
        enemy={dummyEnemy}
        onSendMessage={handleSendMessage}
        suggestions={dummySuggestions}
        onSuggestionClick={handleSuggestionClick}
        isNewCombat={false}
      />
    </div>
  );
}