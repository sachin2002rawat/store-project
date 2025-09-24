import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Modal } from '../components/Modal';

interface Store {
  store_id: number;
  store_name: string;
  store_address: string;
  user_rating: number | null;
  average_rating: number;
  total_ratings: number;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    loadStores();
  }, [searchTerm]);

  const loadStores = async () => {
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('name', searchTerm);
        params.append('address', searchTerm);
      }
      
      const response = await fetch(`/api/user/stores?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const submitRating = async () => {
    if (!selectedStore || selectedRating === 0) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/user/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore.store_id,
          rating: selectedRating
        })
      });
      
      if (response.ok) {
        loadStores();
        setShowRatingModal(false);
        setSelectedStore(null);
        setSelectedRating(0);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const openRatingModal = (store: Store) => {
    setSelectedStore(store);
    setSelectedRating(store.user_rating || 0);
    setShowRatingModal(true);
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Browse Stores</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Input
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.store_id}>
              <CardHeader>
                <h3 className="text-lg font-medium">{store.store_name}</h3>
                <p className="text-sm text-gray-600">{store.store_address}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Overall Rating</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(store.average_rating)}
                      <span className="text-sm text-gray-600">
                        {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700">Your Rating</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2">
                        {renderStars(store.user_rating || 0)}
                        {store.user_rating && (
                          <span className="text-sm text-gray-600">{store.user_rating}/5</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openRatingModal(store)}
                        variant={store.user_rating ? "outline" : "primary"}
                      >
                        {store.user_rating ? 'Update' : 'Rate'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No stores found. Try adjusting your search.</p>
          </div>
        )}

        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title={`Rate ${selectedStore?.store_name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Click on a star to rate this store</p>
            <div className="flex justify-center">
              {renderStars(selectedRating, true, setSelectedRating)}
            </div>
            {selectedRating > 0 && (
              <p className="text-center text-lg font-medium">{selectedRating}/5 Stars</p>
            )}
            <Button
              onClick={submitRating}
              disabled={selectedRating === 0}
              className="w-full"
            >
              Submit Rating
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
