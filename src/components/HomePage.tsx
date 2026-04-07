import { Plus, Users, Zap, Shield, Star } from 'lucide-react';

interface HomePageProps {
  onCreateAd: () => void;
}

export default function HomePage({ onCreateAd }: HomePageProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <button
          onClick={onCreateAd}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-12 rounded-xl text-xl shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          🚀 Vendre maintenant - 100% Gratuit
        </button>
        <p className="mt-4 text-gray-600 font-medium">Rejoignez des milliers d'utilisateurs satisfaits</p>
      </div>

      {/* How it works */}
      <section className="mb-12 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Comment ça marche ?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Publiez votre annonce</h3>
            <p className="text-gray-600">Ajoutez une photo, décrivez votre produit et publiez en 30 secondes</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Les acheteurs vous contactent</h3>
            <p className="text-gray-600">Recevez des messages WhatsApp directement des intéressés</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Vendez rapidement</h3>
            <p className="text-gray-600">Concluez la vente en toute sécurité et simplicité</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Pourquoi choisir YouSouq ?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">100% Gratuit</h3>
            <p className="text-gray-600">Publiez autant d'annonces que vous voulez sans frais</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ultra Rapide</h3>
            <p className="text-gray-600">Votre annonce est visible en quelques secondes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Communauté Active</h3>
            <p className="text-gray-600">Des milliers d'acheteurs et vendeurs au Maroc</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Simple & Sécurisé</h3>
            <p className="text-gray-600">Interface intuitive avec contact direct WhatsApp</p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Catégories populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-2 block">📱</span>
            <p className="font-medium">Électronique</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-2 block">🚗</span>
            <p className="font-medium">Véhicules</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-2 block">👕</span>
            <p className="font-medium">Vêtements</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-2 block">🏠</span>
            <p className="font-medium">Maison</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-12 text-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-4">Prêt à vendre ?</h2>
        <p className="text-xl mb-6 opacity-90">Rejoignez la communauté YouSouq et vendez vos produits d'occasion</p>
        <button
          onClick={onCreateAd}
          className="bg-white text-green-600 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Commencer maintenant 🚀
        </button>
      </section>
    </div>
  );
}