import { useState } from 'react';
import { X, Building, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'airbnb', 'resort', 'other'];
const BOOKING_TYPES = ['flight', 'train', 'bus', 'car', 'ferry', 'other'];
const DOCUMENT_TYPES = ['passport', 'visa', 'insurance', 'ticket', 'reservation', 'other'];

export function AccommodationForm({ tripId, accommodation, onSuccess, onCancel }) {
  const [form, setForm] = useState(accommodation || {
    type: 'hotel',
    name: '',
    address: '',
    confirmation: '',
    checkIn: '',
    checkOut: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (accommodation?.id) {
        await api.put(`/accommodations/${accommodation.id}`, form);
        toast.success('Accommodation updated');
      } else {
        await api.post(`/trips/${tripId}/accommodations`, form);
        toast.success('Accommodation added');
      }
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to save accommodation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Type</label>
          <select
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          >
            {ACCOMMODATION_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Name</label>
          <input
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
            placeholder="Hotel name"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Address</label>
        <input
          value={form.address}
          onChange={e => setForm({...form, address: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          placeholder="Full address"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Confirmation Number</label>
        <input
          value={form.confirmation}
          onChange={e => setForm({...form, confirmation: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          placeholder="Booking confirmation"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Check-in</label>
          <input
            type="date"
            value={form.checkIn}
            onChange={e => setForm({...form, checkIn: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Check-out</label>
          <input
            type="date"
            value={form.checkOut}
            onChange={e => setForm({...form, checkOut: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold border border-base-content/20 text-base-content">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-black bg-brand-vibrant hover:bg-emerald-600 text-white">
          {submitting ? 'Saving...' : 'Save Accommodation'}
        </button>
      </div>
    </form>
  );
}

export function BookingForm({ tripId, booking, onSuccess, onCancel }) {
  const [form, setForm] = useState(booking || {
    type: 'flight',
    provider: '',
    confirmation: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    arrivalDate: '',
    cost: '',
    currency: 'GBP'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (booking?.id) {
        await api.put(`/bookings/${booking.id}`, form);
        toast.success('Booking updated');
      } else {
        await api.post(`/trips/${tripId}/bookings`, form);
        toast.success('Booking added');
      }
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Type</label>
          <select
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          >
            {BOOKING_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Provider</label>
          <input
            value={form.provider}
            onChange={e => setForm({...form, provider: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
            placeholder="Airline/Train company"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Confirmation</label>
        <input
          value={form.confirmation}
          onChange={e => setForm({...form, confirmation: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          placeholder="Booking reference"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">From</label>
          <input
            value={form.departureLocation}
            onChange={e => setForm({...form, departureLocation: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
            placeholder="Departure location"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">To</label>
          <input
            value={form.arrivalLocation}
            onChange={e => setForm({...form, arrivalLocation: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
            placeholder="Arrival location"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Departure Date</label>
          <input
            type="date"
            value={form.departureDate}
            onChange={e => setForm({...form, departureDate: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Arrival Date</label>
          <input
            type="date"
            value={form.arrivalDate}
            onChange={e => setForm({...form, arrivalDate: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Cost</label>
          <input
            type="number"
            step="0.01"
            value={form.cost}
            onChange={e => setForm({...form, cost: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Currency</label>
          <select
            value={form.currency}
            onChange={e => setForm({...form, currency: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          >
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold border border-base-content/20 text-base-content">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-black bg-brand-vibrant hover:bg-emerald-600 text-white">
          {submitting ? 'Saving...' : 'Save Booking'}
        </button>
      </div>
    </form>
  );
}

export function DocumentForm({ tripId, document, onSuccess, onCancel }) {
  const [form, setForm] = useState(document || {
    type: 'passport',
    name: '',
    expiryDate: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (document?.id) {
        await api.put(`/trip-documents/${document.id}`, form);
        toast.success('Document updated');
      } else {
        await api.post(`/trips/${tripId}/documents`, form);
        toast.success('Document added');
      }
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to save document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Document Type</label>
        <select
          value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
        >
          {DOCUMENT_TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Name / Number</label>
        <input
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          placeholder="Document name or number"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Expiry Date (optional)</label>
        <input
          type="date"
          value={form.expiryDate}
          onChange={e => setForm({...form, expiryDate: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-base-content/10 bg-base-100 focus:ring-2 focus:ring-brand-vibrant outline-none font-bold text-base-content"
          rows={3}
          placeholder="Any additional notes..."
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold border border-base-content/20 text-base-content">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-black bg-brand-vibrant hover:bg-emerald-600 text-white">
          {submitting ? 'Saving...' : 'Save Document'}
        </button>
      </div>
    </form>
  );
}

export default { AccommodationForm, BookingForm, DocumentForm };