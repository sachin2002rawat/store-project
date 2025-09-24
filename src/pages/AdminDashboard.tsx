import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Modal } from '../components/Modal';

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
}

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: number;
  total_ratings: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) setStats(await statsRes.json());

      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      const storesRes = await fetch('/api/admin/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (storesRes.ok) {
        const data = await storesRes.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createUser = async (formData: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        loadData();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex space-x-4 mb-6">
          {['stats', 'users', 'stores'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Total Users</h3>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Total Stores</h3>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.totalStores}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Total Ratings</h3>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.totalRatings}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Users</h3>
                <Button onClick={() => setShowUserModal(true)}>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'store_owner' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'stores' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Stores</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell>
                        {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <UserModal 
          isOpen={showUserModal} 
          onClose={() => setShowUserModal(false)}
          onSubmit={createUser}
        />
      </div>
    </div>
  );
}

function UserModal({ isOpen, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Name (20-60 chars)"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" className="w-full">Create User</Button>
      </form>
    </Modal>
  );
}
