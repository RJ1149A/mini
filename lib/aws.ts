import { S3Client } from '@aws-sdk/client-s3';

const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
  console.error('❌ AWS Configuration Error:');
  console.error('Missing environment variables:');
  if (!AWS_ACCESS_KEY_ID) console.error('  - NEXT_PUBLIC_AWS_ACCESS_KEY_ID');
  if (!AWS_SECRET_ACCESS_KEY) console.error('  - NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY');
  if (!AWS_S3_BUCKET) console.error('  - NEXT_PUBLIC_AWS_S3_BUCKET');
  console.error('Set these in your .env.local file');
}

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

export { AWS_S3_BUCKET, AWS_REGION };
