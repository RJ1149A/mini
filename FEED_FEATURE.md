# 📸 Feed Feature - Complete Guide

## ✨ What's New

A complete social media feed where students can share photos and videos, react to posts, and build comment streaks!

## 🎯 Features

### 1. **Photo & Video Upload**
- Upload photos (PNG, JPG) and videos (MP4)
- File size limit: 50MB
- Add captions to your posts
- Real-time feed updates

### 2. **Custom Reactions** 💖🔥👀
Three unique reactions available:
- **I Love U** 💖 - Show your love
- **Katai Zeher** 🔥 - Fire reaction
- **Kya Dekh Liya** 👀 - Surprised reaction

Each reaction shows:
- Count of users who reacted
- Visual indicator if you've reacted
- Color-coded buttons

### 3. **Comment System with Streaks** 🔥
- Comment on any post
- **Streak System**: Each time you comment on the same post, your streak increases!
- Streak counter displayed with fire emoji
- Real-time comment updates
- Expandable comment section

### 4. **Feed Layout**
- Instagram-like feed design
- User avatars with initials
- Timestamps for posts and comments
- Responsive design
- Beautiful card-based layout

## 🚀 How to Use

### Uploading a Post
1. Click **"Upload Photo or Video"** button
2. Select a file from your device
3. Add an optional caption
4. Click **"Post to Feed"**
5. Your post appears in the feed!

### Reacting to Posts
1. Click any reaction button below a post
2. Click again to remove your reaction
3. See the reaction count update in real-time

### Commenting with Streaks
1. Click on a post to expand comments
2. Type your comment in the input box
3. Press Enter or click Send
4. Your comment appears with a streak counter
5. Comment again on the same post to increase your streak! 🔥

## 📋 Firestore Structure

### Feed Posts Collection
```
feedPosts/{postId}
  - url: string (Storage URL)
  - type: 'photo' | 'video'
  - caption: string
  - postedBy: string (user UID)
  - postedByName: string
  - postedByEmail: string
  - timestamp: Timestamp
  - reactions: {
      iloveu: string[] (array of user UIDs)
      kataiZeher: string[] (array of user UIDs)
      kyaDekhLiya: string[] (array of user UIDs)
    }
```

### Comments Subcollection
```
feedPosts/{postId}/comments/{commentId}
  - text: string
  - commentedBy: string (user UID)
  - commentedByName: string
  - commentedByEmail: string
  - timestamp: Timestamp
  - streakCount: number (increments with each comment)
```

## 🔒 Security Rules

Make sure to update your Firestore rules! See `FIRESTORE_RULES_UPDATE.md` for the complete rules.

Key points:
- Anyone authenticated can read posts
- Only post creators can update/delete their posts
- Anyone can comment, but only comment creators can edit/delete their comments
- All users must have @miet.ac.in email

## 🎨 Design Features

- **Gradient buttons** for reactions
- **Streak badges** with fire emoji
- **Smooth animations** and transitions
- **Responsive layout** for all devices
- **Modern card design** with shadows
- **Color-coded reactions** (pink, red, yellow)

## 💡 Tips

1. **Build Your Streak**: Keep commenting on the same post to build an impressive streak!
2. **Use Reactions**: Quick way to show appreciation without commenting
3. **Add Captions**: Make your posts more engaging with captions
4. **Share Moments**: Upload photos and videos from college events, study sessions, or fun moments!

## 🐛 Troubleshooting

**Can't upload?**
- Check file size (must be < 50MB)
- Ensure Firebase Storage is enabled
- Check browser console for errors

**Reactions not working?**
- Make sure Firestore rules are updated
- Check that you're logged in
- Refresh the page

**Comments not showing?**
- Expand the comment section by clicking the comment count
- Check Firestore rules for comments subcollection

Enjoy sharing and connecting with your batchmates! 🎓✨
