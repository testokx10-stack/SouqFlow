import { useState, useEffect } from 'react';
import { Plus, Home, Search, MessageCircle, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import ListingForm from './components/ListingForm';
import ListingsGrid from './components/ListingsGrid';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';

type View = 'home' | 'create';

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
  const [stats, setStats] = useState({ listings: 0, users: 0 });

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

  return (
    <>
      <Helmet>
        <title>Acheter et vendre au Maroc | YouSouq</title>
        <meta name="description" content="Vendez vos produits d'occasion au Maroc. Publiez en quelques secondes avec WhatsApp. 100% gratuit, sans inscription." />
        <meta name="keywords" content="vendre occasion maroc, marketplace maroc, souq maroc, achat vente maroc, avito maroc" />
        <meta property="og:title" content="Acheter et vendre au Maroc | YouSouq" />
        <meta property="og:description" content="Vendez vos produits d'occasion au Maroc. Publiez en quelques secondes avec WhatsApp." />
        <meta property="og:image" content="https://yousouq.vercel.app/og-image.jpg" />
        <meta property="og:url" content="https://yousouq.vercel.app" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "YouSouq",
            "url": "https://yousouq.vercel.app",
            "description": "Marketplace pour vendre et acheter des produits d'occasion au Maroc",
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
                <img src="/logo.png" alt="YouSouq" className="h-10 w-auto" />
              </div>

              <div className="flex items-center gap-3">
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
                <p className="font-bold">Annonce publiée avec succès !</p>
                <p className="text-sm">Votre produit est maintenant visible par tous les acheteurs.</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#16A34A] to-green-700 py-16 px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Vendez et achetez facilement au Maroc 🇲🇦
                </h1>
                <p className="text-lg text-green-100 mb-8">
                  Publiez votre annonce en moins de 30 secondes. Sans compte. 100% gratuit.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setCurrentView('create')}
                    className="bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    + Publier une annonce
                  </button>
                  <button
                    onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all border-2 border-white"
                  >
                    Voir les annonces
                  </button>
                </div>
              </div>
            </section>

            {/* Trust Signals */}
            <section className="bg-white py-6 px-4 border-b">
              <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">100% gratuit</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Sans inscription</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Contact direct via WhatsApp</span>
                </div>
              </div>
            </section>

            {/* Search Bar */}
            <section className="py-8 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Que cherchez-vous ? (voiture, iPhone, vêtements...)"
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
                      <div className="text-sm font-medium">{cat.label}</div>
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
                  <div className="text-gray-600 text-sm">Annonces actives</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#16A34A]">{stats.users}</div>
                  <div className="text-gray-600 text-sm">Vendeurs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F97316]">100%</div>
                  <div className="text-gray-600 text-sm">Gratuit</div>
                </div>
              </div>
            </section>

            {/* Listings */}
            <section id="listings" className="px-4 pb-16">
              <div className="max-w-7xl mx-auto">
                <ListingsGrid searchQuery={searchQuery} selectedCategory={selectedCategory} />
              </div>
            </section>
          </>
        ) : (
          <main className="max-w-2xl mx-auto px-4 py-8">
            <ListingForm onSuccess={handleListingSuccess} onBack={() => setCurrentView('home')} />
          </main>
        )}

        {/* Sticky CTA Button */}
        {currentView === 'home' && (
          <button
            onClick={() => setCurrentView('create')}
            className="fixed bottom-6 right-6 bg-[#F97316] hover:bg-orange-600 text-white p-5 rounded-full shadow-lg transition-all z-50 hover:scale-110"
            aria-label="Publier une annonce"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Footer */}
        <footer className="bg-white border-t mt-8">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p className="font-semibold mb-2">YouSouq - Marketplace Maroc</p>
              <p className="text-sm mb-4">Vendez et achetez facilement au Maroc</p>
              <div className="flex justify-center gap-6 text-sm mb-4">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-[#16A34A] underline">Politique de confidentialité</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-[#16A34A] underline">Conditions d'utilisation</button>
              </div>
              <p className="text-xs text-gray-400">
                © 2024 YouSouq. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>

        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      </div>
    </>
  );
}

export default App;