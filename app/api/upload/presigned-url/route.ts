import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getS3Client() {
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Presigned URL Request ===');
    const body = await request.json();
    const { filePath, contentType } = body;
    console.log('Received:', { filePath, contentType });

    if (!filePath || !contentType) {
      console.log('Missing filePath or contentType');
      return NextResponse.json(
        { error: 'Missing filePath or contentType' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
    console.log('Bucket from env:', bucket);
    if (!bucket) {
      console.log('S3 bucket not configured');
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      );
    }

    // Create S3 client
    console.log('Creating S3 client...');
    const s3Client = getS3Client();
    console.log('S3 client created successfully');

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      ContentType: contentType,
    });
    console.log('PutObject command created');

    // Generate presigned URL (valid for 15 minutes)
    console.log('Generating presigned URL...');
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    console.log('✓ Presigned URL generated:', presignedUrl.substring(0, 50) + '...');

    const response = { presignedUrl, bucket, filePath };
    console.log('✓ Returning success response');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error generating presigned URL:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { errorMessage, stack });
    
    return NextResponse.json(
      { error: errorMessage || 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
