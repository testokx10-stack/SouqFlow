import { useState } from 'react';
import { MapPin, Tag, DollarSign, User, Phone, Package, ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { ProductCondition, ProductCategory } from '../types/listing';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kenitra', 'Tétouan', 'Salé', 'Mohammedia', 'El Jadida', 'Nador'
];

const CATEGORIES = [
  { value: 'cars', label: '🚗 Voitures' },
  { value: 'phones', label: '📱 Téléphones' },
  { value: 'electronics', label: '💻 Électronique' },
  { value: 'clothes', label: '👕 Vêtements' },
  { value: 'home', label: '🏠 Maison' },
  { value: 'other', label: '📦 Autres' }
];

const CONDITIONS = [
  { value: 'neuf' as ProductCondition, label: 'Neuf' },
  { value: 'tres_bon' as ProductCondition, label: 'Très bon' },
  { value: 'bon' as ProductCondition, label: 'Bon état' },
  { value: 'use' as ProductCondition, label: 'Usé' }
];

interface ListingFormProps {
  onSuccess: () => void;
  onBack?: () => void;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  category: ProductCategory;
  location: string;
  seller_name: string;
  seller_whatsapp: string;
  image_url: string | null;
}

export default function ListingForm({ onSuccess, onBack }: ListingFormProps) {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    condition: 'bon',
    category: 'other',
    location: '',
    seller_name: '',
    seller_whatsapp: '',
    image_url: null
  });

  const fileInputRef = useState<React.RefObject<HTMLInputElement>>({ current: null });
  const cameraInputRef = useState<React.RefObject<HTMLInputElement>>({ current: null });

  const handleImageSelected = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const formatWhatsAppNumber = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('212')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+212' + cleaned.substring(1);
    if (cleaned.length === 9) return '+212' + cleaned;
    return '+212' + cleaned;
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) { setError('Le titre est obligatoire'); return false; }
    if (formData.price <= 0) { setError('Le prix doit être supérieur à 0 DH'); return false; }
    if (!formData.location) { setError('La ville est obligatoire'); return false; }
    if (!formData.seller_name.trim()) { setError('Votre nom est obligatoire'); return false; }
    if (!formData.seller_whatsapp.trim()) { setError('Le numéro WhatsApp est obligatoire'); return false; }
    
    const phoneRegex = /^(\+212|0)(\d){9}$/;
    const cleanPhone = formData.seller_whatsapp.replace(/\D/g, '');
    if (cleanPhone.length !== 10 && cleanPhone.length !== 12) {
      setError('Numéro WhatsApp invalide');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);
        if (uploadError) throw new Error('Erreur upload image');
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
        imageUrl = publicUrl;
      }

      await supabase.from('listings').insert({
        ...formData,
        seller_whatsapp: formatWhatsAppNumber(formData.seller_whatsapp),
        image_url: imageUrl
      });

      setFormData({
        title: '', description: '', price: 0, condition: 'bon', category: 'other',
        location: '', seller_name: '', seller_whatsapp: '', image_url: null
      });
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-gray-800">Publier une annonce</h2>
          <p className="text-[#16A34A] text-sm font-medium">100% gratuit</p>
        </div>
        <div className="w-10"></div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image Upload */}
      <div>
        {!imagePreview ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <Camera className="w-8 h-8 text-[#16A34A] mb-2" />
              <span className="text-sm font-medium text-gray-700">Prendre photo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <ImageIcon className="w-8 h-8 text-[#16A34A] mb-2" />
              <span className="text-sm font-medium text-gray-700">Choisir image</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])} />
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Titre de votre annonce *"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
          required
        />
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="Prix (DH) *"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
            required
          />
        </div>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description (optionnel)"
        rows={2}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none resize-none"
      />

      {/* Location */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          Ville *
        </div>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
          required
        >
          <option value="">Sélectionnez une ville</option>
          {MOROCCAN_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={formData.seller_name}
            onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
            placeholder="Votre nom *"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
            required
          />
        </div>
        <div>
          <input
            type="tel"
            value={formData.seller_whatsapp}
            onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}
            placeholder="WhatsApp *"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all hover:shadow-xl disabled:bg-gray-400"
      >
        {isSubmitting ? 'Publication...' : '🚀 Publier mon annonce'}
      </button>

      <p className="text-xs text-center text-gray-400">Sans inscription • Contact direct via WhatsApp</p>
    </form>
  );
}