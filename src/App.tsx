import { useState } from 'react';
import { Plus, Home, CheckCircle } from 'lucide-react';
import ListingForm from './components/ListingForm';
import ListingsGrid from './components/ListingsGrid';

type View = 'home' | 'create';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleListingSuccess = () => {
    setShowSuccessMessage(true);
    setCurrentView('home');

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">
                🛍️ Souk Morocco
              </h1>
              <p className="text-sm text-gray-600">Acheter et vendre facilement</p>
            </div>

            <button
              onClick={() => setCurrentView(currentView === 'home' ? 'create' : 'home')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
            >
              {currentView === 'home' ? (
                <>
                  <Plus className="w-5 h-5" />
                  Vendre
                </>
              ) : (
                <>
                  <Home className="w-5 h-5" />
                  Annonces
                </>
              )}
            </button>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' ? (
          <ListingsGrid />
        ) : (
          <div className="max-w-2xl mx-auto">
            <ListingForm onSuccess={handleListingSuccess} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="font-semibold mb-2">Souk Morocco - Marketplace marocaine</p>
            <p className="text-sm">Vendez et achetez en toute simplicité</p>
            <p className="text-xs mt-4 text-gray-500">
              © 2026 Souk Morocco. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
