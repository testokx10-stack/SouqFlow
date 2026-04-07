import { MapPin, MessageCircle, Package } from 'lucide-react';
import type { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
}

const CONDITION_LABELS: Record<string, string> = {
  neuf: 'Neuf',
  tres_bon: 'Très bon état',
  bon: 'Bon état',
  use: 'Usé'
};

export default function ListingCard({ listing }: ListingCardProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par votre produit : ${listing.title}\n\nPrix: ${listing.price} DH`
    );
    const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-MA');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {listing.price} DH
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {listing.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            {CONDITION_LABELS[listing.condition]}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">{listing.seller_name}</p>
            <p>{formatDate(listing.created_at)}</p>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
