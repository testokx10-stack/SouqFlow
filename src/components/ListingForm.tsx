import { useState } from 'react';
import { MapPin, Tag, FileText, DollarSign, User, Phone, Package } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { supabase } from '../lib/supabase';
import type { CreateListingData, ProductCondition } from '../types/listing';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kenitra', 'Tétouan', 'Salé', 'Mohammedia', 'El Jadida', 'Nador'
];

const CONDITIONS = [
  { value: 'neuf' as ProductCondition, label: 'Neuf' },
  { value: 'tres_bon' as ProductCondition, label: 'Très bon état' },
  { value: 'bon' as ProductCondition, label: 'Bon état' },
  { value: 'use' as ProductCondition, label: 'Usé' }
];

interface ListingFormProps {
  onSuccess: () => void;
}

export default function ListingForm({ onSuccess }: ListingFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    price: 0,
    condition: 'bon',
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Publier une annonce</h2>
        <p className="text-green-600 font-medium">100% Gratuit • Vente rapide</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Package className="w-4 h-4 text-green-600" />
          Photo du produit
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
          Titre du produit *
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
          Description *
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
            Prix (DH) *
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
            État *
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
          <MapPin className="w-4 h-4 text-green-600" />
          Ville *
        </label>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          required
        >
          <option value="">Sélectionnez une ville</option>
          {MOROCCAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vos coordonnées</h3>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 text-green-600" />
              Nom complet *
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
              Numéro WhatsApp *
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
              Les acheteurs vous contacteront via WhatsApp
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-lg"
      >
        {isSubmitting ? 'Publication en cours...' : '🚀 Publier mon annonce'}
      </button>

      <p className="text-xs text-center text-gray-500">
        En publiant, vous acceptez que votre annonce soit visible publiquement
      </p>
    </form>
  );
}
