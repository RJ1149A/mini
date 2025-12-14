# How to Activate the Friend Request Feature

## Step 1: Update Firestore Security Rules

The friend request feature requires a new collection in Firebase. You need to update your Firestore Security Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mini-f098a**
3. Navigate to **Firestore Database** tab
4. Click on **Rules** tab at the top
5. Copy and paste the rules from `FIRESTORE_RULES_FRIEND_REQUESTS.md` file in this project
6. Click **Publish**

## Step 2: The friendRequests Collection

Firebase will automatically create the collection when you:
- Click the Send Friend Request button
- Or you can manually create it (optional)

## Step 3: Test the Feature

1. Open your app at `http://localhost:3000`
2. Go to the **Chat** page
3. You should see:
   - A sidebar titled "Active & Friends"
   - A list of all active/recently active students
   - For each student, a button on the right:
     - **"+👤" (UserPlus icon)** = Click to send friend request
     - **"⏱️" (Clock icon, gray)** = Already sent request, waiting for acceptance
     - **"⏱️" (Clock icon, blue)** = Received a request, action needed
     - **"💬" (MessageSquare icon, green)** = Already friends, can chat

4. Click the UserPlus button to send a friend request
5. The button should change to a gray Clock icon (sent)

## Step 4: Accept Friend Requests

Friend request acceptance flow will be shown when:
- A request is sent to you (pending status)
- You see it in another part of the app (notifications/requests section)

## Troubleshooting

### Button doesn't work or shows error:
1. Check browser console (F12 > Console tab)
2. Look for error messages about "friendRequests" collection
3. Make sure Firestore rules are published
4. The error alert will tell you if the collection doesn't exist

### Users not showing:
1. Make sure users have `userStatus` documents created
2. Check that users are marked as online or recently active (within 5 minutes)
3. If not, wait for them to log in and be online

### Friend request status not updating:
1. Refresh the page
2. Check browser console for errors
3. Verify Firestore rules allow write access to friendRequests collection

## What's Working

✅ **Chat Sidebar**
- Shows all active/recently active students
- Search functionality to find users
- Online/offline status indicator (green dot)

✅ **Friend Request Button**
- Send friend request to any student
- Visual status feedback
- Automatically updates after sending

✅ **Profile Circles in Messages**
- Small profile avatar with sender's initial
- Green online indicator dot
- Shows both sender and receiver avatars

## Next Features to Implement

- Friend request notifications
- Accept/Decline friend request buttons
- Friend list view
- Block/unblock users
