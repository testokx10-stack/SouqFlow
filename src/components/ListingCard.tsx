import { useTranslation } from 'react-i18next';
import { MapPin, MessageCircle, Package } from 'lucide-react';
import type { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par votre produit : ${listing.title}\n\nPrix: ${listing.price} DH`
    );
    const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const categoryLabel = listing.category ? t(`categories.${listing.category}`) : t('categories.other');

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative h-44 bg-gray-100">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#F97316] text-white px-3 py-1 rounded-full text-sm font-bold">
          {listing.price} DH
        </div>
        {listing.location && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
          {listing.title}
        </h3>
        
        {listing.category && (
          <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-2">
            {categoryLabel}
          </span>
        )}

        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-[#16A34A] hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          {t('card.whatsapp')}
        </button>
      </div>
    </div>
  );
}