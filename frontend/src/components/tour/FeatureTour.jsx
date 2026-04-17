import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';

const KEY = 'solocompass-feature-tour-seen';

export default function FeatureTour() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => localStorage.getItem(KEY) !== '1');

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[1200] max-w-xs rounded-xl border border-brand-vibrant/30 bg-base-100 p-4 shadow-xl">
      <p className="text-sm font-black text-base-content mb-1">{t('tour.title')}</p>
      <p className="text-xs text-base-content/70 mb-3">{t('tour.body')}</p>
      <button onClick={dismiss} className="btn btn-sm btn-primary w-full">{t('tour.cta')}</button>
    </div>
  );
}
