import { Mic, MicOff, Volume2, HelpCircle, X, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import useVoiceControl from '../../hooks/useVoiceControl';
import type { Country } from '../../types/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


interface VoiceControlProps {
  onDateSelect?: (type: 'start' | 'end', date: string) => void;
  onCountrySelect?: (countryName: string) => void;
  onFetchPredictions?: () => void;
  countries?: Country[];
  className?: string;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  onDateSelect,
  onCountrySelect,
  onFetchPredictions,
  countries = [],
  className
}) => {
  const [showHelp, setShowHelp] = useState(false);
  
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    toggleListening,
    lastCommand,
    error
  } = useVoiceControl({
    onDateSelect,
    onCountrySelect,
    onFetchPredictions,
    countries
  });

  if (!isSupported) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Contrôle vocal non supporté</h3>
            <p className="text-sm text-muted-foreground">
              Votre navigateur ne supporte pas la reconnaissance vocale.
              Veuillez utiliser Chrome, Edge ou Safari.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Contrôles principaux */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Contrôle vocal
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              Aide
            </Button>
          </CardTitle>
          <CardDescription>
            Utilisez votre voix pour naviguer et contrôler les prédictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Button
              onClick={toggleListening}
              size="lg"
              className={cn(
                "relative h-16 w-16 rounded-full transition-all duration-200",
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
              {isListening && (
                <div className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping" />
              )}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Badge variant={isListening ? "destructive" : "secondary"}>
              {isListening ? "Écoute en cours..." : "Appuyez pour parler"}
            </Badge>
            
            {confidence > 0 && (
              <Badge variant="outline" className="text-xs">
                Confiance: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>

          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Vous avez dit :</p>
              <p className="text-sm italic">"{transcript}"</p>
            </div>
          )}

          {lastCommand && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{lastCommand}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showHelp && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              Commandes disponibles
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Navigation
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Accueil" ou "Page d'accueil"</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Prédictions" ou "Aller aux prédictions"</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Prédictions
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Date de début demain" ou "Date de début 15/12/2024"</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Date de fin dans 30 jours"</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Pays France" ou "Sélectionner Allemagne"</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">Dire</Badge>
                  <span className="text-sm">"Afficher les prédictions" ou "Calculer"</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Conseils
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Parlez clairement et à un rythme normal</p>
                <p>• Attendez le signal sonore avant de parler</p>
                <p>• Les commandes sont reconnues en français</p>
                <p>• L'écoute s'arrête automatiquement après 30 secondes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceControl; 