import React, { useState, useRef } from 'react';
import { useGameContext } from '../../contexts/GameContext';

const NPCClassSelector = ({
  npc,
  index,
  classDescriptions,
  handleNPCChange: handleNPCChangeProp,
  onEditCharacterSheet,
  isProduction = false,
  Button
}) => {
  const { setGameData } = useGameContext();
  const handleNPCChange = handleNPCChangeProp || ((index, field, value) => {
    setGameData(prev => {
      const npcs = [...prev.npcs];
      npcs[index] = { ...npcs[index], [field]: value };
      return { ...prev, npcs };
    });
  });
  const [hoveredClass, setHoveredClass] = useState(null);
  const selectRef = useRef(null);

  const handleOptionHover = (e) => {
    setHoveredClass(e.target.value);
  };

  const handleMouseOut = () => {
    setHoveredClass(null);
  };

  const handleEditClick = () => {
    onEditCharacterSheet({
      index,
      characterSheet: npc.characterSheet,
      image: npc.images[0]?.file || ""
    });
  };

  if (isProduction || !npc.playable) {
    return null;
  }

  return (
    <div className="py-4 flex items-center gap-4">
      <label className="font-semibold mr-4">Class</label>
      <div className="w-full hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:placeholder:text-jacarta-300 relative">
        <select
          ref={selectRef}
          value={npc.class}
          onChange={(e) => handleNPCChange(index, "class", e.target.value)}
          className="w-48 custom-input"
          onFocus={() => {}}
          onMouseOver={handleOptionHover}
          onMouseOut={handleMouseOut}
        >
          <option value="">Select Class</option>
          {Object.keys(classDescriptions).map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
        {hoveredClass && (
          <div className="absolute z-10 mt-1 bg-white dark:bg-jacarta-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-4 max-w-xs">
            <h4 className="font-bold mb-2">{hoveredClass}</h4>
            <p className="text-sm">{classDescriptions[hoveredClass]}</p>
          </div>
        )}
      </div>
      {npc.class && (
        <Button size="sm" onClick={handleEditClick}>
          Edit Character Sheet
        </Button>
      )}
    </div>
  );
};

export default NPCClassSelector;