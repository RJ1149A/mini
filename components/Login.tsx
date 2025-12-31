'use client';

import { useState } from 'react';
import { signUp, signIn } from '@/lib/auth';
import { MessageCircle, Users, Image, Video } from 'lucide-react';

// Test credentials for development
const TEST_CREDENTIALS = {
  email: 'test@miet.ac.in',
  password: 'test123',
  name: 'Test User'
};

const isDevelopment = process.env.NODE_ENV === 'development';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillTestCredentials = () => {
    setEmail(TEST_CREDENTIALS.email);
    setPassword(TEST_CREDENTIALS.password);
    if (isSignUp) {
      setName(TEST_CREDENTIALS.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      let errorMessage = err.message || 'An error occurred';
      
      // Provide more helpful error messages
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8" style={{ background: 'linear-gradient(135deg, rgba(239, 246, 255, 1) 1%, rgba(238, 242, 255, 1) 47%, rgba(250, 245, 255, 1) 100%)' }}>
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">MIET Student Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">Connect, Chat, and Stay Updated</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-blue-50">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">Chat</p>
            </div>
            <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-purple-50">
              <Image className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-purple-600" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">Photos</p>
            </div>
            <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-pink-50">
              <Video className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-pink-600" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">Videos</p>
            </div>
            <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-green-50">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-green-600" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">Comm.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                placeholder="yourname@miet.ac.in"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Only @miet.ac.in emails allowed</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                style={{ background: '', backgroundColor: 'rgba(224, 242, 254, 1)', backgroundImage: 'none' }}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                <p className="font-medium mb-1">Error:</p>
                <p>{error}</p>
                {error.includes('sign up') && !isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="mt-2 text-red-700 underline text-xs hover:text-red-800"
                  >
                    Click here to sign up
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{ background: 'linear-gradient(90deg, rgba(0, 0, 0, 1) 3%, rgba(255, 255, 255, 1) 100%)' }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium text-xs sm:text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            
            {isDevelopment && (
              <div className="pt-2 sm:pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Development Mode - Test Credentials:</p>
                <div className="text-xs text-gray-600 mb-2 space-y-1">
                  <p>Email: <span className="font-mono text-[11px] sm:text-xs">{TEST_CREDENTIALS.email}</span></p>
                  <p>Password: <span className="font-mono text-[11px] sm:text-xs">{TEST_CREDENTIALS.password}</span></p>
                </div>
                <p className="text-xs text-amber-600 mb-2">⚠️ First time? Click "Sign Up" above, then use these credentials.</p>
                <button
                  type="button"
                  onClick={fillTestCredentials}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Fill Test Credentials
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

