# Firebase Storage Security Rules Update

Your file uploads are buffering because Firebase Storage rules need to be updated.

## The Problem

- Uploads get stuck buffering
- Progress shows but doesn't complete
- Permission denied errors (check browser console)

## The Solution

Update your Firebase Storage Security Rules:

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mini-f098a**
3. Click **Storage** in left sidebar
4. Click **Rules** tab
5. Replace ALL existing rules with the code below:
6. Click **Publish**

---

## Complete Firebase Storage Rules

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read all files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }

    // Feed folder - users can upload their own photos/videos
    match /feed/{userId}/{fileName} {
      allow write: if 
        request.auth != null && 
        request.auth.uid == userId &&
        request.auth.token.email.matches('.*@miet\\.ac\\.in$') &&
        request.resource.size < 52428800; // 50MB limit
    }

    // Media folder - users can upload their own photos/videos
    match /media/{userId}/{fileName} {
      allow write: if 
        request.auth != null && 
        request.auth.uid == userId &&
        request.auth.token.email.matches('.*@miet\\.ac\\.in$') &&
        request.resource.size < 52428800; // 50MB limit
    }

    // Academia folder - branch and semester structure, users upload inside their userId folder
    match /academia/{branch}/sem-{sem}/{userId}/{fileName} {
      allow write: if
        request.auth != null &&
        request.auth.uid == userId &&
        request.auth.token.email.matches('.*@miet\\.ac\\.in$') &&
        request.resource.size < 52428800; // 50MB limit
    }

    // Public uploads folder
    match /uploads/{fileName} {
      allow write: if 
        request.auth != null &&
        request.auth.token.email.matches('.*@miet\\.ac\\.in$') &&
        request.resource.size < 52428800; // 50MB limit
    }
  }
}
```

---

## What These Rules Do

✅ **Allow reads** - Authenticated users can download/view uploaded files
✅ **Allow uploads to feed** - Users can upload photos/videos to Feed
✅ **Allow uploads to media** - Users can upload to Media Gallery  
✅ **Size limit** - Maximum 50MB per file (prevents huge uploads)
✅ **MIET email only** - Only @miet.ac.in emails can upload

---

## Troubleshooting

### Still buffering after updating rules?

**Check browser console (F12 → Console):**

1. **Permission denied error:**
   - Make sure rules are published (green checkmark)
   - Sign out and sign back in
   - Clear browser cache

2. **File is too large:**
   - Check file size is under 50MB
   - Compress images before uploading

3. **Network issue:**
   - Check internet connection
   - Try uploading a small file first (1MB)

4. **Firebase Storage not enabled:**
   - Go to Firebase Console → Storage
   - Click "Get Started"
   - Follow the setup steps

---

## Testing After Update

1. Open app at localhost:3000
2. Go to **Feed** tab
3. Click **"Upload Photo or Video"**
4. Select a file (small one, < 5MB)
5. Click **"Post to Feed"**
6. Should see progress bar moving
7. Upload completes (not stuck)

---

## File Size Tips

- **Small test:** 1-5MB (fast)
- **Normal photo:** 2-5MB 
- **Video clips:** 10-20MB
- **Max allowed:** 50MB

If upload is slow:
1. Compress image using online tools
2. Use video compression for long videos
3. Check your internet speed

---

## After Rules Are Published

✅ All uploads will work
✅ Photos appear in Feed
✅ Videos stream without buffering
✅ Media Gallery loads images
✅ Progress bar shows real upload speed

**Go to Firebase Console and publish these rules - that's the only thing blocking uploads!**
