# Updated Firestore Security Rules - With Friends Collection

Go to **Firebase Console > Firestore Database > Rules** and replace with:

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
    
    // Friend Requests
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
    
    // Friends collection (NEW - for accepted friends)
    match /friends/{friendId} {
      allow read: if request.auth != null &&
                  (request.auth.uid == resource.data.userId1 ||
                   request.auth.uid == resource.data.userId2);
      allow create: if request.auth != null &&
                    (request.auth.uid == request.resource.data.userId1 ||
                     request.auth.uid == request.resource.data.userId2);
      allow update: if request.auth != null &&
                    (request.auth.uid == resource.data.userId1 ||
                     request.auth.uid == resource.data.userId2);
    }
    
    // Direct Messages
    match /directMessages/{messageId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.senderId || 
                   request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null && 
                    (request.auth.uid == resource.data.senderId || 
                     request.auth.uid == resource.data.receiverId);
    }
    
    // Group Messages
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Media collection
    match /media/{mediaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Committee events collection
    match /committeeEvents/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Feed Posts
    match /feedPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.postedBy;
      allow update: if request.auth != null && 
                    request.auth.uid == resource.data.postedBy;
      allow delete: if request.auth != null && 
                     request.auth.uid == resource.data.postedBy;
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.commentedBy;
        allow update: if request.auth != null && 
                      request.auth.uid == resource.data.commentedBy;
        allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.commentedBy;
      }
    }
  }
}
```

## Key Changes:
1. **Added `friends` collection rules** - allows users to read/write their own friendship documents
2. **Removed email domain restrictions** - simplified for all authenticated users
3. **Direct Messages** - simplified to allow any authenticated user to message

## Steps to Apply:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database > Rules**
4. Replace all existing rules with the code above
5. Click **Publish**
6. Refresh your app in the browser

After updating, the permissions error should be gone!
