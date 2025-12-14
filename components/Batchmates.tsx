'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Circle, Search } from 'lucide-react';

interface Batchmate {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isOnline: boolean;
  batch?: string;
  year?: string;
  branch?: string;
  section?: string;
  pronouns?: string;
  bio?: string;
}

interface BatchmatesProps {
  user: any;
  userData: any;
}

export default function Batchmates({ user, userData }: BatchmatesProps) {
  const [batchmates, setBatchmates] = useState<Batchmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchBatchmates = async () => {
      try {
        // Extract batch/year from email (e.g., 2024batch@miet.ac.in or name2024@miet.ac.in)
        // For now, we'll show all students, but you can filter by batch/year
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const batchmatesList: Batchmate[] = [];

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

          // Extract year from email (simple heuristic)
          const email = userData.email || '';
          const yearMatch = email.match(/\d{4}/);
          const year = yearMatch ? yearMatch[0] : 'Unknown';

          batchmatesList.push({
            uid: userDoc.id,
            name: userData.name || email.split('@')[0] || 'Unknown',
            email: email,
            photoURL: userData.photoURL || '',
            isOnline,
            year: userData.year || year,
            branch: userData.branch || '',
            section: userData.section || '',
            pronouns: userData.pronouns || '',
            bio: userData.bio || '',
          });
        }

        // Sort by online status, then by name
        batchmatesList.sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return a.name.localeCompare(b.name);
        });

        setBatchmates(batchmatesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching batchmates:', error);
        setLoading(false);
      }
    };

    fetchBatchmates();
  }, [user]);

  const filteredBatchmates = batchmates.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.year?.includes(searchQuery)
  );

  const onlineCount = batchmates.filter(b => b.isOnline).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-primary-400 to-accent-purple rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batchmates</h2>
            <p className="text-sm text-gray-500">
              {onlineCount} online • {batchmates.length} total students
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search batchmates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredBatchmates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No batchmates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatchmates.map((batchmate) => (
            <div
              key={batchmate.uid}
              className="p-5 border border-gray-200 rounded-xl hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 hover:scale-105 cursor-pointer"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {batchmate.name.charAt(0).toUpperCase()}
                  </div>
                  {batchmate.isOnline && (
                    <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-green-500 bg-white rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-bold text-gray-900 truncate text-lg">{batchmate.name}</p>
                    {batchmate.pronouns && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                        {batchmate.pronouns}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{batchmate.email}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {batchmate.year && (
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
                        {batchmate.year}
                      </span>
                    )}
                    {batchmate.section && (
                      <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-semibold">
                        Sec {batchmate.section}
                      </span>
                    )}
                    {batchmate.branch && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold truncate max-w-full">
                        {batchmate.branch.split(' ')[0]}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      batchmate.isOnline 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {batchmate.isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </div>
              {batchmate.bio && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2 italic">
                  "{batchmate.bio}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
