import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, User, Phone, Package, ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    const consent = (document.getElementById('consent') as HTMLInputElement)?.checked;
    if (!consent) { setError(t('form.consentError')); return false; }
    if (!formData.title.trim()) { setError(t('form.errorTitle')); return false; }
    if (formData.price <= 0) { setError(t('form.errorPrice')); return false; }
    if (!formData.location) { setError(t('form.errorLocation')); return false; }
    if (!formData.seller_name.trim()) { setError(t('form.errorName')); return false; }
    if (!formData.seller_whatsapp.trim()) { setError(t('form.errorWhatsApp')); return false; }
    
    const cleanPhone = formData.seller_whatsapp.replace(/\D/g, '');
    if (cleanPhone.length !== 10 && cleanPhone.length !== 12) {
      setError(t('form.errorPhone'));
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
        if (uploadError) throw new Error(t('form.errorUpload'));
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
      setError(t('form.errorSubmit'));
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
          <h2 className="text-xl font-bold text-gray-800">{t('form.title')}</h2>
          <p className="text-[#16A34A] text-sm font-medium">{t('form.free')}</p>
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
              <span className="text-sm font-medium text-gray-700">{t('form.takePhoto')}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <ImageIcon className="w-8 h-8 text-[#16A34A] mb-2" />
              <span className="text-sm font-medium text-gray-700">{t('form.chooseImage')}</span>
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
          placeholder={t('form.name')}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
          required
        />
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder={t('form.price')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
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
            <option key={cat.value} value={cat.value}>{t(`categories.${cat.value}`)}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder={t('form.description')}
        rows={2}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none resize-none"
      />

      {/* Location */}
      <div>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
          required
        >
          <option value="">{t('form.location')}</option>
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
            placeholder={t('form.fullname')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
            required
          />
        </div>
        <div>
          <input
            type="tel"
            value={formData.seller_whatsapp}
            onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}
            placeholder={t('form.whatsapp')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#16A34A] outline-none"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          required
          className="mt-1 w-5 h-5 text-[#16A34A] border-gray-300 rounded focus:ring-[#16A34A]"
        />
        <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed">
          {t('form.consent')}
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all hover:shadow-xl disabled:bg-gray-400"
      >
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </button>

      <p className="text-xs text-center text-gray-400">
        {t('form.disclaimer')} • <button type="button" onClick={() => window.open('/privacy', '_blank')} className="underline hover:text-gray-600">{t('footer.privacy')}</button>
      </p>
    </form>
  );
}