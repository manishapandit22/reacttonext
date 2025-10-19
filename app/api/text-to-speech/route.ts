import { NextResponse, NextRequest } from "next/server";

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

interface TTSRequestBody {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TTSRequestBody = await request.json();
    const {
      text,
      voice_id = "EXAVITQu4vr4xnSDxMaL", // Default to Sarah
      model_id = "eleven_turbo_v2_5",
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      },
      output_format = "mp3_44100_128"
    } = body;

    // Validate API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text provided or invalid text format" },
        { status: 400 }
      );
    }

    if (!voice_id || typeof voice_id !== 'string') {
      return NextResponse.json(
        { error: "No voice_id provided or invalid voice_id format" },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 5000 characters allowed." },
        { status: 400 }
      );
    }

    // Process text with better cleaning
    const processedText = text
      .replace(/#{1,6}\s+/g, "") // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`([^`]+)`/g, '$1') // Remove code markdown
      .replace(/\{\{[^}]+\}\}/g, '') // Remove template variables
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (processedText.length === 0) {
      return NextResponse.json(
        { error: "No valid text content after processing" },
        { status: 400 }
      );
    }

    console.log(`TTS Request: voice_id=${voice_id}, text_length=${processedText.length}, model=${model_id}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Use non-streaming endpoint to receive a complete audio file
      const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: processedText,
          model_id,
          voice_settings,
          output_format
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!elevenResponse.ok) {
        let errorMessage = 'Failed to generate speech';
        let errorDetails = '';
        
        try {
          const errorData: any = await elevenResponse.json();
          const rawDetail = errorData.detail || errorData.message || errorData.error || errorData || '';
          errorDetails = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);
        } catch (e) {
          const txt = await elevenResponse.text();
          errorDetails = txt || `${elevenResponse.status} ${elevenResponse.statusText}`;
        }
        
        console.error('ElevenLabs API Error:', {
          status: elevenResponse.status,
          statusText: elevenResponse.statusText,
          details: errorDetails
        });
        
        // Map specific error codes to user-friendly messages
        switch (elevenResponse.status) {
          case 401:
            errorMessage = 'Invalid API key. Please check your ElevenLabs configuration.';
            break;
          case 402:
            errorMessage = 'Insufficient credits. Please add credits to your ElevenLabs account.';
            break;
          case 422:
            errorMessage = `Invalid voice or parameters. ${errorDetails}`;
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please try again in a moment.';
            break;
          case 500:
            errorMessage = 'ElevenLabs service temporarily unavailable. Please try again later.';
            break;
          case 503:
            errorMessage = 'ElevenLabs service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = `TTS service error: ${errorDetails || elevenResponse.statusText}`;
        }

        const payload = {
          error: String(errorMessage),
          details: errorDetails,
          status: elevenResponse.status,
          statusText: elevenResponse.statusText
        };

        return NextResponse.json(payload, { status: elevenResponse.status });
      }

      // Validate response
      const contentType = elevenResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('audio')) {
        console.error('Invalid response content type:', contentType);
        return NextResponse.json(
          { error: 'Invalid response format from TTS service' },
          { status: 502 }
        );
      }

      const arrayBuffer = await elevenResponse.arrayBuffer();
      
      // Validate audio data
      if (arrayBuffer.byteLength === 0) {
        return NextResponse.json(
          { error: 'Empty audio file received from TTS service' },
          { status: 502 }
        );
      }

      if (arrayBuffer.byteLength > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json(
          { error: 'Audio file too large' },
          { status: 413 }
        );
      }

      const processingTime = Date.now() - startTime;
      console.log(`TTS Success: ${arrayBuffer.byteLength} bytes in ${processingTime}ms`);

      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Processing-Time': processingTime.toString(),
        },
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('TTS request timeout');
        return NextResponse.json(
          { error: 'TTS request timeout. Please try again.' },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('TTS Generation Error:', {
      error: error.message,
      stack: error.stack,
      processingTime
    });
    
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}

