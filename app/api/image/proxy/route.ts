import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const srcParam = searchParams.get('src');
    const src = srcParam ? decodeURIComponent(srcParam) : null;
    if (!src) {
      return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 });
    }

    const widthParam = searchParams.get('width');
    const heightParam = searchParams.get('height');
    const fitParam = searchParams.get('fit') || 'cover';
    const qualityParam = searchParams.get('quality');
    const formatParam = searchParams.get('format');
    const focusParam = searchParams.get('focus') || 'top';

    const width = widthParam ? Math.min(Math.max(parseInt(widthParam, 10) || 0, 1), 4000) : undefined;
    const height = heightParam ? Math.min(Math.max(parseInt(heightParam, 10) || 0, 1), 4000) : undefined;
    const quality = qualityParam ? Math.min(Math.max(parseInt(qualityParam, 10) || 0, 1), 100) : 85;

    const res = await fetch(src);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 });
    }
    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    let pipeline = sharp(inputBuffer).rotate();

    let position: string = 'centre';
    if (focusParam === 'top' || focusParam === 'north') position = 'north';
    else if (focusParam === 'left' || focusParam === 'west') position = 'west';
    else if (focusParam === 'right' || focusParam === 'east') position = 'east';
    else if (focusParam === 'bottom' || focusParam === 'south') position = 'south';

    if (width || height) {
      pipeline = pipeline.resize({ width, height, fit: fitParam as keyof sharp.FitEnum, position });
    }

    const preferredFormat = (formatParam || 'webp').toLowerCase();
    const acceptsWebp = req.headers.get('accept')?.includes('image/webp');

    let outputBuffer: Buffer;
    let contentType: string;

    if (preferredFormat === 'jpeg' || preferredFormat === 'jpg') {
      outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      contentType = 'image/jpeg';
    } else if (preferredFormat === 'png') {
      outputBuffer = await pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
      contentType = 'image/png';
    } else if (preferredFormat === 'avif') {
      outputBuffer = await pipeline.avif({ quality }).toBuffer();
      contentType = 'image/avif';
    } else {
      const useWebp = acceptsWebp || preferredFormat === 'webp';
      if (useWebp) {
        outputBuffer = await pipeline.webp({ quality }).toBuffer();
        contentType = 'image/webp';
      } else {
        outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
        contentType = 'image/jpeg';
      }
    }

    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    const body = new Uint8Array(outputBuffer);
    return new Response(body, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}


