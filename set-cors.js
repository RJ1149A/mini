// Temporary script to set CORS on Firebase Storage bucket
// Run: node set-cors.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with credentials
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-admin-key.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`);
  console.log('Download it from Firebase Console > Project Settings > Service Accounts > Generate Private Key');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mini-f098a.firebasestorage.app'
});

const bucket = admin.storage().bucket();

const corsConfig = [
  {
    origin: ['https://mini1-ten.vercel.app'],
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable', 'x-goog-upload-id', 'x-goog-upload-protocol'],
    maxAgeSeconds: 3600
  }
];

bucket.setCorsConfiguration(corsConfig)
  .then(() => {
    console.log('✓ CORS configuration updated successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Error setting CORS:', err);
    process.exit(1);
  });
