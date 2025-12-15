'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { logOut } from '@/lib/auth';
import { setupPresence } from '@/lib/presence';
import { MessageCircle, Image, Video, Users, LogOut, User, MessageSquare, GraduationCap, UserCircle, Home } from 'lucide-react';
import Chat from './Chat';
import DirectMessages from './DirectMessages';
import MediaGallery from './MediaGallery';
import Committee from './Committee';
import Batchmates from './Batchmates';
import Profile from './Profile';
import Feed from './Feed';
import Academia from './Academia';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'chat' | 'batchmates' | 'media' | 'committee' | 'profile' | 'academia'>('feed');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Setup online presence tracking
    let cleanupPresence: (() => void) | undefined;
    if (user) {
      cleanupPresence = setupPresence(user);
    }

    // Cleanup function to set user offline when component unmounts
    return () => {
      if (cleanupPresence) {
        cleanupPresence();
      }
    };
  }, [user]);

  const handleLogout = async () => {
    await logOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-pink rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-pink bg-clip-text text-transparent">
                MIET Student Hub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold">
                  {(userData?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {userData?.name || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Group Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('batchmates')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'batchmates'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Batchmates</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'media'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Image className="h-5 w-5" />
              <span>Photos & Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('committee')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'committee'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Committees</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCircle className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('academia')}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'academia'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span>Academia</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && <Feed user={user} userData={userData} />}
        {activeTab === 'messages' && <DirectMessages user={user} />}
        {activeTab === 'chat' && <Chat user={user} />}
        {activeTab === 'batchmates' && <Batchmates user={user} userData={userData} />}
        {activeTab === 'media' && <MediaGallery user={user} userData={userData} />}
        {activeTab === 'academia' && <Academia user={user} userData={userData} />}
        {activeTab === 'committee' && <Committee />}
        {activeTab === 'profile' && <Profile user={user} userData={userData} onUpdate={fetchUserData} />}
      </main>
    </div>
  );
}

