import React, { ChangeEvent, useEffect, useState } from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import { handleNPCChange, addNPC, removeNpc, removeNPCImage, handleNPCDelete } from '../../GameCreation/NPCFunctions';
import MultipleImageCardPreview from '../components/MultipleImageCardPreview';
import renderError from '../utils/renderError';
import Button from '../../ui/Button';
import { FormErrors } from '../../GameCreation/FormValidate';
import { HiOutlineUser, HiOutlineTrash, HiOutlinePlusCircle, HiOutlinePhotograph } from 'react-icons/hi';
import { FaRegImages } from 'react-icons/fa';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { NPC } from '../../../interface/Create';
import { useMultiAutoSave } from '@/lib/apis/useSaveWithDebounce';

import NPCClassSelector from '../NPCClassSelector';
import { classDescriptions } from '../utils/classDescription';
import { toast } from 'react-toastify';

interface NPCsSectionProps {
    formErrors: FormErrors;
    setSelectedNPC: (npc: NPC) => void;
    setSelectedElement: (element: string) => void;
    setIsAdding: (isAdding: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
    setSelectedNPCIndex: (index: number | null) => void;
    setCurrentCharacter: (character: any) => void;
    setIsModalOpen: (open: boolean) => void;
    onSave: (npcIndex: number, npc: any) => void;
    onDelete: (npcId: string) => void;
    setUnsavedChanges: (val: boolean) => void;
    gameId: string | null;
    setSavedImage: (isSaved: boolean) => void;
    setSelectedSavedImage: (index: number | null) => void;
}

const COMMON_BUTTON_CLASSES = "min-w-[140px] min-h-[40px] flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200";

const NPCsSection: React.FC<NPCsSectionProps> = ({
    formErrors, setSelectedNPC, setSelectedElement, setIsAdding, setIsOpen, setSelectedNPCIndex, setCurrentCharacter, setIsModalOpen, onSave, onDelete, setUnsavedChanges, gameId, setSavedImage, setSelectedSavedImage
}) => {
    const { gameData, setGameData, createNPC, updateNPC, deleteNPC, gameId: contextGameId } = useGameContext();
    const [savingNPCs, setSavingNPCs] = useState<Set<number>>(new Set());
    const [originalNPCs, setOriginalNPCs] = useState<Map<number, { name: string; description: string; playable: boolean; class: string; images: any[] }>>(new Map());

    const labelStyling = "text-[15px] font-medium mb-1 text-accent flex items-center gap-1";

    React.useEffect(()=>{
        console.log("the game data is after changing 2",gameData)
    },[gameData])

    const autoSaveNPC = useMultiAutoSave({
        onSave: async (npcData: { index: number; npc: any }) => {
            if (!gameId) return;
            await onSave(npcData.index, npcData.npc);
            const newOriginalNPCs = new Map(originalNPCs);
            newOriginalNPCs.set(npcData.index, {
                name: npcData.npc.name || '',
                description: npcData.npc.description || '',
                playable: npcData.npc.playable || false,
                class: npcData.npc.class || '',
                images: [...(npcData.npc.images || [])]
            });
            setOriginalNPCs(newOriginalNPCs);
        },
        delay: 4000,
        condition: (npcData: { index: number; npc: any }) => {
            return npcData.npc.name?.trim() && npcData.npc.description?.trim();
        }
    });

    // Voices for per-NPC selection (fetched once)
    const [voices, setVoices] = useState<any[]>([]);
    const [grouped, setGrouped] = useState<Record<string, any[]>>({});
    const [voicesLoading, setVoicesLoading] = useState(false);

    const DEFAULT_SNIPPET = 'welcome creator, my voice will tell your story';

    useEffect(() => {
        let mounted = true;
        const fetchVoices = async () => {
            setVoicesLoading(true);
            try {
                const res = await fetch('/api/text-to-speech');
                if (!res.ok) throw new Error('Failed to fetch voices');
                const data = await res.json();
                const list = (data.voices || []).map((v: any) => ({ voice_id: v.voice_id, name: v.name, labels: v.labels || {} }));
                if (!mounted) return;
                setVoices(list);
                const g = list.reduce((acc: Record<string, any[]>, v: any) => {
                    const accent = v.labels?.accent || 'Other';
                    const gender = v.labels?.gender || 'Voice';
                    const key = `${accent} ${gender}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(v);
                    return acc;
                }, {});
                setGrouped(g);
            } catch (e) {
                console.error('Failed to load voices', e);
            } finally {
                setVoicesLoading(false);
            }
        };
        fetchVoices();
        return () => { mounted = false; };
    }, []);

    // Browser-safe helper to convert ArrayBuffer to base64 (for caching)
    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
        }
        return typeof btoa === 'function' ? btoa(binary) : '';
    };

    const handlePreviewVoice = async (voiceId: string) => {
        if (!voiceId) return;
        const cacheKey = `tts_preview_${voiceId}`;
        try {
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const audio = new Audio(`data:audio/mpeg;base64,${cached}`);
                    await audio.play();
                    return;
                }
            } catch (e) {
                // ignore
            }

            const res = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: DEFAULT_SNIPPET, voice_id: voiceId })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'TTS failed' }));
                throw new Error(err.error || 'TTS failed');
            }
            const blob = await res.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const b64 = arrayBufferToBase64(arrayBuffer);
            try { localStorage.setItem(cacheKey, b64); } catch (e) {}
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            await audio.play();
        } catch (e: any) {
            console.error('Preview failed', e);
            toast.error('Voice preview failed: ' + (e?.message || e));
        }
    };

    useEffect(() => {
        if (gameData.npcs) {
            const newOriginalNPCs = new Map();
            gameData.npcs.forEach((npc, index) => {
                newOriginalNPCs.set(index, {
                    name: npc.name || '',
                    description: npc.description || '',
                    playable: npc.playable || false,
                    class: npc.class || '',
                    images: [...(npc.images || [])]
                });
            });
            setOriginalNPCs(newOriginalNPCs);
        }
    }, [gameData.npcs]);

    const hasNPCChanges = (index: number) => {
        const npc = gameData.npcs[index];
        const original = originalNPCs.get(index);

        if (!original) return false;

        const currentData = {
            name: npc.name || '',
            description: npc.description || '',
            playable: npc.playable || false,
            class: npc.class || '',
            images: npc.images || []
        };

        return (
            currentData.name !== original.name ||
            currentData.description !== original.description ||
            currentData.playable !== original.playable ||
            currentData.class !== original.class ||
            currentData.images.length !== original.images.length ||
            currentData.images.some((img, imgIndex) =>
                !original.images[imgIndex] ||
                JSON.stringify(img) !== JSON.stringify(original.images[imgIndex])
            )
        );
    };

    const handleNPCFieldChange = (index: number, field: string, value: any) => {
        setUnsavedChanges(true);

        if (field === 'playable') {
            const result = handleNPCChange(index, field as keyof NPC | 'playable' | 'class', value, gameData, setGameData);
            if (result.openModal) {
                setSelectedNPCIndex(result.selectedNPCIndex ?? null);
                setCurrentCharacter({
                    ...result.currentCharacter,
                    index: index,
                });
                setIsModalOpen(true);
            }
        } else if (field === 'class') {
            const result = handleNPCChange(index, field as keyof NPC | 'playable' | 'class', value, gameData, setGameData);
            if (result.openModal) {
                setSelectedNPCIndex(result.selectedNPCIndex ?? null);
                setCurrentCharacter({
                    ...result.currentCharacter,
                    index: index,
                });
                setIsModalOpen(true);
            }
        } else {
            setGameData(prev => {
                const newNpcs = [...prev.npcs];
                newNpcs[index][field] = value;
                return { ...prev, npcs: newNpcs };
            });

            const updatedNPC = { ...gameData.npcs[index], [field]: value };
            if (updatedNPC.name?.trim() && updatedNPC.description?.trim()) {
                autoSaveNPC({ index, npc: updatedNPC }, `npc-${index}-${gameId}`);
            }
        }
    };

    const handleNPCSave = async (index: number, npc: any) => {
        if (!gameId || savingNPCs.has(index)) return;

        setSavingNPCs(prev => new Set(prev).add(index));

        try {
            await onSave(index, npc);
            const newOriginalNPCs = new Map(originalNPCs);
            newOriginalNPCs.set(index, {
                name: npc.name || '',
                description: npc.description || '',
                playable: npc.playable || false,
                class: npc.class || '',
                images: [...(npc.images || [])]
            });
            setOriginalNPCs(newOriginalNPCs);
        } catch (error) {
            console.error('Error saving NPC:', error);
        } finally {
            setSavingNPCs(prev => {
                const newSet = new Set(prev);
                newSet.delete(index);
                return newSet;
            });
        }
    };

    const handleEditCharacterSheet = ({ index, characterSheet, image }) => {
        const npc = gameData.npcs[index];
        setSelectedNPCIndex(index);
        setCurrentCharacter({
            ...characterSheet,
            index: index,
            name: npc.name,
            images: npc.images,
            playable: true
        });
        setIsModalOpen(true);
    };

    return (
        <div className="w-full  mx-auto mb-8 lg:mb-16 animate-fade-in">
            <h3 className="text-lg md:text-2xl lg:text-4xl font-semibold text-accent mb-4 flex items-center gap-1 tracking-tight">
                <HiOutlineUser className="text-accent-light md:text-2xl lg:text-4xl text-base opacity-70" />
                Characters
            </h3>
            <div className="flex flex-col gap-6">
                {gameData.npcs.map((npc, index) => {
                    if (!npc.savedImages) npc.savedImages = [];
                    const isSaving = savingNPCs.has(index);
                    const hasId = npc.id && npc.id !== null;
                    const hasChanges = hasNPCChanges(index);

                    return (
                        <div key={index} className="p-5 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 flex flex-col gap-3 animate-fade-in">
                            <label className={labelStyling}>
                                <HiOutlineUser className="text-accent-light text-sm opacity-60" />
                                Character Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                defaultValue={npc.name}
                                onChange={e => handleNPCFieldChange(index, "name", e.target.value)}
                                placeholder="Character Name *"
                                className="custom-input mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
                            />
                            <label className={labelStyling}>
                                <HiOutlinePhotograph className="text-accent-light text-sm opacity-60" />
                                Character Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                defaultValue={npc.description}
                                onChange={e => handleNPCFieldChange(index, "description", e.target.value)}
                                placeholder="Character description *"
                                className="custom-input h-[5rem] mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
                            />
                            <div className="py-2 flex items-center gap-4">
                                <span className="font-medium text-[15px] text-jacarta-700 dark:text-jacarta-100 mr-2">Is Playable</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={npc.playable || false}
                                        onChange={e => handleNPCFieldChange(index, "playable", e.target.checked)}
                                    />
                                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-jacarta-600 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            {npc.playable && (
                                <NPCClassSelector
                                    npc={npc}
                                    index={index}
                                    classDescriptions={classDescriptions}
                                    handleNPCChange={handleNPCFieldChange}
                                    onEditCharacterSheet={handleEditCharacterSheet}
                                    isProduction={false}
                                    Button={Button}
                                />
                            )}

                            {/* Per-NPC voice selector */}
                            <div className="mt-3">
                                <label className={labelStyling}>Voice</label>
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="flex-1 p-2 border rounded-lg bg-white dark:bg-jacarta-700 dark:text-white"
                                        value={npc.ai_voice || ''}
                                        onChange={e => handleNPCFieldChange(index, 'ai_voice', e.target.value)}
                                    >
                                        {voicesLoading ? <option>Loading voices...</option> : Object.entries(grouped).length === 0 ? (
                                            <option value="">No voices available</option>
                                        ) : (
                                            Object.entries(grouped).map(([group, list]) => (
                                                <optgroup key={group} label={group}>
                                                    {list.map((v: any) => (
                                                        <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))
                                        )}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewVoice(npc.ai_voice || (voices[0] && voices[0].voice_id))}
                                        className="px-3 py-2 bg-accent/90 text-white rounded"
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>

                            <MultipleImageCardPreview
                                files={npc.images}
                                savedFiles={npc.savedImages}
                                elementId={npc}
                                onRemove={(imageIndex: number) => {
                                    setGameData(prev => {
                                        const newNpcs = [...prev.npcs];
                                        newNpcs[index].images = newNpcs[index].images.filter((_, i) => i !== imageIndex);
                                        return { ...prev, npcs: newNpcs };
                                    });
                                    setUnsavedChanges(true);
                                }}
                                onRemoveURL={(imageIndex: number) => {
                                    setGameData(prev => {
                                        const newNpcs = [...prev.npcs];
                                        newNpcs[index].savedImages = newNpcs[index].savedImages.filter((_, i) => i !== imageIndex);
                                        return { ...prev, npcs: newNpcs };
                                    });
                                    setUnsavedChanges(true);
                                }}
                                elementIndex={index}
                                element="NPC"
                                setSelectedNPC={(i: number) => setSelectedNPCIndex(i)}
                                setSelectedElement={setSelectedElement}
                                setIsAdding={setIsAdding}
                                setIsOpen={setIsOpen}
                                setSelectedNPCImage={(imageIndex: number) => {
                                    setSelectedNPCIndex(index);
                                }}
                                gameId={gameId}
                                setSavedImage={setSavedImage}
                                setSelectedSavedImage={setSelectedSavedImage}
                            />
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 justify-end">
                                {hasId && (
                                    <a
                                        data-bs-toggle="modal"
                                        data-bs-target="#imageModal"
                                        className={
                                            "cursor-pointer flex items-center gap-2 bg-accent/90 hover:bg-accent text-white tracking-wider focus:border-none focus:outline-none disabled:bg-opacity-75 disabled:text-opacity-75 disabled:cursor-not-allowed " +
                                            COMMON_BUTTON_CLASSES
                                        }
                                        style={{ textDecoration: "none" }}
                                        onClick={() => {
                                            setSelectedNPC(npc);
                                            setSelectedNPCIndex(index);
                                            setSelectedElement("NPC");
                                            setIsAdding(true);
                                            setIsOpen(true);
                                        }}
                                    >
                                        <FaRegImages className="text-base" />
                                        Add NPC images
                                    </a>
                                )}
                                {hasChanges && (
                                    <Button
                                        onClick={() => handleNPCSave(index, npc)}
                                        disabled={isSaving}
                                        className={
                                            "bg-accent/90 hover:bg-accent text-white shadow-glow flex items-center gap-2 " +
                                            COMMON_BUTTON_CLASSES +
                                            (isSaving ? " opacity-50 cursor-not-allowed" : "")
                                        }
                                    >
                                        {isSaving ? (
                                            <>
                                                <LoadingSpinner size="sm" className="text-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            hasId ? 'Save' : 'Initialize Character'
                                        )}
                                    </Button>
                                )}
                                {gameData.npcs.length > 1 && (
                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            if (gameId && npc.id) {
                                                await handleNPCDelete(gameId, String(npc.id), deleteNPC, setGameData);
                                            } else {
                                                removeNpc(index, gameData, setGameData)
                                            }
                                        }}
                                        className={
                                            "border border-red-500 bg-transparent hover:bg-red-600/10 text-red-500 " +
                                            COMMON_BUTTON_CLASSES
                                        }
                                        style={{}}
                                        onMouseOver={() => { }}
                                        onMouseLeave={() => { }}
                                        disabled={false}
                                    >
                                        <HiOutlineTrash className="text-base" />
                                        Remove character
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <Button
                    onClick={() => addNPC(gameData, setGameData)}
                    className={
                        "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 mt-2 " +
                        COMMON_BUTTON_CLASSES
                    }
                    style={{}}
                    onMouseOver={() => { }}
                    onMouseLeave={() => { }}
                    disabled={false}
                >
                    <HiOutlinePlusCircle className="text-accent text-lg" />
                    Add more npcs
                </Button>
                {renderError("npcs", formErrors)}
                {renderError("npcsPlayable", formErrors)}
            </div>
        </div>
    );
};

export default NPCsSection; 