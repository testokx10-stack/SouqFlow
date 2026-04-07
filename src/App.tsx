import { useState, useEffect } from 'react';
import { Plus, Home, CheckCircle, MessageCircle, Zap, Shield, Users, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import ListingForm from './components/ListingForm';
import ListingsGrid from './components/ListingsGrid';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';

type View = 'home' | 'create';

function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('home');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [stats, setStats] = useState({ listings: 0, users: 0 });

  const fetchStats = async () => {
    try {
      // Fetch active listings count
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch unique users (sellers)
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
    const interval = setInterval(fetchStats, 60000); // Update every 1 minute
    return () => clearInterval(interval);
  }, []);

  const handleListingSuccess = () => {
    setShowSuccessMessage(true);
    setCurrentView('home');

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <>
      <Helmet>
        <title>Acheter & Vendre Used Items Maroc | YouSouq</title>
        <meta name="description" content="Vendez vos produits d'occasion facilement au Maroc. Postez des annonces avec contact WhatsApp en secondes." />
        <meta name="keywords" content="marketplace Maroc, vendre occasion Maroc, souq maroc, occasion maroc" />
        <meta property="og:title" content="Acheter & Vendre Used Items Maroc | YouSouq" />
        <meta property="og:description" content="Vendez vos produits d'occasion facilement au Maroc. Postez des annonces avec contact WhatsApp en secondes." />
        <meta property="og:image" content="https://yousouq.vercel.app/og-image.jpg" />
        <meta property="og:url" content="https://yousouq.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Acheter & Vendre Used Items Maroc | YouSouq" />
        <meta name="twitter:description" content="Vendez vos produits d'occasion facilement au Maroc. Postez des annonces avec contact WhatsApp en secondes." />
        <meta name="twitter:image" content="https://yousouq.vercel.app/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "YouSouq",
            "url": "https://yousouq.vercel.app",
            "description": "Marketplace marocaine pour acheter et vendre des produits d'occasion",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://yousouq.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <img src="/logo.png" alt="YouSouq" className="h-12 w-auto" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button
                  onClick={() => i18n.changeLanguage('fr')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    i18n.language === 'fr' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    i18n.language === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => i18n.changeLanguage('ar')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    i18n.language === 'ar' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  AR
                </button>
              </div>
              <button
                onClick={() => setCurrentView(currentView === 'home' ? 'create' : 'home')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
              >
                {currentView === 'home' ? (
                  <>
                    <Plus className="w-5 h-5" />
                    {t('header.sell')}
                  </>
                ) : (
                  <>
                    <Home className="w-5 h-5" />
                    {t('header.ads')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg flex items-center gap-3 shadow-md animate-fade-in">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold">Annonce publiée avec succès !</p>
              <p className="text-sm">Votre produit est maintenant visible par tous les acheteurs.</p>
            </div>
          </div>
        </div>
      )}

      {currentView === 'home' && (
        <section
          className="text-white py-32 relative"
          style={{
            backgroundImage: 'url(/logo.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="text-center mb-8">
            <button
              onClick={() => setCurrentView('create')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-5 px-10 rounded-xl text-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 animate-pulse"
            >
              🚀 {t('hero.button')}
            </button>
          </div>
        )}

        {currentView === 'home' && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('features.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('features.instant')}</h3>
                <p className="text-gray-600">{t('features.instantDesc')}</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('features.secure')}</h3>
                <p className="text-gray-600">{t('features.secureDesc')}</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('features.community')}</h3>
                <p className="text-gray-600">{t('features.communityDesc')}</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('features.fast')}</h3>
                <p className="text-gray-600">{t('features.fastDesc')}</p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('stats.title')}</h3>
              <p className="text-gray-600 mb-6">{t('stats.subtitle')}</p>
              <div className="flex justify-center gap-8 text-sm text-gray-500">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.listings}</div>
                  <div>{t('stats.listings')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.users}</div>
                  <div>{t('stats.users')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div>{t('stats.free')}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {currentView === 'home' ? (
          <ListingsGrid />
        ) : (
          <div className="max-w-2xl mx-auto">
            <ListingForm onSuccess={handleListingSuccess} onBack={() => setCurrentView('home')} />
          </div>
        )}
      </main>

      {/* Sticky Post Button */}
      {currentView === 'home' && (
        <button
          onClick={() => setCurrentView('create')}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
          aria-label="Post ad"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/212600000000" // Replace with actual number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        aria-label="Contact WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="font-semibold mb-2">{t('footer.about')}</p>
            <p className="text-sm">{t('footer.description')}</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-green-600 underline">{t('footer.privacy')}</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-green-600 underline">{t('footer.terms')}</button>
            </div>
            <p className="text-xs mt-4 text-gray-500">
              {t('footer.copyright')}
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
