import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { countryTranslations } from '../../../data/countryTranslations';
import type { Country } from '../../../types/types';
import { capitalize } from '../utils/capitalize';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TransmissionControlsProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  selectedCountry: number | null;
  setSelectedCountry: (id: number) => void;
  countries: Country[];
  onFetch: (startDate: string, endDate: string, countryId: number) => void;
  disabled: boolean;
}

const TransmissionControls: React.FC<TransmissionControlsProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedCountry,
  setSelectedCountry,
  countries,
  onFetch,
  disabled
}) => {
  const { t } = useTranslation();
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const minStartDate = addDays(new Date(), 1);
  const minEndDate = startDate ? new Date(startDate) : minStartDate;
  const maxEndDate = startDate ? addDays(new Date(startDate), 89) : undefined;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5" />
          {t('controls.predictionSettings')}
        </CardTitle>
        <CardDescription>
          {t('controls.selectPeriodAndCountry')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contrôles de date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="start-date" className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {t('predictions.startDate')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors",
                    !startDate && "text-muted-foreground",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {startDate ? (
                    format(new Date(startDate), "dd/MM/yyyy", { locale: fr })
                  ) : (
                    <span className="text-muted-foreground">{t('controls.selectStartDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-xl border-2" align="start">
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={handleStartDateSelect}
                  initialFocus
                  locale={fr}
                  className="rounded-md border-0 p-3"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Minimum : {format(minStartDate, 'dd/MM/yyyy', { locale: fr })}
            </p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="end-date" className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {t('predictions.endDate')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 border-2 transition-colors",
                    !endDate && "text-muted-foreground",
                    !startDate 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-primary/50 focus:border-primary',
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={disabled || !startDate}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {endDate ? (
                    format(new Date(endDate), "dd/MM/yyyy", { locale: fr })
                  ) : (
                    <span className="text-muted-foreground">{t('controls.selectEndDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-xl border-2" align="start">
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => {
                    if (minEndDate && date < minEndDate) return true;
                    if (maxEndDate && date > maxEndDate) return true;
                    return false;
                  }}
                  initialFocus
                  locale={fr}
                  className="rounded-md border-0 p-3"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {startDate ? (
                <>{t('predictions.maxEndDate', { date: maxEndDate ? format(maxEndDate, 'dd/MM/yyyy', { locale: fr }) : 'N/A' })}</>
              ) : (
                t('predictions.selectStartDate')
              )}
            </p>
          </div>
        </div>

        {/* Sélection de pays */}
        <div className="space-y-2">
          <Label htmlFor="country-select" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('predictions.country')}
          </Label>
          <Select
            value={selectedCountry?.toString() || ""}
            onValueChange={(value) => setSelectedCountry(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('controls.selectCountryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {countries.map(country => (
                <SelectItem key={country.id_country} value={country.id_country.toString()}>
                  {capitalize(countryTranslations[country.name.toLowerCase()] || country.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton de validation */}
        <div className="pt-4">
          <Button
            onClick={() => selectedCountry && onFetch(startDate, endDate, selectedCountry)}
            disabled={disabled || !selectedCountry || !startDate || !endDate}
            className="w-full"
            size="lg"
          >
            {disabled ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {t('controls.showPredictions')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransmissionControls; 