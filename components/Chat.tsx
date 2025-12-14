'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, MessageCircle, Users, Search, Plus, MessageSquare, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderEmail: string;
  senderName: string;
  timestamp: any;
}

interface ActiveUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen?: any;
}

interface ChatProps {
  user: any;
}

export default function Chat({ user }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [showActiveUsers, setShowActiveUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse() as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch active users (online or recently active)
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList: ActiveUser[] = [];

        for (const userDoc of usersSnapshot.docs) {
          if (userDoc.id === user?.uid) continue; // Skip current user

          const userData = userDoc.data();

          // Get online status
          const statusDoc = await getDoc(doc(db, 'userStatus', userDoc.id));
          let isOnline = false;
          let lastSeen = null;

          if (statusDoc.exists()) {
            const statusData = statusDoc.data();
            isOnline = statusData.isOnline || false;
            lastSeen = statusData.lastSeen;

            // Check if lastSeen is recent (within 5 minutes)
            if (statusData.lastSeen) {
              const lastSeenTime = statusData.lastSeen.toMillis();
              const now = Date.now();
              const timeDiff = now - lastSeenTime;
              if (timeDiff < 300000) { // 5 minutes
                isOnline = true;
              }
            }
          }

          usersList.push({
            uid: userDoc.id,
            name: userData.name || userData.email?.split('@')[0] || 'Unknown',
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            isOnline,
            lastSeen,
          });
        }

        // Sort by online status, then by name
        usersList.sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return a.name.localeCompare(b.name);
        });

        setActiveUsers(usersList);
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    };

    if (user) {
      fetchActiveUsers();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderEmail: user.email,
        senderName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Main Chat Section */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-xl h-[calc(100vh-250px)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-pink-50">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-pink rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Group Chat</h2>
            <span className="ml-auto text-sm text-gray-500">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderEmail === user?.email;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-primary-500 to-accent-pink text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      {message.timestamp && (
                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                          {format(message.timestamp.toDate(), 'HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-full hover:from-primary-600 hover:to-accent-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Active Users Sidebar */}
      <div className="w-80 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[calc(100vh-250px)]">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-primary-400 to-accent-purple rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Active & Friends</h3>
            </div>
            <button
              onClick={() => setShowActiveUsers(!showActiveUsers)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showActiveUsers ? '−' : '+'}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {activeUsers.filter(u => u.isOnline).length} online • {activeUsers.length} total
          </p>
        </div>

        {showActiveUsers && (
          <div className="flex-1 overflow-y-auto">
            {activeUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No users available</p>
              </div>
            ) : (
              activeUsers
                .filter(u =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((activeUser) => (
                  <div
                    key={activeUser.uid}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {activeUser.name.charAt(0).toUpperCase()}
                        </div>
                        {activeUser.isOnline && (
                          <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-green-500 bg-white rounded-full border border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {activeUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activeUser.email}</p>
                        <p className={`text-xs mt-1 font-medium ${
                          activeUser.isOnline ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {activeUser.isOnline ? '● Online' : '○ Offline'}
                        </p>
                      </div>
                      <button
                        className="flex-shrink-0 p-2 hover:bg-primary-100 rounded-lg transition-colors text-primary-500 hover:text-primary-600"
                        title="Start direct message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

