import React, { ChangeEvent, useEffect, useState } from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import { handleLocationChange, addLocation, removeLocation, removeLocationImage, handleLocationDelete } from '../../GameCreation/LocationFunctions';
import MultipleImageCardPreview from '../components/MultipleImageCardPreview';
import renderError from '../utils/renderError';
import Button from '../../ui/Button';
import { FormErrors } from '../../GameCreation/FormValidate';
import { HiOutlineLocationMarker, HiOutlineTrash, HiOutlinePlusCircle, HiOutlinePhotograph } from 'react-icons/hi';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useMultiAutoSave } from '@/lib/apis/useSaveWithDebounce';

interface LocationsSectionProps {
  formErrors: FormErrors;
  setSelectedLocation: (index: number) => void;
  setSelectedElement: (element: string) => void;
  setIsAdding: (isAdding: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (locationIndex: number, location: any) => void;
  onDelete: (locationId: string) => void;
  setUnsavedChanges: (val: boolean) => void;
  gameId: string | null;
  setSavedImage: (isSaved: boolean) => void;
  setSelectedSavedImage: (index: number | null) => void;
  setSelectedLocationImage: (index: number | null) => void;
}

const BUTTON_BASE =
  "min-w-[140px] min-h-[40px] flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"; 

const LocationsSection: React.FC<LocationsSectionProps> = ({
  formErrors, setSelectedLocation, setSelectedElement, setIsAdding, setIsOpen, onSave, onDelete, setUnsavedChanges, gameId, setSavedImage, setSelectedSavedImage, setSelectedLocationImage
}) => {
  const { gameData, setGameData, createLocation, updateLocation, deleteLocation, gameId: contextGameId } = useGameContext();
  const [savingLocations, setSavingLocations] = useState<Set<number>>(new Set());
  const [originalLocations, setOriginalLocations] = useState<Map<number, { name: string; description: string; images: any[] }>>(new Map());

  const labelStyling = "text-[15px] font-medium mb-1 text-accent flex items-center gap-1";

  const autoSaveLocation = useMultiAutoSave({
    onSave: async (locationData: { index: number; location: any }) => {
      if (!gameId) return;
      await onSave(locationData.index, locationData.location);
      const newOriginalLocations = new Map(originalLocations);
      newOriginalLocations.set(locationData.index, {
        name: locationData.location.name || '',
        description: locationData.location.description || '',
        images: [...(locationData.location.images || [])]
      });
      setOriginalLocations(newOriginalLocations);
    },
    delay: 2000,
    condition: (locationData: { index: number; location: any }) => {
      return locationData.location.name?.trim() && locationData.location.description?.trim();
    }
  });

  useEffect(() => {
    if (gameData.locations) {
      const newOriginalLocations = new Map();
      gameData.locations.forEach((location, index) => {
        newOriginalLocations.set(index, {
          name: location.name || '',
          description: location.description || '',
          images: [...(location.images || [])]
        });
      });
      setOriginalLocations(newOriginalLocations);
    }
  }, [gameData.locations]);

  const hasLocationChanges = (index: number) => {
    const location = gameData.locations[index];
    const original = originalLocations.get(index);
    
    if (!original) return false;
    
    const currentData = {
      name: location.name || '',
      description: location.description || '',
      images: location.images || []
    };
    
    return (
      currentData.name !== original.name ||
      currentData.description !== original.description ||
      currentData.images.length !== original.images.length ||
      currentData.images.some((img, imgIndex) => 
        !original.images[imgIndex] || 
        JSON.stringify(img) !== JSON.stringify(original.images[imgIndex])
      )
    );
  };

  const handleLocationFieldChange = (index: number, field: string, value: any) => {
    setGameData(prev => {
      const newLocations = [...prev.locations];
      newLocations[index][field] = value;
      return { ...prev, locations: newLocations };
    });
    setUnsavedChanges(true);

    const updatedLocation = { ...gameData.locations[index], [field]: value };
    if (updatedLocation.name?.trim() && updatedLocation.description?.trim()) {
      autoSaveLocation({ index, location: updatedLocation }, `location-${index}-${gameId}`);
    }
  };

  const handleAddImage = (imageData: any, locationIndex: number) => {
    setGameData(prev => {
      const newLocations = [...prev.locations];
      newLocations[locationIndex].images.push(imageData);
      return { ...prev, locations: newLocations };
    });
    setUnsavedChanges(true);
  };

  const handleLocationSave = async (index: number, location: any) => {
    if (!gameId || savingLocations.has(index)) return;
    
    setSavingLocations(prev => new Set(prev).add(index));
    
    try {
      await onSave(index, location);
      const newOriginalLocations = new Map(originalLocations);
      newOriginalLocations.set(index, {
        name: location.name || '',
        description: location.description || '',
        images: [...(location.images || [])]
      });
      setOriginalLocations(newOriginalLocations);
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setSavingLocations(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  return (
    <div className="w-full  mx-auto mb-8 lg:mb-16 animate-fade-in">
      <h3 className="text-lg md:text-2xl lg:text-4xl font-semibold text-accent mb-4 flex items-center gap-1 tracking-tight">
        <HiOutlineLocationMarker className="text-accent-light md:text-2xl lg:text-4xl text-base opacity-70" />
        Locations
      </h3>
      <div className="flex flex-col gap-6">
        {gameData.locations.map((location, index) => {
          if (!location.savedImages) location.savedImages = [];
          const isSaving = savingLocations.has(index);
          const hasId = location.id && location.id !== null;
          const hasChanges = hasLocationChanges(index);
          
          return (
            <div key={index} className="p-5 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 flex flex-col gap-3 animate-fade-in">
              <label className={labelStyling}>
                <HiOutlineLocationMarker className="text-accent-light text-sm opacity-60" />
                Location Name <span className="text-red-400">*</span>
              </label>
              <input
                defaultValue={location.name}
                onChange={e => handleLocationFieldChange(index, "name", e.target.value)}
                placeholder="Location Name *"
                className="custom-input mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
              />
              <label className={labelStyling}>
                <HiOutlinePhotograph className="text-accent-light text-sm opacity-60" />
                Location Description <span className="text-red-400">*</span>
              </label>
              <textarea
                defaultValue={location.description}
                onChange={e => handleLocationFieldChange(index, "description", e.target.value)}
                placeholder="Location description *"
                className="custom-input h-[5rem] mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
              />
              <MultipleImageCardPreview
                files={location.images}
                elementId={location}
                savedFiles={location.savedImages}
                onRemove={(imageIndex: number) => {
                  setGameData(prev => {
                    const newLocations = [...prev.locations];
                    newLocations[index].images = newLocations[index].images.filter((_, i) => i !== imageIndex);
                    return { ...prev, locations: newLocations };
                  });
                  setUnsavedChanges(true);
                }}
                onRemoveURL={(imageIndex: number) => {
                  setGameData(prev => {
                    const newLocations = [...prev.locations];
                    newLocations[index].savedImages = newLocations[index].savedImages.filter((_, i) => i !== imageIndex);
                    return { ...prev, locations: newLocations };
                  });
                  setUnsavedChanges(true);
                }}
                elementIndex={index}
                element="location"
                setSelectedLocation={setSelectedLocation}
                setSelectedElement={setSelectedElement}
                setIsAdding={setIsAdding}
                setIsOpen={setIsOpen}
                gameId={gameId}
                setSavedImage={setSavedImage}
                setSelectedSavedImage={setSelectedSavedImage}
                setSelectedLocationImage={setSelectedLocationImage}
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 justify-end w-full">
                {hasId && (
                  <a
                    data-bs-toggle="modal"
                    data-bs-target="#imageModal"
                    className={
                      "cursor-pointer " +
                      BUTTON_BASE +
                      " bg-accent/90 hover:bg-accent text-white tracking-wider focus:border-none focus:outline-none disabled:bg-opacity-75 disabled:text-opacity-75 disabled:cursor-not-allowed"
                    }
                    style={{ textDecoration: "none" }}
                    onClick={() => {
                      setSelectedLocation(index);
                      setSelectedElement("location");
                      setIsAdding(true);
                      setIsOpen(true);
                    }}
                  >
                    <HiOutlinePhotograph className="text-base" />
                    <span className="ml-1">Add Location Images</span>
                  </a>
                )}
                {hasChanges && (
                  <Button
                    onClick={() => handleLocationSave(index, location)}
                    disabled={isSaving}
                    className={
                      BUTTON_BASE +
                      " bg-accent/90 hover:bg-accent text-white shadow-glow flex items-center gap-2" +
                      (isSaving ? " opacity-50 cursor-not-allowed" : "")
                    }
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        Saving...
                      </>
                    ) : (
                      hasId ? 'Save' : 'Initialize Location'
                    )}
                  </Button>
                )}
                {gameData.locations.length > 1 && (
                  <Button
                    onClick={async () => {
                      if (location.id && gameId) {
                        await handleLocationDelete(gameId, String(location.id), deleteLocation, setGameData);
                      } else {
                        removeLocation(index, gameData, setGameData);
                      }
                    }}
                    className={
                      BUTTON_BASE +
                      " border border-red-500 bg-transparent hover:bg-red-600/10 text-red-500"
                    }
                  >
                    <HiOutlineTrash className="text-base" /> <span className="ml-1">Remove Location</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <Button
          onClick={() => addLocation(gameData, setGameData)}
          className={
            BUTTON_BASE +
            " bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 mt-2 gap-2"
          }
          style={{}}
          onMouseOver={() => { }}
          onMouseLeave={() => { }}
          disabled={false}
        >
          <HiOutlinePlusCircle className="text-accent text-lg" />
          Add more locations
        </Button>
        {renderError("locations", formErrors)}
      </div>
    </div>
  );
};

export default LocationsSection; 