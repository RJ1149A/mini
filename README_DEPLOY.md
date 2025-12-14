# 🚀 Deploy Your App - Simple Steps

Your app is ready to deploy! Follow these steps:

## Quick Deploy (5 minutes)

### 1. Push to GitHub

```bash
cd student-app

# Initialize git (if not done)
git init
git add .
git commit -m "Ready to deploy"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign up (free)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Add Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDjnwB-PQNbwZTk0XmjPzVvwCe0QcZFnGI
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mini-f098a.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=mini-f098a
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mini-f098a.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=292457998444
   NEXT_PUBLIC_FIREBASE_APP_ID=1:292457998444:web:482749988156f58aa85049
   ```
5. Click **"Deploy"**
6. Wait 2-3 minutes ⏳
7. **Done!** You'll get a URL like: `https://your-app.vercel.app`

### 3. Update Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mini-f098a**
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel URL (e.g., `your-app.vercel.app`)
6. Click **"Add"**

## 🎉 Share with Friends!

Your app is now live! Share the Vercel URL.

**Features that work:**
- ✅ Sign up/Login with @miet.ac.in email
- ✅ Feed with photo/video uploads
- ✅ Direct Messages
- ✅ Group Chat
- ✅ Batchmates
- ✅ Profile
- ✅ Reactions & Comments with Streaks

## 📝 Need Help?

See `DEPLOYMENT.md` for detailed instructions or troubleshooting.
