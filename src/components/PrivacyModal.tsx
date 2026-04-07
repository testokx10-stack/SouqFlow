import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{t('privacy.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-gray-700 space-y-4">
          <p className="text-gray-600">{t('privacy.intro')}</p>
          
          <h3 className="text-lg font-semibold">{t('privacy.data')}</h3>
          <p className="text-gray-600">{t('privacy.dataText')}</p>
          
          <h3 className="text-lg font-semibold">{t('privacy.usage')}</h3>
          <p className="text-gray-600">{t('privacy.usageText')}</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {t('privacy.usageList', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          
          <h3 className="text-lg font-semibold">{t('privacy.storage')}</h3>
          <p className="text-gray-600">{t('privacy.storageText')}</p>
          
          <h3 className="text-lg font-semibold">{t('privacy.sharing')}</h3>
          <p className="text-gray-600">{t('privacy.sharingText')}</p>
          
          <h3 className="text-lg font-semibold">{t('privacy.rights')}</h3>
          <p className="text-gray-600">{t('privacy.rightsText')}</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {t('privacy.rightsList', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          
          <h3 className="text-lg font-semibold">{t('privacy.cookies')}</h3>
          <p className="text-gray-600">{t('privacy.cookiesText')}</p>
          
          <h3 className="text-lg font-semibold">{t('privacy.contact')}</h3>
          <p className="text-gray-600">{t('privacy.contactText')}</p>
        </div>
      </div>
    </div>
  );
}