import React, { useState } from 'react';
import { PiGameControllerFill } from "react-icons/pi";
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface SubmitSectionProps {
  onSubmit: () => void;
  isEdit?: boolean;
  isFormValid?: boolean;
  isSubmitting?: boolean;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({ onSubmit, isEdit, isFormValid = false, isSubmitting = false }) => {
    const [triggerJelloAnimations, setTriggerJelloAnimation] = useState(false);

    return (
        <div className="w-full max-w-2xl mx-auto mt-10 mb-4 flex justify-center animate-fade-in">
            {isFormValid ? (
                <Button
                    type="submit"
                    size="lg"
                    className={`w-full max-w-md flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent/90 hover:bg-accent text-white font-semibold text-lg shadow-glow transition-all duration-200 backdrop-blur-md border border-white/10 dark:border-jacarta-700/40 ${triggerJelloAnimations ? "animate-bounce-slow" : ""} ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{}}
                    onMouseOver={() => !isSubmitting && setTriggerJelloAnimation(true)}
                    onMouseLeave={() => setTriggerJelloAnimation(false)}
                    disabled={isSubmitting}
                    onClick={onSubmit}
                >
                    <span className="flex items-center gap-2">
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="lg" className="text-white" />
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <PiGameControllerFill className="text-2xl text-white drop-shadow-glow" />
                                {isEdit ? 'Update Game' : 'Create Game'}
                            </>
                        )}
                    </span>
                </Button>
            ) : (
                <div className="w-full max-w-md p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                        Please complete all required fields to {isEdit ? 'update' : 'create'} your game
                    </p>
                    <p className="text-yellow-500/70 dark:text-yellow-400/70 text-sm mt-1">
                        Required: Game Name, Game Opener, Preview Image, Game Tags
                    </p>
                    <p className="text-yellow-500/70 dark:text-yellow-400/70 text-xs mt-1">
                        Optional: Locations (with images), NPCs (with images, at least one playable)
                    </p>
                </div>
            )}
        </div>
    );
};

export default SubmitSection; 