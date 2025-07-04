import { useTranslation } from 'react-i18next';

import LanguageSelector from '../LanguageSelector/LanguageSelector';

import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('settings.title')}</h2>

      <form className="space-y-6">
        <LanguageSelector />

        <div className="flex items-center justify-between">
          <label htmlFor="notifications" className="font-medium">
            {t('settings.notifications')} :
          </label>
          <Switch id="notifications" />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="darkTheme" className="font-medium">
            {t('common.dark')} :
          </label>
          <Switch id="darkTheme" />
        </div>

        <button
          type="button"
          aria-label={t('settings.saveSettings')}
          className="w-full py-2 px-4 rounded-lg border border-gray-400 hover:bg-gray-100 transition"
        >
          {t('settings.saveSettings')}
        </button>
      </form>
    </div>
  );
};

export default Settings;
