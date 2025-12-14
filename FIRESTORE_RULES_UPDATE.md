# Firestore Security Rules Update

Update your Firestore security rules to support the new features (Direct Messages, Online Status, Batchmates).

## Updated Firestore Rules

Go to Firebase Console > Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User Status (Online/Offline)
    match /userStatus/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Direct Messages
    match /directMessages/{messageId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.senderId || 
                   request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.senderId &&
                    request.auth.token.email.matches('.*@miet\\.ac\\.in$');
      allow update: if request.auth != null && 
                    (request.auth.uid == resource.data.senderId || 
                     request.auth.uid == resource.data.receiverId);
    }
    
    // Group Messages (existing)
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.auth.token.email.matches('.*@miet\\.ac\\.in$');
    }
    
    // Media collection
    match /media/{mediaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.auth.token.email.matches('.*@miet\\.ac\\.in$');
    }
    
    // Committee events collection
    match /committeeEvents/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.auth.token.email.matches('.*@miet\\.ac\\.in$');
    }
    
    // Feed Posts
    match /feedPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.postedBy &&
                    request.auth.token.email.matches('.*@miet\\.ac\\.in$');
      allow update: if request.auth != null && 
                    request.auth.uid == resource.data.postedBy;
      allow delete: if request.auth != null && 
                     request.auth.uid == resource.data.postedBy;
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.commentedBy &&
                      request.auth.token.email.matches('.*@miet\\.ac\\.in$');
        allow update: if request.auth != null && 
                      request.auth.uid == resource.data.commentedBy;
        allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.commentedBy;
      }
    }
  }
}
```

## What Changed

1. **userStatus collection**: Added rules for tracking online/offline status
2. **directMessages collection**: Added rules for private direct messages between users
3. **feedPosts collection**: Added rules for feed posts with reactions and comments
4. **comments subcollection**: Added rules for comments with streak functionality
5. **Security**: Users can only read messages they sent or received, and can only modify their own posts/comments

## Important Notes

- Make sure to click "Publish" after updating the rules
- Test the rules in the Rules Playground if needed
- These rules allow authenticated users with @miet.ac.in emails to use all features
