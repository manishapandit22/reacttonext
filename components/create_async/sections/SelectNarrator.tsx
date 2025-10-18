import React from 'react';
import VoiceSelector from '../../common/VoiceSelector';

interface SelectNarratorProps {
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

const SelectNarrator: React.FC<SelectNarratorProps> = ({ selectedVoice, setSelectedVoice }) => {
  return (
    <VoiceSelector
      selectedVoice={selectedVoice}
      onVoiceChange={setSelectedVoice}
      label="Select Narrator Voice"
      showPreview={true}
    />
  );
};

export default SelectNarrator;