import { useState, useEffect } from 'react';
import { Plus, Home, Search, MessageCircle, CheckCircle, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import ListingForm from './components/ListingForm';
import ListingsGrid from './components/ListingsGrid';
import MyListings from './components/MyListings';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';

type View = 'home' | 'create' | 'my-listings';

const CATEGORIES = [
  { id: 'cars', icon: '🚗', label: 'Voitures' },
  { id: 'phones', icon: '📱', label: 'Téléphones' },
  { id: 'electronics', icon: '💻', label: 'Électronique' },
  { id: 'clothes', icon: '👕', label: 'Vêtements' },
  { id: 'home', icon: '🏠', label: 'Maison' },
  { id: 'other', icon: '📦', label: 'Autres' }
];

function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('home');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [stats, setStats] = useState({ listings: 0, users: 0 });
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const fetchStats = async () => {
    try {
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: sellers } = await supabase
        .from('listings')
        .select('seller_whatsapp')
        .eq('status', 'active');

      const uniqueUsers = new Set(sellers?.map(s => s.seller_whatsapp)).size;

      setStats({
        listings: listingsCount || 0,
        users: uniqueUsers || 0
      });

      const { data: locationData } = await supabase
        .from('listings')
        .select('location')
        .eq('status', 'active');
      
      const uniqueCities = Array.from(new Set(locationData?.map(l => l.location).filter(Boolean))).sort();
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleListingSuccess = () => {
    setShowSuccessMessage(true);
    setCurrentView('home');
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  useEffect(() => {
    const handleOpenPrivacy = () => setShowPrivacy(true);
    window.addEventListener('openPrivacy', handleOpenPrivacy);
    return () => window.removeEventListener('openPrivacy', handleOpenPrivacy);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="keywords" content={t('meta.keywords')} />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:image" content="https://yousouq.vercel.app/logo.png" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta property="og:url" content="https://yousouq.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={t('meta.title')} />
        <meta name="twitter:description" content={t('meta.description')} />
        <meta name="twitter:image" content="https://yousouq.vercel.app/logo.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "YouSouq",
            "url": "https://yousouq.vercel.app",
            "description": t('meta.description'),
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://yousouq.vercel.app?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#F5F7FA]">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-shrink-0">
                <img src="/logo.png" alt="YouSouq" className="h-14 w-auto" />
              </div>

                <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => i18n.changeLanguage('fr')}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      i18n.language === 'fr' ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => i18n.changeLanguage('ar')}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      i18n.language === 'ar' ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    AR
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (!sellerPhone) {
                      setShowPhoneModal(true);
                    } else {
                      setCurrentView('my-listings');
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  {t('header.myAds')}
                </button>
                <button
                  onClick={() => setCurrentView(currentView === 'home' ? 'create' : 'home')}
                  className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
                >
                  {currentView === 'home' ? (
                    <>
                      <Plus className="w-4 h-4" />
                      {t('header.sell')}
                    </>
                  ) : (
                    <>
                      <Home className="w-4 h-4" />
                      {t('header.ads')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg flex items-center gap-3 shadow-md animate-fade-in">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold">{t('form.success')}</p>
                <p className="text-sm">{t('form.successDesc')}</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="py-4 px-4 min-h-[60vh] flex items-center justify-center">
              <div className="max-w-4xl mx-auto text-center w-full">
                <img src="/logo.png" alt="YouSouq" className="w-full max-w-2xl h-auto mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {t('hero.title')}
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setCurrentView('create')}
                    className="bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t('hero.ctaPrimary')}
                  </button>
                  <button
                    onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-xl text-lg transition-all border-2 border-gray-300"
                  >
                    {t('hero.ctaSecondary')}
                  </button>
                </div>
              </div>
            </section>

            {/* Trust Signals */}
            <section className="bg-white py-6 px-4 border-b">
              <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{t('trust.free')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{t('trust.noRegister')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{t('trust.whatsapp')}</span>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="py-12 px-4 bg-[#F5F7FA]">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">⚡</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.instant')}</h3>
                    <p className="text-gray-600 text-sm">{t('features.instantDesc')}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.secure')}</h3>
                    <p className="text-gray-600 text-sm">{t('features.secureDesc')}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.community')}</h3>
                    <p className="text-gray-600 text-sm">{t('features.communityDesc')}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">💬</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.fast')}</h3>
                    <p className="text-gray-600 text-sm">{t('features.fastDesc')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Search Bar */}
            <section className="py-8 px-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg bg-white"
                >
                  <option value="all">{t('filter.allCities')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none text-lg shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Categories Grid */}
            <section className="py-4 px-4 mb-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#16A34A] text-white shadow-md'
                          : 'bg-white text-gray-700 hover:shadow-md border border-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-medium">{t(`categories.${cat.id}`)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Bar */}
            <section className="py-6 px-4 bg-white mb-8">
              <div className="max-w-7xl mx-auto flex justify-center gap-12 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#16A34A]">{stats.listings}</div>
                  <div className="text-gray-600 text-sm">{t('stats.listings')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#16A34A]">{stats.users}</div>
                  <div className="text-gray-600 text-sm">{t('stats.sellers')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F97316]">100%</div>
                  <div className="text-gray-600 text-sm">{t('stats.free')}</div>
                </div>
              </div>
            </section>

            {/* Listings */}
            <section id="listings" className="px-4 pb-16">
              <div className="max-w-7xl mx-auto">
                <ListingsGrid searchQuery={searchQuery} selectedCategory={selectedCategory} selectedCity={selectedCity} />
              </div>
            </section>
          </>
        ) : currentView === 'create' ? (
          <main className="max-w-2xl mx-auto px-4 py-8">
            <ListingForm onSuccess={handleListingSuccess} onBack={() => setCurrentView('home')} />
          </main>
        ) : (
          <main className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <Home className="w-5 h-5" />
                {t('header.ads')}
              </button>
              <button onClick={() => setSellerPhone('')} className="text-sm text-gray-500 hover:text-gray-700">
                {t('header.logout')}
              </button>
            </div>
            <MyListings sellerPhone={sellerPhone} />
          </main>
        )}

        {/* Sticky CTA Button */}
        {currentView === 'home' && (
          <button
            onClick={() => setCurrentView('create')}
            className="fixed bottom-6 right-6 bg-[#F97316] hover:bg-orange-600 text-white p-5 rounded-full shadow-lg transition-all z-50 hover:scale-110"
            aria-label={t('header.sell')}
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Footer */}
        <footer className="bg-white border-t mt-8">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p className="font-semibold mb-2">{t('footer.about')}</p>
              <p className="text-sm mb-4">{t('footer.description')}</p>
              <div className="flex justify-center gap-6 text-sm mb-4">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-[#16A34A] underline">{t('footer.privacy')}</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-[#16A34A] underline">{t('footer.terms')}</button>
              </div>
              <p className="text-xs text-gray-400">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </footer>

        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

        {/* Phone Modal for Seller */}
        {showPhoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">{t('header.enterPhone')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('header.enterPhoneDesc')}</p>
              <input
                type="tel"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="06XX XXX XXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4"
              />
              <button
                onClick={() => { 
                  if (sellerPhone) {
                    let cleaned = sellerPhone.replace(/\D/g, '');
                    if (cleaned.startsWith('0')) cleaned = '+212' + cleaned.substring(1);
                    else if (!cleaned.startsWith('+212')) cleaned = '+212' + cleaned;
                    else cleaned = '+' + cleaned;
                    setSellerPhone(cleaned);
                    setShowPhoneModal(false); 
                    setCurrentView('my-listings'); 
                  }
                }}
                className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-medium"
              >
                {t('header.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;