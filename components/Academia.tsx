'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload, Download, File, Search, X } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  branch: string;
  semester: string;
  url: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName?: string;
  timestamp?: any;
  description?: string;
}

interface AcademiaProps {
  user: any;
  userData: any;
}

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function Academia({ user, userData }: AcademiaProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState(userData?.branch || BRANCHES[0]);
  const [semester, setSemester] = useState(userData?.semester || SEMESTERS[0]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'academiaMaterials'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Material[];
      setMaterials(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileType = selectedFile.type || 'application/octet-stream';
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `academia/${branch}/sem-${semester}/${user.uid}/${fileName}`;

      // Get presigned URL from backend
      const presignResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          contentType: fileType,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error('Failed to get presigned URL');
      }

      const { presignedUrl } = await presignResponse.json();

      setUploadProgress(50);

      // Upload directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      setUploadProgress(100);
      const downloadURL = `https://${filePath.split('/')[0]}.s3.amazonaws.com/${filePath}`;

      await addDoc(collection(db, 'academiaMaterials'), {
        title: title || selectedFile.name,
        branch,
        semester,
        url: downloadURL,
        fileType: fileType,
        uploadedBy: user.uid,
        uploadedByName: userData?.name || user.email?.split('@')[0] || 'Unknown',
        description: description || '',
        timestamp: serverTimestamp()
      });

      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setShowUploadModal(false);
      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  const filteredMaterials = (branchFilter: string, semFilter: string) => {
    return materials.filter((m) => {
      const matchesBranch = branchFilter ? m.branch === branchFilter : true;
      const matchesSem = semFilter ? m.semester === semFilter : true;
      return matchesBranch && matchesSem;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academia - Notes & Materials</h2>
          <p className="text-sm text-gray-500">Access study material by branch and semester</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Material</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label className="text-xs text-gray-500">Branch</label>
            <select
              className="ml-2 border rounded-md px-3 py-2"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Semester</label>
            <select
              className="ml-2 border rounded-md px-3 py-2"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMaterials(branch, semester).map((m) => (
              <div key={m.id} className="p-4 border border-gray-100 rounded-lg flex items-start space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <File className="h-6 w-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.title}</h3>
                      <p className="text-xs text-gray-500">{m.branch} • Sem {m.semester} • {m.fileType.split('/')[0]}</p>
                    </div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </div>
                  {m.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">Uploaded by {m.uploadedByName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upload Study Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-md">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-2 px-4 py-2 border rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Branch</label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md" value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Semester</label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md" value={semester} onChange={(e) => setSemester(e.target.value)}>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-2 px-4 py-2 border rounded-md" rows={3} />
              </div>

              <div>
                <label className="text-sm font-medium">File</label>
                <div className="mt-2 flex items-center space-x-3">
                  <label className="px-4 py-2 bg-gray-100 rounded-md cursor-pointer">
                    Choose file
                    <input ref={fileInputRef} type="file" accept="*" onChange={handleFileSelect} className="hidden" />
                  </label>
                  <div className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'No file selected'}</div>
                </div>
              </div>

              {uploading && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button onClick={handleUpload} disabled={uploading || !selectedFile} className="px-4 py-2 bg-primary-600 text-white rounded-md">{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
