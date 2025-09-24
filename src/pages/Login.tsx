import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader } from '../components/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">Access your StoreRate account</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-center">Welcome Back</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Link to="/register" className="text-blue-600 hover:text-blue-500">
                Don't have an account? Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-medium text-blue-900 mb-2">Demo Accounts</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Admin:</strong> admin@storerating.com / Admin123!</div>
            <div><strong>User:</strong> user@example.com / User123!</div>
            <div><strong>Store:</strong> store@example.com / Store123!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
