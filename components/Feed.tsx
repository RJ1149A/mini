'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  Heart, 
  MessageCircle, 
  Send,
  Smile,
  Flame,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  url: string;
  type: 'photo' | 'video';
  caption?: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  timestamp: any;
  reactions?: {
    iloveu: string[];
    kataiZeher: string[];
    kyaDekhLiya: string[];
  };
  comments?: Comment[];
}

interface Comment {
  id: string;
  text: string;
  commentedBy: string;
  commentedByName: string;
  commentedByEmail: string;
  timestamp: any;
  streakCount?: number;
}

interface FeedProps {
  user: any;
  userData: any;
}

export default function Feed({ user, userData }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showReactions, setShowReactions] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'feedPosts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Fetch comments
          let comments: Comment[] = [];
          try {
            const commentsQuery = query(
              collection(db, 'feedPosts', doc.id, 'comments'),
              orderBy('timestamp', 'asc')
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            comments = commentsSnapshot.docs.map(commentDoc => ({
              id: commentDoc.id,
              ...commentDoc.data(),
            })) as Comment[];
          } catch (error) {
            console.error('Error fetching comments:', error);
          }

          return {
            id: doc.id,
            ...data,
            comments: comments || [],
            reactions: data.reactions || {
              iloveu: [],
              kataiZeher: [],
              kyaDekhLiya: [],
            },
          } as Post;
        })
      );
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  // Compress image before upload
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file); // Return original if not an image
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      // Compress image if it's an image
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        setUploadStatus('Compressing image...');
        processedFile = await compressImage(file);
        setUploadStatus('');
      }
      
      setSelectedFile(processedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading...');

    try {
      const fileType = selectedFile.type.startsWith('image/') ? 'photo' : 'video';
      const fileName = `${user.uid}_${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `feed/${fileName}`);

      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Track upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          setUploadStatus(`Uploading... ${Math.round(progress)}%`);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadStatus('Upload failed. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload completed
          setUploadStatus('Processing...');
          setUploadProgress(100);
          
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setUploadStatus('Saving post...');
          await addDoc(collection(db, 'feedPosts'), {
            url: downloadURL,
            type: fileType,
            caption: caption.trim() || '',
            postedBy: user.uid,
            postedByName: userData?.name || user.email?.split('@')[0] || 'Anonymous',
            postedByEmail: user.email,
            timestamp: serverTimestamp(),
            reactions: {
              iloveu: [],
              kataiZeher: [],
              kyaDekhLiya: [],
            },
          });

          setSelectedFile(null);
          setPreview(null);
          setCaption('');
          setUploadProgress(0);
          setUploadStatus('');
          setShowUploadModal(false);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error uploading:', error);
      setUploadStatus('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: 'iloveu' | 'kataiZeher' | 'kyaDekhLiya') => {
    if (!user) return;

    const postRef = doc(db, 'feedPosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) return;

    const postData = postDoc.data();
    const reactions = postData.reactions || {
      iloveu: [],
      kataiZeher: [],
      kyaDekhLiya: [],
    };

    const reactionArray = reactions[reactionType] || [];
    const userIndex = reactionArray.indexOf(user.uid);

    if (userIndex > -1) {
      // Remove reaction
      reactionArray.splice(userIndex, 1);
    } else {
      // Add reaction
      reactionArray.push(user.uid);
    }

    await updateDoc(postRef, {
      reactions: {
        ...reactions,
        [reactionType]: reactionArray,
      },
    });
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return;

    try {
      // Check for streak (if user commented on this post before)
      const commentsQuery = query(
        collection(db, 'feedPosts', postId, 'comments'),
        where('commentedBy', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const previousComments = await getDocs(commentsQuery);
      
      let streakCount = 1;
      if (!previousComments.empty) {
        const lastComment = previousComments.docs[0].data();
        streakCount = (lastComment.streakCount || 1) + 1;
      }

      await addDoc(collection(db, 'feedPosts', postId, 'comments'), {
        text: commentText[postId].trim(),
        commentedBy: user.uid,
        commentedByName: userData?.name || user.email?.split('@')[0] || 'Anonymous',
        commentedByEmail: user.email,
        timestamp: serverTimestamp(),
        streakCount,
      });

      setCommentText({ ...commentText, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getReactionCount = (post: Post, type: 'iloveu' | 'kataiZeher' | 'kyaDekhLiya') => {
    return post.reactions?.[type]?.length || 0;
  };

  const hasUserReacted = (post: Post, type: 'iloveu' | 'kataiZeher' | 'kyaDekhLiya') => {
    return post.reactions?.[type]?.includes(user?.uid) || false;
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl font-semibold hover:from-primary-600 hover:to-accent-pink/90 transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Photo or Video</span>
        </button>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-700 mb-2">No posts yet</p>
            <p className="text-gray-500">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold">
                    {post.postedByName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{post.postedByName}</p>
                    <p className="text-xs text-gray-500">
                      {post.timestamp ? format(post.timestamp.toDate(), 'MMM d, yyyy • h:mm a') : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Media */}
              <div className="relative">
                {post.type === 'photo' ? (
                  <img
                    src={post.url}
                    alt={post.caption || 'Post'}
                    className="w-full h-auto max-h-[600px] object-cover"
                  />
                ) : (
                  <video
                    src={post.url}
                    controls
                    className="w-full h-auto max-h-[600px]"
                  />
                )}
              </div>

              {/* Reactions */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(post.id, 'iloveu')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                      hasUserReacted(post, 'iloveu')
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="font-semibold">I Love U</span>
                    {getReactionCount(post, 'iloveu') > 0 && (
                      <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {getReactionCount(post, 'iloveu')}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, 'kataiZeher')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                      hasUserReacted(post, 'kataiZeher')
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                    }`}
                  >
                    <Flame className="h-5 w-5" />
                    <span className="font-semibold">Katai Zeher</span>
                    {getReactionCount(post, 'kataiZeher') > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {getReactionCount(post, 'kataiZeher')}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, 'kyaDekhLiya')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                      hasUserReacted(post, 'kyaDekhLiya')
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                    }`}
                  >
                    <Eye className="h-5 w-5" />
                    <span className="font-semibold">Kya Dekh Liya</span>
                    {getReactionCount(post, 'kyaDekhLiya') > 0 && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {getReactionCount(post, 'kyaDekhLiya')}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-gray-900">
                    <span className="font-semibold">{post.postedByName}</span> {post.caption}
                  </p>
                </div>
              )}

              {/* Comments */}
              <div className="p-4">
                <button
                  onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                  className="text-sm text-gray-600 hover:text-primary-600 mb-3 flex items-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
                  </span>
                </button>

                {selectedPost === post.id && (
                  <div className="space-y-3 mt-3">
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-sm">
                              {comment.commentedByName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {comment.commentedByName}
                                </span>
                                {comment.streakCount && comment.streakCount > 1 && (
                                  <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                                    <Flame className="h-3 w-3" />
                                    <span>{comment.streakCount} streak</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {comment.timestamp ? format(comment.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-pink flex items-center justify-center text-white font-bold text-sm">
                        {(userData?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      </div>
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                        className="p-2 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-full hover:from-primary-600 hover:to-accent-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload to Feed</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPreview(null);
                  setCaption('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {preview ? (
                <>
                  <div className="relative">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img src={preview} alt="Preview" className="w-full h-auto rounded-xl max-h-96 object-cover" />
                    ) : (
                      <video src={preview} controls className="w-full h-auto rounded-xl max-h-96" />
                    )}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium mb-2">Click to upload photo or video</p>
                  <p className="text-sm text-gray-500">PNG, JPG, MP4 up to 50MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview && (
                <div className="space-y-3">
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">{uploadStatus}</span>
                        <span className="text-primary-600 font-bold">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-accent-pink h-3 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl font-semibold hover:from-primary-600 hover:to-accent-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Post to Feed</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
