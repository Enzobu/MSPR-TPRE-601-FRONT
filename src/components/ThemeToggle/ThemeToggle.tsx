import { Moon, Sun, Monitor } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../contexts/ThemeContext';

import { Button } from '@/components/ui/button';



const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return t('settings.lightMode');
      case 'dark':
        return t('settings.darkMode');
      case 'system':
        return t('settings.systemMode');
      default:
        return t('settings.lightMode');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="relative h-9 w-9 p-0"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">{t('theme.changeTheme')}</span>
    </Button>
  );
};

export default ThemeToggle; 