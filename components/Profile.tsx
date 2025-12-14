'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Save, Edit2, GraduationCap, BookOpen, Users, Heart, FileText } from 'lucide-react';

interface ProfileProps {
  user: any;
  userData: any;
  onUpdate?: () => void;
}

export default function Profile({ user, userData, onUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    section: '',
    branch: '',
    pronouns: '',
    bio: '',
  });

  const branches = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Aerospace Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Other'
  ];

  const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const pronounsOptions = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'Prefer not to say'];

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        year: userData.year || '',
        section: userData.section || '',
        branch: userData.branch || '',
        pronouns: userData.pronouns || '',
        bio: userData.bio || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        year: formData.year,
        section: formData.section,
        branch: formData.branch,
        pronouns: formData.pronouns,
        bio: formData.bio,
        updatedAt: new Date().toISOString(),
      });
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-primary-500 via-accent-pink to-accent-purple rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {(formData.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  {formData.name || user?.email?.split('@')[0] || 'Student'}
                </h1>
                <p className="text-white/80">{user?.email}</p>
                {formData.pronouns && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {formData.pronouns}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-400 to-accent-pink rounded-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Academic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Branch
              </label>
              {isEditing ? (
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formData.branch || 'Not set'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                {isEditing ? (
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {formData.year || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section
                </label>
                {isEditing ? (
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {formData.section ? `Section ${formData.section}` : 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Heart className="h-4 w-4 inline mr-1" />
                Pronouns
              </label>
              {isEditing ? (
                <select
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Pronouns</option>
                  {pronounsOptions.map((pronoun) => (
                    <option key={pronoun} value={pronoun}>
                      {pronoun}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formData.pronouns || 'Not set'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formData.name || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-accent-blue to-primary-500 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Bio</h2>
        </div>

        {isEditing ? (
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself... What are your interests? What do you like to do? Share something fun!"
            rows={6}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        ) : (
          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[120px] whitespace-pre-wrap">
            {formData.bio || 'No bio yet. Click "Edit Profile" to add one!'}
          </div>
        )}
        {isEditing && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            {formData.bio.length}/500 characters
          </p>
        )}
      </div>

      {/* Quick Stats Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl p-6 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">
            {formData.year || '?'}
          </div>
          <div className="text-sm opacity-90">Year</div>
        </div>
        <div className="bg-gradient-to-br from-accent-pink to-accent-purple rounded-xl p-6 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">
            {formData.section || '?'}
          </div>
          <div className="text-sm opacity-90">Section</div>
        </div>
        <div className="bg-gradient-to-br from-accent-blue to-primary-500 rounded-xl p-6 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">
            {formData.branch ? formData.branch.split(' ')[0] : '?'}
          </div>
          <div className="text-sm opacity-90">Branch</div>
        </div>
      </div>
    </div>
  );
}
