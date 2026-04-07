import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { Listing } from '../types/listing';
import { Package, Edit, Trash2, Check, X, MessageCircle, Lock } from 'lucide-react';

interface MyListingsProps {
  sellerPhone: string;
}

export default function MyListings({ sellerPhone }: MyListingsProps) {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', price: 0, description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const normalizePhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('212')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+212' + cleaned.substring(1);
    if (cleaned.length === 9) return '+212' + cleaned;
    return '+212' + cleaned;
  };

  const fetchMyListings = async () => {
    try {
      const normalizedPhone = normalizePhone(sellerPhone);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_whatsapp', normalizedPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const normalizedPhone = normalizePhone(sellerPhone);
    const storedPin = localStorage.getItem(`yousouq_pin_${normalizedPhone}`);
    if (storedPin) {
      setVerifiedPin(storedPin);
    } else {
      setShowPinModal(true);
    }
    fetchMyListings();
  }, [sellerPhone]);

  const handleVerifyPin = (pin: string) => {
    const normalizedPhone = normalizePhone(sellerPhone);
    const storedPin = localStorage.getItem(`yousouq_pin_${normalizedPhone}`);
    if (!storedPin) {
      localStorage.setItem(`yousouq_pin_${normalizedPhone}`, pin);
      setVerifiedPin(pin);
    } else if (storedPin === pin) {
      setVerifiedPin(pin);
    } else {
      setError(t('myListings.wrongPin'));
      return;
    }
    setShowPinModal(false);
  };

  const [error, setError] = useState<string | null>(null);

  const handleMarkAsSold = async (id: string) => {
    if (!verifiedPin) { setShowPinModal(true); return; }
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    fetchMyListings();
  };

  const handleReactivate = async (id: string) => {
    if (!verifiedPin) { setShowPinModal(true); return; }
    await supabase.from('listings').update({ status: 'active' }).eq('id', id);
    fetchMyListings();
  };

  const handleDelete = async (id: string) => {
    if (!verifiedPin) { setShowPinModal(true); return; }
    await supabase.from('listings').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchMyListings();
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditForm({ title: listing.title, price: listing.price, description: listing.description });
  };

  const handleSaveEdit = async (id: string) => {
    await supabase.from('listings').update(editForm).eq('id', id);
    setEditingId(null);
    fetchMyListings();
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('myListings.noListings')}</h3>
        <p className="text-gray-500">{t('myListings.noListingsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('myListings.title')} ({listings.length})</h2>
      
      {listings.map((listing) => (
        <div key={listing.id} className="bg-white rounded-xl shadow-sm p-4">
          {editingId === listing.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={t('form.name')}
              />
              <input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={t('form.price')}
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={t('form.description')}
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={() => handleSaveEdit(listing.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" /> {t('myListings.save')}
                </button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2">
                  <X className="w-4 h-4" /> {t('myListings.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                    <p className="text-[#F97316] font-bold">{listing.price} DH</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded ${listing.status === 'sold' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {listing.status === 'sold' ? t('myListings.sold') : t('myListings.active')}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(listing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title={t('myListings.edit')}>
                      <Edit className="w-4 h-4" />
                    </button>
                    {listing.status === 'active' ? (
                      <button onClick={() => handleMarkAsSold(listing.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title={t('myListings.markSold')}>
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(listing.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title={t('myListings.reactivate')}>
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirm(listing.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title={t('myListings.delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deleteConfirm === listing.id && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center justify-between">
              <span className="text-red-700 text-sm">{t('myListings.confirmDelete')}</span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(listing.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">{t('myListings.yes')}</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">{t('myListings.cancel')}</button>
              </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );

  if (showPinModal) {
    const [pin, setPin] = useState('');
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-xl font-bold">{t('myListings.enterPin')}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">{t('myListings.pinDesc')}</p>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0,4)); setError(null); }}
            placeholder="••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 text-center text-2xl tracking-widest"
          />
          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
          <button
            onClick={() => handleVerifyPin(pin)}
            disabled={pin.length !== 4}
            className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-medium disabled:bg-gray-300"
          >
            {t('myListings.verify')}
          </button>
        </div>
      </div>
    );
  }
}