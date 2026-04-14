import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import DestinationsTable from '../components/admin/DestinationsTable';
import { hasAdminAccess } from '../lib/adminAccess';

const AdminDestinations = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { tab } = useParams();
  
  useEffect(() => {
    if (user && !hasAdminAccess(user)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in bg-base-100 text-base-content min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-base-content tracking-tighter">Destinations</h1>
        <p className="text-base-content/60 font-medium">Manage your travel destinations</p>
      </div>
      <DestinationsTable />
    </div>
  );
};

export default AdminDestinations;