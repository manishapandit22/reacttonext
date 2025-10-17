import { useState } from "react";

export const APIConfigPanel = ({ onGenerate, isGenerating, progress, error }) => {
  const [prompt, setPrompt] = useState('medieval castle throne room with stone floors and pillars');
  const [apiKey, setApiKey] = useState('');
  const [sceneSize, setSceneSize] = useState(10);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim() || !apiKey.trim()) {
      alert('Please enter both a prompt and API key');
      return;
    }
    onGenerate(prompt, apiKey, sceneSize, apiUrl);
  };

  return (
    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-4 text-white max-w-md z-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2 text-lg font-bold"
      >
        🗺️ Floor Map Generator
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Scene Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the floor/room layout..."
              className="w-full p-2 bg-gray-800 rounded text-sm"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Replicate API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="r8_..."
              className="w-full p-2 bg-gray-800 rounded text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Scene Size (m)</label>
              <input
                type="number"
                value={sceneSize}
                onChange={(e) => setSceneSize(parseInt(e.target.value))}
                min="5"
                max="50"
                className="w-full p-2 bg-gray-800 rounded text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-sm"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full p-2 rounded font-medium ${
              isGenerating 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Floor Map'}
          </button>
          
          {progress && (
            <div className="text-yellow-400 text-sm">{progress}</div>
          )}
          
          {error && (
            <div className="text-red-400 text-sm bg-red-900 bg-opacity-50 p-2 rounded">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};