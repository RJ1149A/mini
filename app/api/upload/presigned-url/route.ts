import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { filePath, contentType } = await request.json();

    if (!filePath || !contentType) {
      return NextResponse.json(
        { error: 'Missing filePath or contentType' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
    if (!bucket) {
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      );
    }

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      ContentType: contentType,
    });

    // Generate presigned URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return NextResponse.json({ presignedUrl, bucket, filePath });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
