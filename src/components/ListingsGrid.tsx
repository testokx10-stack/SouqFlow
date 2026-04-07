import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { Listing } from '../types/listing';
import ListingCard from './ListingCard';
import { Package } from 'lucide-react';

interface ListingsGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedCity?: string;
}

export default function ListingsGrid({ searchQuery = '', selectedCategory = 'all', selectedCity = 'all' }: ListingsGridProps) {
  const { t } = useTranslation();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

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

    if (selectedCategory && selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        'cars': 'cars',
        'phones': 'phones',
        'electronics': 'electronics',
        'clothes': 'clothes',
        'home': 'home',
        'other': 'other'
      };
      const dbCategory = categoryMap[selectedCategory] || selectedCategory;
      filtered = filtered.filter(listing => 
        listing.category && listing.category === dbCategory
      );
    }

    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(listing => listing.location === selectedCity);
    }

    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setListings(filtered);
  }, [allListings, selectedCategory, selectedCity, searchQuery]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const showEmptyState = listings.length === 0 && !loading;

  return (
    <div>
      {!showEmptyState && (
        <p className="text-gray-600 mb-4">{listings.length} {t('listings.products')}</p>
      )}

      {showEmptyState ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery || selectedCategory !== 'all' ? t('listings.noResults') : t('listings.empty')}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'all' ? t('listings.noResultsDesc') : t('listings.emptyDesc')}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-2 bg-[#16A34A] text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {t('hero.ctaPrimary')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}