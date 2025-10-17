import { useCallback, useState } from "react";

export const useFloorMappingAPI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const generateFloorMap = useCallback(async (prompt, apiKey, sceneSize = 10, apiBaseUrl = 'http://localhost:8000') => {
    setIsGenerating(true);
    setError(null);
    setProgress('Submitting generation request...');

    try {
      const submitResponse = await fetch(`${apiBaseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          replicate_api_key: apiKey,
          scene_size_m: sceneSize,
          coverage_threshold: 0.4
        })
      });

      if (!submitResponse.ok) {
        throw new Error(`HTTP error! status: ${submitResponse.status}`);
      }

      const { job_id } = await submitResponse.json();
      setProgress('Job submitted, processing...');

      return await pollJobStatus(job_id, apiBaseUrl);
      
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      throw err;
    }
  }, []);

  const pollJobStatus = async (jobId, apiBaseUrl) => {
    const maxAttempts = 60; 
    const pollInterval = 5000; 

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        setProgress(`Processing... (${attempt + 1}/${maxAttempts})`);
        
        const statusResponse = await fetch(`${apiBaseUrl}/jobs/${jobId}`);
        if (!statusResponse.ok) {
          throw new Error(`Failed to check job status: ${statusResponse.status}`);
        }

        const jobStatus = await statusResponse.json();
        
        if (jobStatus.status === 'completed') {
          setIsGenerating(false);
          setProgress('');
          return jobStatus.result;
        } else if (jobStatus.status === 'failed') {
          throw new Error(jobStatus.error_message || 'Job failed');
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
      } catch (err) {
        setError(err.message);
        setIsGenerating(false);
        throw err;
      }
    }

    throw new Error('Job timed out');
  };

  return { generateFloorMap, isGenerating, error, progress };
};
