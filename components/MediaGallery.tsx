'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { Upload, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  uploadedBy: string;
  uploadedByName: string;
  timestamp: any;
}

interface MediaGalleryProps {
  user: any;
  userData: any;
}

export default function MediaGallery({ user, userData }: MediaGalleryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'media'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaItem[];
      setMediaItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      }
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const fileType = selectedFile.type.startsWith('image/') ? 'photo' : 'video';
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `media/${user.uid}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('student-app')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        alert('Error uploading file. Please try again.');
        setUploading(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from('student-app')
        .getPublicUrl(filePath);

      const downloadURL = publicData?.publicUrl;

      await addDoc(collection(db, 'media'), {
        url: downloadURL,
        type: fileType,
        uploadedBy: user.uid,
        uploadedByName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        timestamp: serverTimestamp(),
      });

      setSelectedFile(null);
      setPreview(null);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Photos & Videos</h2>
        <label className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
          <Upload className="h-5 w-5" />
          <span>Upload Media</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upload Preview</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {preview && (
              <div className="mb-4">
                {selectedFile?.type.startsWith('image/') ? (
                  <img src={preview} alt="Preview" className="max-w-full rounded-lg" />
                ) : (
                  <video src={preview} controls className="max-w-full rounded-lg" />
                )}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No media uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share photos or videos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt="Uploaded photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  {item.type === 'photo' ? (
                    <ImageIcon className="h-5 w-5 text-white drop-shadow-lg" />
                  ) : (
                    <VideoIcon className="h-5 w-5 text-white drop-shadow-lg" />
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.uploadedByName}
                </p>
                {item.timestamp && (
                  <p className="text-xs text-gray-500">
                    {format(item.timestamp.toDate(), 'MMM d, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

