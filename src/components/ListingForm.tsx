import { useState } from 'react';
import { MapPin, Tag, FileText, DollarSign, User, Phone, Package, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';
import { supabase } from '../lib/supabase';
import type { CreateListingData, ProductCondition, ProductCategory } from '../types/listing';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kenitra', 'Tétouan', 'Salé', 'Mohammedia', 'El Jadida', 'Nador'
];

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Casablanca': { lat: 33.5731, lng: -7.5898 },
  'Rabat': { lat: 34.0209, lng: -6.8416 },
  'Fès': { lat: 34.0181, lng: -5.0078 },
  'Marrakech': { lat: 31.6295, lng: -7.9811 },
  'Tanger': { lat: 35.7595, lng: -5.8340 },
  'Agadir': { lat: 30.4278, lng: -9.5981 },
  'Meknès': { lat: 33.8938, lng: -5.5473 },
  'Oujda': { lat: 34.6819, lng: -1.9176 },
  'Kenitra': { lat: 34.2591, lng: -6.5818 },
  'Tétouan': { lat: 35.5785, lng: -5.3681 },
  'Salé': { lat: 34.0389, lng: -6.7986 },
  'Mohammedia': { lat: 33.5917, lng: -7.3839 },
  'El Jadida': { lat: 33.2319, lng: -8.5007 },
  'Nador': { lat: 35.1680, lng: -2.9289 }
};

const CONDITIONS = [
  { value: 'neuf' as ProductCondition, label: 'Neuf' },
  { value: 'tres_bon' as ProductCondition, label: 'Très bon état' },
  { value: 'bon' as ProductCondition, label: 'Bon état' },
  { value: 'use' as ProductCondition, label: 'Usé' }
];

const CATEGORIES = [
  { value: 'electronics' as ProductCategory, label: 'Électronique' },
  { value: 'cars' as ProductCategory, label: 'Véhicules' },
  { value: 'clothes' as ProductCategory, label: 'Vêtements' },
  { value: 'home' as ProductCategory, label: 'Maison & Jardin' },
  { value: 'sports' as ProductCategory, label: 'Sports & Loisirs' },
  { value: 'books' as ProductCategory, label: 'Livres' },
  { value: 'other' as ProductCategory, label: 'Autre' }
];

interface ListingFormProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export default function ListingForm({ onSuccess, onBack }: ListingFormProps) {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const [formData, setFormData] = useState<CreateListingData>({
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

    if (cleaned.startsWith('212')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('0')) {
      return '+212' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      return '+212' + cleaned;
    }
    return '+212' + cleaned;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        let closestCity = '';
        let minDistance = Infinity;

        for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
          const distance = Math.sqrt(
            Math.pow(latitude - coords.lat, 2) + Math.pow(longitude - coords.lng, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        }

        if (closestCity) {
          setFormData({ ...formData, location: closestCity });
          setLocationDetected(true);
        } else {
          setError('Impossible de déterminer votre ville');
        }
        setIsDetectingLocation(false);
      },
      (err) => {
        setError('Impossible de détecter votre position. Veuillez sélectionner une ville manuellement.');
        setIsDetectingLocation(false);
      }
    );
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre du produit est obligatoire');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      return false;
    }
    if (formData.price <= 0) {
      setError('Le prix doit être supérieur à 0 DH');
      return false;
    }
    if (!formData.location) {
      setError('La ville est obligatoire');
      return false;
    }
    if (!formData.seller_name.trim()) {
      setError('Votre nom est obligatoire');
      return false;
    }
    if (!formData.seller_whatsapp.trim()) {
      setError('Votre numéro WhatsApp est obligatoire');
      return false;
    }

    const phoneRegex = /^(\+212|0)([ \-_/]*)(\d[ \-_/]*){9}$/;
    if (!phoneRegex.test(formData.seller_whatsapp)) {
      setError('Format de numéro marocain invalide (ex: 0612345678 ou +212612345678)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error('Erreur lors du téléchargement de l\'image');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      const formattedWhatsApp = formatWhatsAppNumber(formData.seller_whatsapp);

      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          ...formData,
          seller_whatsapp: formattedWhatsApp,
          image_url: imageUrl
        });

      if (insertError) {
        throw new Error('Erreur lors de la publication de l\'annonce');
      }

      setFormData({
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
      setImageFile(null);
      setImagePreview(null);

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('form.back')}
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('form.title')}</h2>
          <p className="text-green-600 font-medium">{t('form.free')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Package className="w-4 h-4 text-green-600" />
          {t('form.image')}
        </label>
        <ImageUpload
          onImageSelected={handleImageSelected}
          preview={imagePreview}
          onRemoveImage={handleRemoveImage}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Tag className="w-4 h-4 text-green-600" />
          {t('form.name')} *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: iPhone 11, Canapé, Nike Air Max..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <FileText className="w-4 h-4 text-green-600" />
          {t('form.description')} *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez votre produit en détails..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            {t('form.price')} *
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {t('form.condition')} *
          </label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as ProductCondition })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          >
            {CONDITIONS.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Tag className="w-4 h-4 text-green-600" />
          {t('form.category')} *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          required
        >
          <option value="">Sélectionnez une catégorie</option>
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="w-4 h-4 text-green-600" />
          {t('form.location')} *
        </label>
        <div className="flex gap-2">
          <select
            value={formData.location}
            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setLocationDetected(false); }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Sélectionnez une ville</option>
            {MOROCCAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium whitespace-nowrap"
          >
            {isDetectingLocation ? '...' : locationDetected ? '✓ Détecté' : '📍 Auto'}
          </button>
        </div>
        {locationDetected && (
          <p className="text-xs text-green-600 mt-1">Ville détectée automatiquement</p>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('form.contact')}</h3>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 text-green-600" />
              {t('form.fullname')} *
            </label>
            <input
              type="text"
              value={formData.seller_name}
              onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 text-green-600" />
              {t('form.whatsapp')} *
            </label>
            <input
              type="tel"
              value={formData.seller_whatsapp}
              onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}
              placeholder="0612345678 ou +212612345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('form.whatsappDesc')}
            </p>
          </div>
        </div>
      </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-lg"
        >
          {isSubmitting ? t('form.submit').replace('🚀 ', '') : t('form.submit')}
        </button>

      <p className="text-xs text-center text-gray-500">
        {t('form.disclaimer')}
      </p>
    </form>
  );
}
