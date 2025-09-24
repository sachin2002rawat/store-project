import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">StoreRate</h1>
            <div className="space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rate & Discover Local Stores
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your experiences and discover the best stores in your area through authentic customer reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">For Customers</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Browse verified stores</li>
                <li>• Submit honest ratings</li>
                <li>• Search by location</li>
                <li>• Update your reviews</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">For Store Owners</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• View customer feedback</li>
                <li>• Track store ratings</li>
                <li>• Analytics dashboard</li>
                <li>• Reputation management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">For Administrators</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Manage users & stores</li>
                <li>• Platform analytics</li>
                <li>• User role management</li>
                <li>• Content moderation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/register">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
