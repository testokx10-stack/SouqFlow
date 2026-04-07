import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing, ProductCategory } from '../types/listing';
import ListingCard from './ListingCard';
import { Package, Search } from 'lucide-react';

const CATEGORIES = [
  { value: 'all' as const, label: 'Toutes' },
  { value: 'electronics' as ProductCategory, label: 'Électronique' },
  { value: 'cars' as ProductCategory, label: 'Véhicules' },
  { value: 'clothes' as ProductCategory, label: 'Vêtements' },
  { value: 'home' as ProductCategory, label: 'Maison' },
  { value: 'sports' as ProductCategory, label: 'Sports' },
  { value: 'books' as ProductCategory, label: 'Livres' },
  { value: 'other' as ProductCategory, label: 'Autre' }
];

export default function ListingsGrid() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = allListings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => 
        listing.category && listing.category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setListings(filtered);
  }, [allListings, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchListings();

    const subscription = supabase
      .channel('listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings'
      }, () => {
        fetchListings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-3"></div>
              <div className="flex gap-4 mb-3">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const showEmptyState = listings.length === 0 && !loading;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Annonces récentes
        </h2>
        <p className="text-gray-600">{showEmptyState ? '0' : listings.length} produit(s) disponible(s)</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          {CATEGORIES.map((category) => (
            <button
              key={String(category.value)}
              type="button"
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {showEmptyState && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune annonce pour le moment
          </h3>
          <p className="text-gray-500">
            {selectedCategory !== 'all' 
              ? 'Aucune annonce dans cette catégorie. Essayez une autre!'
              : 'Soyez le premier à publier une annonce !'}
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Voir toutes les annonces
            </button>
          )}
        </div>
      )}

      {!showEmptyState && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
