import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader } from '../components/Card';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.name.length < 20 || formData.name.length > 60) {
      setError('Name must be 20-60 characters long');
      return;
    }
    if (formData.address.length > 400) {
      setError('Address must be max 400 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.address);
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
          <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
          <p className="text-gray-600 mt-2">Create your StoreRate account</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-center">Get Started</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name (20-60 chars)
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/60 characters (minimum 20)
                </p>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  8-16 chars, uppercase letter, special character
                </p>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.address.length}/400 characters
                </p>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-500">
                Already have an account? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
