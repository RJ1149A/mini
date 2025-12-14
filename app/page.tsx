'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import Loading from '@/components/Loading';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

