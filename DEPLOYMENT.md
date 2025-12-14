# 🚀 Deployment Guide - Deploy Your Student App

Deploy your MIET Student Portal so all your friends can use it!

## Option 1: Deploy to Vercel (Recommended - Easiest) ⚡

Vercel is the best platform for Next.js apps. It's free and takes just a few minutes!

### Step 1: Prepare Your Code

1. **Make sure your code is ready:**
   ```bash
   cd student-app
   npm run build
   ```
   If this works without errors, you're ready to deploy!

### Step 2: Push to GitHub

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository:**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it: `miet-student-portal` (or any name you like)
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/miet-student-portal.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (it's free!)

2. **Import your project:**
   - Click "Add New Project"
   - Select your GitHub repository (`miet-student-portal`)
   - Click "Import"

3. **Configure Environment Variables:**
   - In the "Environment Variables" section, add these:
   
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDjnwB-PQNbwZTk0XmjPzVvwCe0QcZFnGI
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mini-f098a.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=mini-f098a
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mini-f098a.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=292457998444
   NEXT_PUBLIC_FIREBASE_APP_ID=1:292457998444:web:482749988156f58aa85049
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live! 🎉

5. **Get your URL:**
   - After deployment, you'll get a URL like: `https://miet-student-portal.vercel.app`
   - Share this with your friends!

### Step 4: Update Firebase Allowed Domains

1. **Go to Firebase Console:**
   - [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `mini-f098a`

2. **Add your Vercel domain:**
   - Go to Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Add your Vercel domain (e.g., `miet-student-portal.vercel.app`)
   - Click "Add"

3. **Update Firestore Rules (if needed):**
   - The rules should already work, but verify in Firestore Database → Rules

## Option 2: Deploy to Netlify 🌐

### Step 1: Build Command
```bash
npm run build
```

### Step 2: Publish Directory
```
.next
```

### Step 3: Environment Variables
Add the same Firebase environment variables as above.

## Option 3: Deploy to Railway 🚂

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project from GitHub repo
4. Add environment variables
5. Deploy!

## 🔧 Important Notes

### Environment Variables
Make sure to add ALL these in your deployment platform:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Configuration
- ✅ Authentication must be enabled
- ✅ Firestore Database must be created
- ✅ Storage must be enabled
- ✅ Authorized domains must include your deployment URL

### Custom Domain (Optional)
You can add a custom domain later:
- Vercel: Project Settings → Domains
- Add your domain (e.g., `student.miet.ac.in`)

## 🐛 Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Run `npm install` locally first
- Check the build logs in Vercel

**App works but Firebase errors?**
- Verify environment variables are set correctly
- Check Firebase Console → Authentication → Authorized domains
- Make sure Firestore rules are published

**Can't upload files?**
- Check Firebase Storage is enabled
- Verify Storage rules allow uploads
- Check file size limits (50MB)

## 📱 Sharing with Friends

Once deployed, share your URL:
- Example: `https://miet-student-portal.vercel.app`
- They can sign up with their `@miet.ac.in` email
- All features will work the same as localhost!

## 🎉 You're Done!

Your app is now live and accessible to everyone! 🚀
