# MIET Student Portal

A comprehensive web application for MIET students to connect, chat, share media, and stay updated with college committee activities.

## Features

- 🔐 **Secure Authentication**: Only students with `@miet.ac.in` email addresses can sign up and login
- 💬 **Real-time Chat**: Students can chat with each other in real-time
- 📸 **Photo & Video Sharing**: Upload and share photos and videos with the community
- 🏛️ **Committee Section**: Stay updated with college committee events and activities

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Real-time**: Firebase Firestore real-time listeners

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd student-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project (or use existing)
   
   c. Enable the following services:
      - **Authentication**: 
        - Go to Authentication > Sign-in method
        - Enable "Email/Password"
      - **Firestore Database**:
        - Go to Firestore Database
        - Create database in production mode
        - Set up security rules (see below)
      - **Storage**:
        - Go to Storage
        - Get started with default rules
        - Set up security rules (see below)

4. **Configure Environment Variables:**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

   You can find these values in Firebase Console > Project Settings > General > Your apps

5. **Set up Firestore Security Rules:**

   Go to Firestore Database > Rules and paste:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Messages collection
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
     }
   }
   ```

6. **Set up Storage Security Rules:**

   Go to Storage > Rules and paste:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /media/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
                      request.auth.token.email.matches('.*@miet\\.ac\\.in$') &&
                      request.resource.size < 50 * 1024 * 1024; // 50MB limit
       }
     }
   }
   ```

7. **Run the development server:**
   ```bash
   npm run dev
   ```

8. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
student-app/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── AuthProvider.tsx  # Authentication context
│   ├── Chat.tsx          # Chat component
│   ├── Committee.tsx     # Committee events component
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Loading.tsx       # Loading component
│   └── Login.tsx         # Login/Signup component
├── lib/
│   ├── auth.ts           # Authentication functions
│   └── firebase.ts       # Firebase configuration
└── package.json
```

## Usage

1. **Sign Up**: Use your `@miet.ac.in` email to create an account
2. **Chat**: Navigate to the Chat tab to send messages
3. **Media**: Upload photos and videos in the Photos & Videos tab
4. **Committees**: View and add committee events in the Committees tab

## Security Features

- Email domain validation (only `@miet.ac.in` allowed)
- Firebase Authentication for secure login
- Firestore security rules for data protection
- Storage rules for file upload security

## Development

- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Notes

- Make sure to keep your `.env.local` file secure and never commit it to version control
- The app uses Firebase's free tier which is sufficient for development and small-scale usage
- For production deployment, consider using Vercel, Netlify, or similar platforms

## License

This project is created for educational purposes.

