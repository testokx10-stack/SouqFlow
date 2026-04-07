import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{t('terms.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-gray-700">
          <h3 className="text-lg font-semibold mb-4">{t('terms.acceptance')}</h3>
          <p className="mb-4">
            {t('terms.acceptanceText')}
          </p>
          <h3 className="text-lg font-semibold mb-4">{t('terms.service')}</h3>
          <p className="mb-4">
            {t('terms.serviceText')}
          </p>
          <h3 className="text-lg font-semibold mb-4">{t('terms.responsibilities')}</h3>
          <p className="mb-4">
            {t('terms.responsibilitiesText')}
          </p>
          <ul className="list-disc list-inside mb-4">
            {t('terms.responsibilitiesPoints', { returnObjects: true }).map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mb-4">{t('terms.liability')}</h3>
          <p className="mb-4">
            {t('terms.liabilityText')}
          </p>
          <h3 className="text-lg font-semibold mb-4">{t('terms.modification')}</h3>
          <p className="mb-4">
            {t('terms.modificationText')}
          </p>
          <h3 className="text-lg font-semibold mb-4">{t('terms.law')}</h3>
          <p>
            {t('terms.lawText')}
          </p>
        </div>
      </div>
    </div>
  );
}