'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, Search, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderEmail: string;
  timestamp: any;
  read: boolean;
}

interface ChatUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  year?: string;
  branch?: string;
  section?: string;
  pronouns?: string;
}

interface DirectMessagesProps {
  user: any;
}

export default function DirectMessages({ user }: DirectMessagesProps) {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users for chat list
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList: ChatUser[] = [];
        
        for (const userDoc of usersSnapshot.docs) {
          if (userDoc.id === user.uid) continue; // Skip current user
          
          const userData = userDoc.data();
          
          // Get online status
          const statusDoc = await getDoc(doc(db, 'userStatus', userDoc.id));
          let isOnline = false;
          if (statusDoc.exists()) {
            const statusData = statusDoc.data();
            isOnline = statusData.isOnline || false;
            // Also check if lastSeen is recent (within 60 seconds)
            if (statusData.lastSeen) {
              const lastSeen = statusData.lastSeen.toMillis();
              const now = Date.now();
              const timeDiff = now - lastSeen;
              // Consider online if lastSeen is within 60 seconds
              if (timeDiff < 60000) {
                isOnline = true;
              }
            }
          }
          
          // Get last message in conversation
          const conversationId = [user.uid, userDoc.id].sort().join('_');
          const messagesQuery = query(
            collection(db, 'directMessages'),
            where('conversationId', '==', conversationId),
            orderBy('timestamp', 'desc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          let lastMessage = '';
          let lastMessageTime = null;
          
          if (!messagesSnapshot.empty) {
            const lastMsg = messagesSnapshot.docs[0].data();
            lastMessage = lastMsg.text || '';
            lastMessageTime = lastMsg.timestamp;
          }
          
          // Count unread messages
          const unreadQuery = query(
            collection(db, 'directMessages'),
            where('conversationId', '==', conversationId),
            where('receiverId', '==', user.uid),
            where('read', '==', false)
          );
          const unreadSnapshot = await getDocs(unreadQuery);
          
          usersList.push({
            uid: userDoc.id,
            name: userData.name || userData.email?.split('@')[0] || 'Unknown',
            email: userData.email,
            photoURL: userData.photoURL || '',
            isOnline,
            lastMessage,
            lastMessageTime,
            unreadCount: unreadSnapshot.size,
            year: userData.year || '',
            branch: userData.branch || '',
            section: userData.section || '',
            pronouns: userData.pronouns || '',
          });
        }
        
        // Sort by last message time or online status
        usersList.sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
          }
          return 0;
        });
        
        setChatUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Listen for online status changes for all users
  useEffect(() => {
    if (chatUsers.length === 0) return;

    const statusUnsubscribes = chatUsers.map(chatUser => {
      return onSnapshot(doc(db, 'userStatus', chatUser.uid), (snapshot) => {
        let isOnline = false;
        if (snapshot.exists()) {
          const statusData = snapshot.data();
          isOnline = statusData.isOnline || false;
          // Also check if lastSeen is recent (within 60 seconds)
          if (statusData.lastSeen) {
            const lastSeen = statusData.lastSeen.toMillis();
            const now = Date.now();
            const timeDiff = now - lastSeen;
            if (timeDiff < 60000) {
              isOnline = true;
            }
          }
        }
        setChatUsers(prev => prev.map(u => 
          u.uid === chatUser.uid 
            ? { ...u, isOnline }
            : u
        ));
      });
    });

    return () => {
      statusUnsubscribes.forEach(unsub => unsub());
    };
  }, [chatUsers.length]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedUser || !user) return;

    const conversationId = [user.uid, selectedUser.uid].sort().join('_');
    
    const q = query(
      collection(db, 'directMessages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      
      // Mark messages as read
      msgs.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.read) {
          updateDoc(doc(db, 'directMessages', msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    try {
      const conversationId = [user.uid, selectedUser.uid].sort().join('_');
      
      await addDoc(collection(db, 'directMessages'), {
        text: newMessage,
        senderId: user.uid,
        receiverId: selectedUser.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'You',
        senderEmail: user.email,
        conversationId,
        timestamp: serverTimestamp(),
        read: false,
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((chatUser) => (
              <button
                key={chatUser.uid}
                onClick={() => setSelectedUser(chatUser)}
                className={`w-full p-4 text-left hover:bg-white/70 transition-all border-b border-gray-100 ${
                  selectedUser?.uid === chatUser.uid ? 'bg-white shadow-md' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {chatUser.name.charAt(0).toUpperCase()}
                    </div>
                    {chatUser.isOnline && (
                      <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-green-500 bg-white rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{chatUser.name}</p>
                        {chatUser.pronouns && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                            {chatUser.pronouns}
                          </span>
                        )}
                      </div>
                      {chatUser.unreadCount && chatUser.unreadCount > 0 && (
                        <span className="bg-primary-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2">
                          {chatUser.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      {chatUser.year && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                          {chatUser.year}
                        </span>
                      )}
                      {chatUser.section && (
                        <span className="text-xs px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                          Sec {chatUser.section}
                        </span>
                      )}
                      {chatUser.branch && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full truncate max-w-[100px]">
                          {chatUser.branch.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    {chatUser.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">{chatUser.lastMessage}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  {selectedUser.isOnline && (
                    <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-green-500 bg-white rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{selectedUser.name}</p>
                    {selectedUser.pronouns && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {selectedUser.pronouns}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    {selectedUser.year && (
                      <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-semibold">
                        {selectedUser.year}
                      </span>
                    )}
                    {selectedUser.section && (
                      <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full font-semibold">
                        Sec {selectedUser.section}
                      </span>
                    )}
                    {selectedUser.branch && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {selectedUser.branch.split(' ')[0]}
                      </span>
                    )}
                    <span className={`text-xs ${selectedUser.isOnline ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                      {selectedUser.isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.uid;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-primary-500 to-accent-pink text-white'
                            : 'bg-white text-gray-900 shadow-sm'
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
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-full hover:from-primary-600 hover:to-accent-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">Choose someone from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
