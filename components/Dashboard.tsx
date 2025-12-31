'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { logOut } from '@/lib/auth';
import { setupPresence } from '@/lib/presence';
import { MessageCircle, Image, Video, Users, LogOut, User, MessageSquare, GraduationCap, UserCircle, Home, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-500 to-accent-pink rounded-xl">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-pink bg-clip-text text-transparent truncate">
                MIET Student Hub
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-sm">
                  {(userData?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 truncate">
                  {userData?.name || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
          <div className="px-3 py-4 space-y-2">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(userData?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {userData?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-14 sm:top-16 z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 min-w-max sm:min-w-0">
            <button
              onClick={() => {
                setActiveTab('feed');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Messages</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Group Chat</span>
              <span className="sm:hidden">Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('batchmates');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'batchmates'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Batchmates</span>
              <span className="sm:hidden">Batch</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('media');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'media'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Image className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Photos & Videos</span>
              <span className="sm:hidden">Media</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('committee');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'committee'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Committees</span>
              <span className="sm:hidden">Comm</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('academia');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'academia'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Academia</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {activeTab === 'feed' && <Feed user={user} userData={userData} />}
        {activeTab === 'messages' && <DirectMessages user={user} />}
        {activeTab === 'chat' && <Chat user={user} />}
        {activeTab === 'batchmates' && <Batchmates user={user} userData={userData} />}
        {activeTab === 'media' && <MediaGallery user={user} userData={userData} />}
        {activeTab === 'academia' && <Academia user={user} userData={userData} />}
        {activeTab === 'committee' && <Committee />}
        {activeTab === 'profile' && <Profile user={user} userData={userData} onUpdate={fetchUserData} />}
      </main>

      {/* Mobile Logout */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

