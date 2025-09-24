import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: number;
  total_ratings: number;
}

interface Rating {
  user_id: number;
  name: string;
  email: string;
  rating: number;
  created_at: string;
}

export default function StoreDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadRatings(selectedStore.id);
    }
  }, [selectedStore]);

  const loadStores = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/store/my-stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
        if (data.stores.length > 0) {
          setSelectedStore(data.stores[0]);
        }
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadRatings = async (storeId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/store/${storeId}/ratings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      distribution[rating.rating - 1]++;
    });
    return distribution;
  };

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-600">You don't have any stores assigned to your account.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {stores.length > 1 && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Your Stores</h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`p-4 rounded-lg border text-left ${
                        selectedStore?.id === store.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{store.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        ★ {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedStore && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Average Rating</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedStore.average_rating.toFixed(1)}
                  </div>
                  <div className="mt-2">
                    {renderStars(Math.round(selectedStore.average_rating))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Total Reviews</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {selectedStore.total_ratings}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Customer feedback</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Store Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Active</div>
                  <p className="text-sm text-gray-600 mt-2">Receiving reviews</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">{selectedStore.name}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>📧 {selectedStore.email}</div>
                  <div>📍 {selectedStore.address}</div>
                </div>
              </CardContent>
            </Card>

            {ratings.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Rating Distribution</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getRatingDistribution().reverse().map((count, index) => {
                        const stars = 5 - index;
                        const percentage = selectedStore.total_ratings > 0 
                          ? (count / selectedStore.total_ratings) * 100 
                          : 0;
                        return (
                          <div key={stars} className="flex items-center space-x-4">
                            <div className="w-12 text-sm">{stars} ★</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-600 w-16">
                              {count} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ratings.map((rating) => (
                          <TableRow key={rating.user_id}>
                            <TableCell>{rating.name}</TableCell>
                            <TableCell>{rating.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {renderStars(rating.rating)}
                                <span className="text-sm">{rating.rating}/5</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(rating.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}

            {ratings.length === 0 && (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Your store hasn't received any reviews yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
