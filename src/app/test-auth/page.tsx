'use client';

import { useAuthContext } from '@/providers/AuthProvider';
import { signIn, signOut } from '@/lib/auth';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, isLoading, isAdmin } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const { error } = await signIn(email, password);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Login successful!');
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Logged out successfully!');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading auth status...</div>;
  }

  return (
    <div className="text-black p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Current Status:</h2>
        <p>Logged in: {user ? 'Yes' : 'No'}</p>
        <p>Email: {user?.email || 'Not logged in'}</p>
        <p>Admin: {isAdmin ? 'Yes ✅' : 'No ❌'}</p>
        <p>User ID: {user?.id?.substring(0, 8)}...</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="your-email@example.com"
            />
          </div>
          <div>
            <label className="block mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
          
          {isAdmin && (
            <div className="p-4 bg-green-100 text-green-800 rounded">
              You have admin privileges! You will see edit pencil icons.
            </div>
          )}
        </div>
      )}
    </div>
  );
}