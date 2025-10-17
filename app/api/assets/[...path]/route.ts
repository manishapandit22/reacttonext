import { NextRequest } from "next/server";

import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const bucket = admin.storage().bucket();

async function handleDownloadAppRouter(request: NextRequest, filePath: any) {
  if (!filePath) {
    return Response.json({ error: 'File path is required' }, { status: 400 });
  }

  try {
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    
    const stream = file.createReadStream();
    
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        stream.on('end', () => {
          controller.close();
        });
        
        stream.on('error', (error) => {
          controller.error(error);
        });
      }
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Length': metadata.size,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return Response.json({ 
      error: 'Failed to download file',
      message: error.message 
    }, { status: 500 });
  }
}

async function handleGetURLAppRouter(request: NextRequest, filePath: any) {
  if (!filePath) {
    return Response.json({ error: 'File path is required' }, { status: 400 });
  }

  try {
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

       const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000,
    });
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log("the public url is ",publicUrl)
    return Response.json({ url: publicUrl }, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    console.error('Get URL error:', error);
    return Response.json({ 
      error: 'Failed to generate URL',
      message: error.message 
    }, { status: 500 });
  }
}

async function handleListAppRouter(request: NextRequest, folderPath = '') {
  try {
    const options = {
      prefix: folderPath ? `${folderPath}/` : '',
      delimiter: '/',
    };

    const [files, , apiResponse] = await bucket.getFiles(options);
    
    const fileList = await Promise.all(
      files.map(async (file) => {
        try {
          const [metadata] = await file.getMetadata();
          return {
            name: file.name,
            size: parseInt(metadata.size),
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            etag: metadata.etag,
          };
        } catch (error) {
          return {
            name: file.name,
            error: 'Could not fetch metadata',
          };
        }
      })
    );

    const folders = (apiResponse.prefixes || []).map(prefix => ({
      name: prefix.replace(/\/$/, ''), 
      type: 'folder',
    }));

    return Response.json({ files: fileList, folders });
  } catch (error:any) {
    console.error('List error:', error);
    return Response.json({ 
      error: 'Failed to list files',
      message: error.message 
    }, { status: 500 });
  }
}

async function handleMetadataAppRouter(request: any, filePath: any) {
  if (!filePath) {
    return Response.json({ error: 'File path is required' }, { status: 400 });
  }

  try {
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    
    return Response.json({
      name: metadata.name,
      size: parseInt(metadata.size),
      contentType: metadata.contentType,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      etag: metadata.etag,
      md5Hash: metadata.md5Hash,
      crc32c: metadata.crc32c,
    });
  } catch (error: any) {
    console.error('Metadata error:', error);
    return Response.json({ 
      error: 'Failed to get metadata',
      message: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean).slice(2); 
    const filePath = pathSegments.join('/');
    const action = url.searchParams.get('action') || 'download';

    switch (action) {
      case 'download':
        return await handleDownloadAppRouter(request, filePath);
      case 'url':
        return await handleGetURLAppRouter(request, filePath);
      case 'list':
        return await handleListAppRouter(request, filePath);
      case 'metadata':
        return await handleMetadataAppRouter(request, filePath);
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Firebase Storage API Error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}