'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, MessageCircle, Users, Search, Plus, MessageSquare, Circle, UserPlus, Check, Clock, X, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ChatSkeleton } from './Skeleton';

interface Message {
  id: string;
  text: string;
  senderEmail: string;
  senderName: string;
  timestamp: any;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyTo?: {
    senderName: string;
    text: string;
  } | null;
}

interface ActiveUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen?: any;
  friendRequestStatus?: 'none' | 'pending' | 'accepted' | 'sent';
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
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);
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
        if (!user?.uid) return;

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList: ActiveUser[] = [];

        for (const userDoc of usersSnapshot.docs) {
          if (userDoc.id === user.uid) continue; // Skip current user

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

          // Check friend request status
          let friendRequestStatus: 'none' | 'pending' | 'accepted' | 'sent' = 'none';
          
          try {
            // Check if sent request
            const sentReqDoc = await getDoc(doc(db, 'friendRequests', `${user.uid}_${userDoc.id}`));
            if (sentReqDoc.exists()) {
              const reqData = sentReqDoc.data();
              if (reqData.status === 'accepted') {
                friendRequestStatus = 'accepted';
              } else {
                friendRequestStatus = 'sent';
              }
            } else {
              // Check if received request
              const receivedReqDoc = await getDoc(doc(db, 'friendRequests', `${userDoc.id}_${user.uid}`));
              if (receivedReqDoc.exists()) {
                const reqData = receivedReqDoc.data();
                if (reqData.status === 'pending') {
                  friendRequestStatus = 'pending';
                } else if (reqData.status === 'accepted') {
                  friendRequestStatus = 'accepted';
                }
              }
            }
          } catch (error) {
            console.log('Error checking friend request status:', error);
            friendRequestStatus = 'none';
          }

          usersList.push({
            uid: userDoc.id,
            name: userData.name || userData.email?.split('@')[0] || 'Unknown',
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            isOnline,
            lastSeen,
            friendRequestStatus,
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

    if (user?.uid) {
      fetchActiveUsers();
    }
  }, [user?.uid]);

  // Real-time listener for friend request changes (sent or received)
  useEffect(() => {
    if (!user?.uid) return;

    try {
      const receivedQuery = query(
        collection(db, 'friendRequests'),
        where('toId', '==', user.uid)
      );
      const sentQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', user.uid)
      );

      const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
        setActiveUsers((prev) => {
          if (!prev || prev.length === 0) return prev;
          const updated = prev.map((u) => ({ ...u }));

          snapshot.docs.forEach((docSnap) => {
            const data: any = docSnap.data();
            const otherId = data.fromId;
            const idx = updated.findIndex((x) => x.uid === otherId);
            if (idx > -1) {
              updated[idx].friendRequestStatus = data.status === 'pending' ? 'pending' : data.status === 'accepted' ? 'accepted' : updated[idx].friendRequestStatus || 'none';
            }
          });

          return updated;
        });
      });

      const unsubSent = onSnapshot(sentQuery, (snapshot) => {
        setActiveUsers((prev) => {
          if (!prev || prev.length === 0) return prev;
          const updated = prev.map((u) => ({ ...u }));

          snapshot.docs.forEach((docSnap) => {
            const data: any = docSnap.data();
            const otherId = data.toId;
            const idx = updated.findIndex((x) => x.uid === otherId);
            if (idx > -1) {
              updated[idx].friendRequestStatus = data.status === 'pending' ? 'sent' : data.status === 'accepted' ? 'accepted' : updated[idx].friendRequestStatus || 'none';
            }
          });

          return updated;
        });
      });

      return () => {
        unsubReceived();
        unsubSent();
      };
    } catch (error) {
      console.error('Error setting up friendRequests listeners:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming pending friend requests for the current user
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, 'friendRequests'),
        where('toId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const list: any[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPendingRequests(list);
      });
      return () => unsub();
    } catch (error) {
      console.error('Error listening pending friend requests:', error);
    }
  }, [user?.uid]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderEmail: user.email,
        senderName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        timestamp: serverTimestamp(),
        reactions: {},
        replyTo: replyTo
          ? {
              senderName: replyTo.senderName,
              text: replyTo.text,
            }
          : null,
      });
      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user?.uid) return;
    try {
      const messageRef = doc(db, 'messages', messageId);
      const snap = await getDoc(messageRef);
      if (!snap.exists()) return;

      const data = snap.data() as Message;
      const reactions = data.reactions || {};
      const current = reactions[emoji] ? [...reactions[emoji]] : [];
      const userId = user.uid;

      const index = current.indexOf(userId);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(userId);
      }

      const updatedReactions = {
        ...reactions,
        [emoji]: current,
      };

      await updateDoc(messageRef, { reactions: updatedReactions });
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const acceptFriendRequest = async (fromUserId: string) => {
    if (!user?.uid) return;
    try {
      const requestId = `${fromUserId}_${user.uid}`;
      const reqRef = doc(db, 'friendRequests', requestId);
      const fromUser = activeUsers.find(u => u.uid === fromUserId);
      
      await updateDoc(reqRef, { status: 'accepted', acceptedAt: serverTimestamp() });

      // Create bidirectional friendship documents
      if (fromUser) {
        const user1Name = fromUser.name;
        const user2Name = user.displayName || user.email?.split('@')[0] || 'Unknown';
        // Both directions for easy querying
        await setDoc(doc(db, 'friends', `${fromUserId}_${user.uid}`), {
          userId1: fromUserId,
          userId2: user.uid,
          user1Name,
          user2Name,
          createdAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'friends', `${user.uid}_${fromUserId}`), {
          userId1: user.uid,
          userId2: fromUserId,
          user1Name: user2Name,
          user2Name: user1Name,
          createdAt: serverTimestamp(),
        });
      }

      setActiveUsers((prev) => prev.map(u => u.uid === fromUserId ? { ...u, friendRequestStatus: 'accepted' } : u));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Could not accept friend request. Check console for details.');
    }
  };

  const declineFriendRequest = async (fromUserId: string) => {
    if (!user?.uid) return;
    try {
      const requestId = `${fromUserId}_${user.uid}`;
      const reqRef = doc(db, 'friendRequests', requestId);
      // Mark as declined so we keep an audit trail; alternatively you could delete the doc
      await updateDoc(reqRef, { status: 'declined', declinedAt: serverTimestamp() });

      setActiveUsers((prev) => prev.map(u => u.uid === fromUserId ? { ...u, friendRequestStatus: 'none' } : u));
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Could not decline friend request. Check console for details.');
    }
  };

  const startReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const sendFriendRequest = async (targetUserId: string, targetUserName: string) => {
    if (!user?.uid) {
      console.log('User not authenticated');
      return;
    }
    
    setSendingRequest(targetUserId);
    try {
      const requestId = `${user.uid}_${targetUserId}`;
      console.log('Sending friend request:', requestId);
      
      await setDoc(doc(db, 'friendRequests', requestId), {
        fromId: user.uid,
        fromName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        toId: targetUserId,
        toName: targetUserName,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      console.log('Friend request sent successfully');
      
      // Update local state
      setActiveUsers(prev => prev.map(u => 
        u.uid === targetUserId 
          ? { ...u, friendRequestStatus: 'sent' }
          : u
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request. Please check if friend requests collection is created in Firebase.');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)] pb-8 lg:pb-0">
      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg h-full flex flex-col overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-primary-50 to-pink-50">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-pink rounded-lg flex-shrink-0">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Group Chat</h2>
            <span className="ml-auto text-xs sm:text-sm text-gray-500 whitespace-nowrap">{messages.length} messages</span>
            <div className="relative ml-3">
              <button
                onClick={() => setShowRequests((s) => !s)}
                className="relative p-2 rounded-md hover:bg-gray-100"
                title="Friend requests"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">{pendingRequests.length}</span>
                )}
              </button>

              {showRequests && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-2">
                  <h4 className="text-sm font-semibold px-2">Friend Requests</h4>
                  {pendingRequests.length === 0 ? (
                    <p className="text-xs text-gray-500 px-2 py-2">No new requests</p>
                  ) : (
                    pendingRequests.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-2 py-2 border-t">
                        <div>
                          <p className="text-sm font-medium">{r.fromName}</p>
                          <p className="text-xs text-gray-500">Requested</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => acceptFriendRequest(r.fromId)} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Accept</button>
                          <button onClick={() => declineFriendRequest(r.fromId)} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs">Decline</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {loading ? (
              <ChatSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="p-4 bg-gradient-to-br from-primary-100 to-pink-100 rounded-full mb-4">
                  <MessageCircle className="h-10 sm:h-12 w-10 sm:w-12 text-primary-500" />
                </div>
                <p className="text-base sm:text-lg font-semibold">No messages yet</p>
                <p className="text-xs sm:text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderEmail === user?.email;
                const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="space-y-1 max-w-xs sm:max-w-sm lg:max-w-md">
                      <div
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl shadow-sm text-sm sm:text-base ${
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
                        {message.replyTo && (
                          <div
                            className={`mb-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs ${
                              isOwnMessage ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <p className="font-semibold">
                              Replying to {message.replyTo.senderName}
                            </p>
                            <p className="line-clamp-2">{message.replyTo.text}</p>
                          </div>
                        )}
                        <p>{message.text}</p>
                        {message.timestamp && (
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {format(message.timestamp.toDate(), 'HH:mm')}
                          </p>
                        )}
                      </div>

                      {/* Reactions display */}
                      {hasReactions && (
                        <div className="flex flex-wrap gap-1 ml-1">
                          {Object.entries(message.reactions || {}).map(([emoji, users]) => {
                            if (!users || users.length === 0) return null;
                            const reacted = user?.uid && users.includes(user.uid);
                            return (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(message.id, emoji)}
                                className={`px-2 py-0.5 rounded-full text-xs border flex items-center space-x-1 ${
                                  reacted
                                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="hidden sm:inline">{users.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Reaction & reply actions */}
                      <div className="flex items-center gap-1 ml-1 text-xs text-gray-400 flex-wrap">
                        <div className="flex gap-1">
                          {['👍', '❤️', '😂', '🔥'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => toggleReaction(message.id, emoji)}
                              className="hover:scale-110 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => startReply(message)}
                          className="ml-auto hover:text-primary-500 sm:ml-2"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-2 sm:p-4 border-t border-gray-200 bg-white space-y-2">
            {replyTo && (
              <div className="flex items-start justify-between px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl bg-gray-100 text-xs text-gray-700">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    Replying to {replyTo.senderName}
                  </p>
                  <p className="line-clamp-2 text-xs">{replyTo.text}</p>
                </div>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex space-x-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-full hover:from-primary-600 hover:to-accent-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2 shadow-lg flex-shrink-0 text-sm sm:text-base"
              >
                <Send className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            {/* Quick emoji row for composer */}
            <div className="flex gap-1 sm:gap-2 text-lg sm:text-xl pl-2 overflow-x-auto">
              {['😀', '😂', '😍', '😎', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewMessage((prev) => prev + emoji)}
                  className="hover:scale-110 transition-transform flex-shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Active Users Sidebar */}
      <div className="hidden lg:flex lg:w-80 bg-white rounded-2xl shadow-lg flex-col overflow-hidden max-h-[calc(100vh-200px)]">
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
                      {activeUser.friendRequestStatus === 'accepted' ? (
                        <button
                          className="flex-shrink-0 p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          title="Start direct message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      ) : activeUser.friendRequestStatus === 'sent' ? (
                        <button
                          disabled
                          className="flex-shrink-0 p-2 rounded-lg text-gray-400 cursor-not-allowed"
                          title="Friend request sent"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      ) : activeUser.friendRequestStatus === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptFriendRequest(activeUser.uid)}
                            className="flex-shrink-0 px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                            title="Accept friend request"
                          >
                            <Check className="h-4 w-4 inline-block mr-1" />
                            <span className="text-xs">Accept</span>
                          </button>
                          <button
                            onClick={() => declineFriendRequest(activeUser.uid)}
                            className="flex-shrink-0 px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Decline friend request"
                          >
                            <X className="h-4 w-4 inline-block mr-1" />
                            <span className="text-xs">Decline</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(activeUser.uid, activeUser.name)}
                          disabled={sendingRequest === activeUser.uid}
                          className="flex-shrink-0 p-2 hover:bg-primary-100 rounded-lg transition-colors text-primary-500 hover:text-primary-600 disabled:opacity-50"
                          title="Send friend request"
                        >
                          {sendingRequest === activeUser.uid ? (
                            <div className="h-4 w-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </button>
                      )}
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

