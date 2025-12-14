# Firebase Setup Guide - Fix "auth/configuration-not-found" Error

The error `auth/configuration-not-found` means Firebase Authentication is not enabled in your Firebase project.

## Quick Fix Steps:

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mini-f098a**
3. Click on **"Authentication"** in the left sidebar
4. Click **"Get started"** (if you see this button)
5. Go to the **"Sign-in method"** tab
6. Click on **"Email/Password"**
7. **Enable** the first toggle (Email/Password)
8. Click **"Save"**

### 2. Enable Firestore Database

1. In Firebase Console, click on **"Firestore Database"**
2. Click **"Create database"** (if not created)
3. Choose **"Start in production mode"**
4. Select a location (choose closest to you)
5. Click **"Enable"**

### 3. Enable Storage

1. In Firebase Console, click on **"Storage"**
2. Click **"Get started"** (if not set up)
3. Start with **"Start in production mode"**
4. Use the same location as Firestore
5. Click **"Done"**

### 4. Verify Your Configuration

After enabling all services, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Your Current Firebase Config:

- **Project ID:** mini-f098a
- **Auth Domain:** mini-f098a.firebaseapp.com
- **API Key:** Already configured in .env.local

## Common Issues:

- **"auth/configuration-not-found"**: Authentication not enabled → Follow Step 1 above
- **"permission-denied"**: Firestore rules too strict → Check Firestore Rules
- **"storage/unauthorized"**: Storage not enabled → Follow Step 3 above

## Need Help?

If you still see errors after enabling all services:
1. Check the browser console for detailed error messages
2. Verify all three services (Auth, Firestore, Storage) show as "Enabled" in Firebase Console
3. Make sure you're using the correct Firebase project
