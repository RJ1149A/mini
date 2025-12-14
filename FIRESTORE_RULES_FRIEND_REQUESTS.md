# Firestore Security Rules Update - Friend Requests

Add support for friend requests feature to your Firestore security rules.

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
    
    // Friend Requests (NEW)
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.fromId || 
                   request.auth.uid == resource.data.toId);
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.fromId;
      allow update: if request.auth != null && 
                    (request.auth.uid == resource.data.fromId || 
                     request.auth.uid == resource.data.toId);
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

Added **friendRequests collection** rules:
- Users can read friend requests they sent or received
- Users can create requests (send to other users)
- Both parties can update requests (to accept/decline)

## Steps to Apply

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mini-f098a**
3. Go to **Firestore Database** > **Rules** tab
4. Replace all content with the rules above
5. Click **Publish**
6. Test in the Rules Playground if needed

## After Updating Rules

The friend request feature will now work:
- ✅ Students can send friend requests
- ✅ Status shows: none, sent, pending, accepted
- ✅ Profile circles with online status in messages
