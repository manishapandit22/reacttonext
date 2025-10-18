import { Shield, Sword, Package, ChevronDown, Star, StarOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import useAxiosWithAuth from '@/hooks/useAxiosWithAuth';

function getCategoryIcon(category) {
  switch ((category || '').toLowerCase()) {
    case 'weapon':
    case 'weapon_1h':
    case 'weapon_2h':
      return <Sword className="h-4 w-4 md:h-6 md:w-6 text-red-400" />;
    case 'armor':
      return <Shield className="h-4 w-4 md:h-6 md:w-6 text-blue-400" />;
    default:
      return <Package className="h-4 w-4 md:h-6 md:w-6 text-purple-400" />;
  }
}

function getNormalizedCategory(item) {
  if (!item || !item.category) return 'Other';
  const category = item.category.toLowerCase();
  switch (category) {
    case 'weapon':
    case 'weapon_1h':
    case 'weapon_2h':
      return 'Weapon';
    case 'armor':
      return 'Armor';
    case 'equipment_1h':
    case 'equipment_2h':
      return 'Equipment';
    case 'other':
      return 'Other';
    default:
      return item.category.charAt(0).toUpperCase() + item.category.slice(1);
  }
}

export default function EquippedItemsCard({ inventory, onEquippedItemClick, storyId, onInventoryUpdate }) {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState({});
  const [equipFeedback, setEquipFeedback] = useState({});
  
  const { axiosInstance } = useAxiosWithAuth();

  const getEquipmentRestrictions = () => {
    const equippedArmor = inventory.filter(item => 
      item.equipped && item.category === 'armor'
    ).length;
    
    const equippedWeapons = inventory.filter(item => 
      item.equipped && (item.category === 'weapon' || item.category === 'weapon_1h' || item.category === 'weapon_2h')
    ).length;
    
    const equippedTwoHandedWeapons = inventory.filter(item => 
      item.equipped && item.category === 'weapon_2h'
    ).length;

    return {
      canEquipArmor: equippedArmor < 1,
      canEquipWeapon: equippedWeapons < 2,
      canEquipTwoHandedWeapon: equippedTwoHandedWeapons < 1,
      equippedArmor,
      equippedWeapons,
      equippedTwoHandedWeapons
    };
  };

  const canEquipItem = (item) => {
    if (!item.equipable) return false;
    if (item.equipped) return true; 
    
    const restrictions = getEquipmentRestrictions();
    
    if (item.category === 'armor') {
      return restrictions.canEquipArmor;
    }
    
    if (item.category === 'weapon_2h') {
      return restrictions.canEquipTwoHandedWeapon && restrictions.equippedWeapons === 0;
    }
    
    if (item.category === 'weapon' || item.category === 'weapon_1h') {
      return restrictions.canEquipWeapon && restrictions.equippedTwoHandedWeapons === 0;
    }
    
    return true; 
  };

  const handleEquipToggle = async (item, e) => {
    e.stopPropagation();
    if (!item.equipable) return;
    
    if (!item.equipped && !canEquipItem(item)) {
      const category = item.category;

      const unequipItems = async (itemsToUnequip) => {
        for (const it of itemsToUnequip) {
          try {
            setEquipmentLoading(prev => ({ ...prev, [it.item_id]: true }));
            await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipment/manage/`, {
              story_id: storyId?.story_id,
              item_id: it.item_id,
              action: 'unequip'
            });
            it.equipped = false;
            setEquipFeedback(prev => ({ ...prev, [it.item_id]: 'unequipped' }));
          } catch (err) {
            console.error('Failed to auto-unequip:', it, err);
            return false;
          } finally {
            setEquipmentLoading(prev => ({ ...prev, [it.item_id]: false }));
          }
        }
        return true;
      };

      if (category === 'armor') {
        const currentArmor = inventory.filter(i => i.equipped && i.category === 'armor');
        const ok = await unequipItems(currentArmor);
        if (!ok) {
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'error' }));
          setTimeout(() => setEquipFeedback(prev => ({ ...prev, [item.item_id]: null })), 2000);
          return;
        }
        try {
          setEquipmentLoading(prev => ({ ...prev, [item.item_id]: true }));
          await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipment/manage/`, {
            story_id: storyId?.story_id,
            item_id: item.item_id,
            action: 'equip'
          });
          item.equipped = true;
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'equipped' }));
          if (onInventoryUpdate) setTimeout(() => onInventoryUpdate(), 300);
        } catch (err) {
          console.error('Failed to auto-equip armor:', err);
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'error' }));
        } finally {
          setEquipmentLoading(prev => ({ ...prev, [item.item_id]: false }));
          setTimeout(() => setEquipFeedback(prev => ({ ...prev, [item.item_id]: null })), 2000);
        }
        return;
      }

      if (category === 'weapon_2h') {
        const equippedWeaponsNow = inventory.filter(i => i.equipped && (
          i.category === 'weapon' || i.category === 'weapon_1h' || i.category === 'weapon_2h'
        ));
        const ok = await unequipItems(equippedWeaponsNow);
        if (!ok) {
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'error' }));
          setTimeout(() => setEquipFeedback(prev => ({ ...prev, [item.item_id]: null })), 2000);
          return;
        }
        try {
          setEquipmentLoading(prev => ({ ...prev, [item.item_id]: true }));
          await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipment/manage/`, {
            story_id: storyId?.story_id,
            item_id: item.item_id,
            action: 'equip'
          });
          item.equipped = true;
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'equipped' }));
          if (onInventoryUpdate) setTimeout(() => onInventoryUpdate(), 300);
        } catch (err) {
          console.error('Failed to auto-equip 2H weapon:', err);
          setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'error' }));
        } finally {
          setEquipmentLoading(prev => ({ ...prev, [item.item_id]: false }));
          setTimeout(() => setEquipFeedback(prev => ({ ...prev, [item.item_id]: null })), 2000);
        }
        return;
      }

      const restrictions = getEquipmentRestrictions();
      let message = '';
      if (item.category === 'weapon_2h') {
        message = 'Cannot equip: Two-handed weapon - only 1 allowed';
      } else if (item.category === 'weapon' || item.category === 'weapon_1h') {
        if (restrictions.equippedTwoHandedWeapons > 0) {
          message = 'Cannot equip: Cannot equip with two-handed weapon';
        } else {
          message = 'Cannot equip: Only 2 weapons allowed';
        }
      } else if (item.category === 'armor') {
        message = 'Cannot equip: Only 1 armor allowed';
      }
      console.warn(message);
      setEquipFeedback(prev => ({ ...prev, [item.item_id]: 'restricted' }));
      setTimeout(() => {
        setEquipFeedback(prev => ({ ...prev, [item.item_id]: null }));
      }, 2000);
      return;
    }
    
    const action = item.equipped ? 'unequip' : 'equip';
    const itemId = item.item_id;
    setEquipmentLoading(prev => ({ ...prev, [itemId]: true }));
    const prevEquipped = item.equipped;
    item.equipped = !item.equipped;
    setEquipFeedback(prev => ({ ...prev, [itemId]: action === 'equip' ? 'equipped' : 'unequipped' }));
    
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/equipment/manage/`,
        {
          story_id: storyId?.story_id,
          item_id: itemId,
          action: action
        }
      );
      if (response.status >= 200 && response.status < 300) {
        if (onInventoryUpdate) {
          setTimeout(() => {
            onInventoryUpdate();
          }, 1000);
        }
        
        setTimeout(() => {
          setEquipFeedback(prev => ({
            ...prev,
            [itemId]: null
          }));
        }, 2000);
      } else {
        console.error('Failed to update equipment:', response.statusText || response.status);
        item.equipped = prevEquipped;
        setEquipFeedback(prev => ({ ...prev, [itemId]: 'error' }));
        setTimeout(() => {
          setEquipFeedback(prev => ({ ...prev, [itemId]: null }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      item.equipped = prevEquipped;
      setEquipFeedback(prev => ({ ...prev, [itemId]: 'error' }));
      setTimeout(() => {
        setEquipFeedback(prev => ({ ...prev, [itemId]: null }));
      }, 2000);
    } finally {
      setEquipmentLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const EquipToggle = ({ isEquipped, isLoading, onToggle, feedback, disabled, disabledReason }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <span className={`
          text-xs font-medium transition-all duration-300 select-none min-w-0
          ${!isEquipped 
            ? 'text-gray-400' 
            : 'text-gray-500'
          }
        `}>
          Unequip
        </span>
        
        <button
          onClick={onToggle}
          disabled={isLoading || disabled}
          className={`
            group relative w-8 h-4 rounded-full transition-all duration-300 ease-in-out flex-shrink-0
            focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:ring-offset-1 focus:ring-offset-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isEquipped
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25'
              : disabled
                ? 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shadow-inner'
                : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-inner'
            }
            ${feedback === 'equipped' ? 'ring-1 ring-emerald-400/50' : ''}
            ${feedback === 'unequipped' ? 'ring-1 ring-amber-400/50' : ''}
            ${feedback === 'restricted' ? 'ring-1 ring-red-400/50' : ''}
            ${disabled ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-all duration-300 ease-in-out
              flex items-center justify-center
              ${isEquipped
                ? 'translate-x-4 bg-white shadow-lg shadow-emerald-500/20'
                : disabled
                  ? 'translate-x-0 bg-gray-100 shadow-sm'
                  : 'translate-x-0 bg-white shadow-md'
              }
            `}
          >
            <div className="relative">
              {isLoading ? (
                <Loader2 className="h-1.5 w-1.5 animate-spin text-gray-600" />
              ) : isEquipped ? (
                <Star className="h-1.5 w-1.5 fill-current text-emerald-500" />
              ) : disabled ? (
                <StarOff className="h-1.5 w-1.5 text-gray-300" />
              ) : (
                <StarOff className="h-1.5 w-1.5 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className={`
            absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
            ${isEquipped 
              ? 'bg-gradient-to-r from-emerald-400/20 to-green-400/20' 
              : 'bg-gradient-to-r from-purple-400/20 to-purple-500/20'
            }
          `} />
        </button>
        
        <span className={`
          text-xs font-medium transition-all duration-300 select-none min-w-0
          ${isEquipped 
            ? 'text-emerald-400' 
            : disabled
              ? 'text-gray-300'
              : 'text-gray-400'
          }
        `}>
          Equip
        </span>
      </div>
      
      {disabled && disabledReason && (
        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 z-20 px-2 py-1 rounded text-xs font-medium text-white bg-red-600/90 shadow-lg whitespace-nowrap">
          {disabledReason}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-red-600/90" />
        </div>
      )}
      
      {feedback && (
        <div className={`
          absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-20
          px-2 py-1 rounded-md text-xs font-semibold text-white shadow-lg
          animate-pulse backdrop-blur-sm
          ${feedback === 'equipped' 
            ? 'bg-emerald-500/90' 
            : feedback === 'unequipped'
              ? 'bg-amber-500/90'
              : feedback === 'restricted'
                ? 'bg-red-600/90'
                : 'bg-red-600/90'}
        `}>
          {feedback === 'equipped' ? '✓ Equipped!' : feedback === 'unequipped' ? '✗ Unequipped!' : feedback === 'restricted' ? '⚠ Restricted!' : 'Error!'}
          <div className={`
            absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
            w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent
            ${feedback === 'equipped' 
              ? 'border-b-emerald-500/90' 
              : feedback === 'unequipped'
                ? 'border-b-amber-500/90'
                : feedback === 'restricted'
                  ? 'border-b-red-600/90'
                  : 'border-b-red-600/90'}
          `} />
        </div>
      )}
    </div>
  );
  
  if (!inventory || !Array.isArray(inventory)) return null;
  
  const equipped = inventory.filter(item => item.equipped);
  const unequipped = inventory.filter(item => 
    !item.equipped && 
    item.equipable && 
    (item.quantity === undefined || item.quantity > 0)
  );
  
  const equippedByCategory = equipped.reduce((acc, item) => {
    const category = getNormalizedCategory(item);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const unequippedByCategory = unequipped.reduce((acc, item) => {
    const category = getNormalizedCategory(item);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const toggleDropdown = (category) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleItemClick = (item, category) => {
    if (onEquippedItemClick) {
      onEquippedItemClick(item);
    }
  };

  return (
    <div className="w-full bg-transparent rounded-lg shadow p-1 flex flex-col">
      <span className="font-semibold text-purple-100 mb-2">Equipped Items</span>
      {equipped.length === 0 ? (
        <span className="text-xs text-gray-400 italic">No items equipped</span>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {Object.entries(equippedByCategory).map(([category, items]) => (
            <div key={category} className="w-full">
              <div
                className="flex items-center justify-between p-2 rounded bg-black/40 border border-purple-700/40 cursor-pointer hover:bg-black/50 transition-colors"
                onClick={() => toggleDropdown(category)}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(items[0]?.category)}
                  <span className="text-white font-medium text-sm">
                    {category} ({items.length})
                  </span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${
                    openDropdowns[category] ? 'rotate-180' : ''
                  }`} 
                />
              </div>

              {(openDropdowns[category] !== false) && (
                <div className="mt-1 space-y-1">
                  {items.map(item => {
                    const isEquippable = item.equipable || false;
                    const isEquipped = item.equipped || false;
                    const isLoading = equipmentLoading[item.item_id];
                    const feedback = equipFeedback[item.item_id];
                    const canEquip = canEquipItem(item);
                    const swapEligible = isEquippable && !isEquipped && (item.category === 'armor' || item.category === 'weapon_2h');
                    const restrictions = getEquipmentRestrictions();
                    
                    let disabledReason = null;
                    if (isEquippable && !isEquipped && !canEquip) {
                      if (item.category === 'armor') {
                        disabledReason = 'Only 1 armor allowed';
                      } else if (item.category === 'weapon_2h') {
                        disabledReason = 'Two-handed weapon - only 1 allowed';
                      } else if (item.category === 'weapon' || item.category === 'weapon_1h') {
                        if (restrictions.equippedTwoHandedWeapons > 0) {
                          disabledReason = 'Cannot equip with two-handed weapon';
                        } else {
                          disabledReason = 'Only 2 weapons allowed';
                        }
                      }
                    }

                    return (
                      <div
                        key={item.item_id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-3 py-2 rounded bg-black/30 border border-green-500/40 shadow-sm hover:bg-black/40 transition-colors"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <div 
                          className='flex flex-col items-start flex-1 min-w-0 cursor-pointer'
                          onClick={() => handleItemClick(item, category)}
                        >
                          <span className="text-white font-medium text-sm truncate">
                            {item.item_name}
                          </span>
                          <span className="text-xs text-green-300 capitalize">
                            Equipped • {item.category?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {isEquippable && (
                          <div className="flex-shrink-0 mt-2 sm:mt-0">
                            <EquipToggle
                              isEquipped={isEquipped}
                              isLoading={isLoading}
                              onToggle={(e) => handleEquipToggle(item, e)}
                              feedback={feedback}
                              disabled={!canEquip && !swapEligible}
                              disabledReason={disabledReason}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {openDropdowns[category] && unequippedByCategory[category] && unequippedByCategory[category].length > 0 && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-purple-500/30 pl-2">
                  <div className="text-xs text-gray-400 mb-1">Available to Equip:</div>
                  {unequippedByCategory[category].map(item => {
                    const isEquippable = item.equipable || false;
                    const isEquipped = item.equipped || false;
                    const isLoading = equipmentLoading[item.item_id];
                    const feedback = equipFeedback[item.item_id];
                    const canEquip = canEquipItem(item);
                    const swapEligible = isEquippable && !isEquipped && (item.category === 'armor' || item.category === 'weapon_2h');
                    const restrictions = getEquipmentRestrictions();
                    
                    let disabledReason = null;
                    if (isEquippable && !isEquipped && !canEquip) {
                      if (item.category === 'armor') {
                        disabledReason = 'Only 1 armor allowed';
                      } else if (item.category === 'weapon_2h') {
                        disabledReason = 'Two-handed weapon - only 1 allowed';
                      } else if (item.category === 'weapon' || item.category === 'weapon_1h') {
                        if (restrictions.equippedTwoHandedWeapons > 0) {
                          disabledReason = 'Cannot equip with two-handed weapon';
                        } else {
                          disabledReason = 'Only 2 weapons allowed';
                        }
                      }
                    }

                    return (
                      <div
                        key={item.item_id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-2 py-1 rounded bg-black/20 border border-purple-700/20 shadow-sm hover:bg-black/30 transition-colors"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <div 
                          className='flex flex-col items-start flex-1 min-w-0 cursor-pointer'
                          onClick={() => handleItemClick(item, category)}
                        >
                          <span className="text-gray-300 font-medium text-xs truncate">
                            {item.item_name}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            Unequipped • {item.category?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {isEquippable && (
                          <div className="flex-shrink-0 mt-1 sm:mt-0">
                            <EquipToggle
                              isEquipped={isEquipped}
                              isLoading={isLoading}
                              onToggle={(e) => handleEquipToggle(item, e)}
                              feedback={feedback}
                              disabled={!canEquip && !swapEligible}
                              disabledReason={disabledReason}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}