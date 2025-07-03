import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useVoiceControl from '../../hooks/useVoiceControl';

interface VoiceControlButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({
  className,
  position = 'bottom-right'
}) => {
  const [showStatus, setShowStatus] = useState(false);
  
  const {
    isListening,
    isSupported,
    transcript,
    toggleListening,
    lastCommand,
    error
  } = useVoiceControl();

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {showStatus && (isListening || lastCommand || error) && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
          {isListening && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Écoute en cours...</span>
            </div>
          )}
          
          {transcript && (
            <div className="mt-2 text-gray-600 dark:text-gray-300">
              <span className="font-medium">Vous avez dit:</span> "{transcript}"
            </div>
          )}
          
          {lastCommand && (
            <div className="mt-2 text-green-600 dark:text-green-400">
              <span className="font-medium">Dernière commande:</span> {lastCommand}
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400">
              <span className="font-medium">Erreur:</span> {error}
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => {
          toggleListening();
          setShowStatus(true);
          setTimeout(() => setShowStatus(false), 5000);
        }}
        size="lg"
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg transition-all duration-200",
          isListening
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-primary hover:bg-primary/90",
          "hover:scale-110"
        )}
        title="Contrôle vocal - Cliquez pour parler"
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
        
        {isListening && (
          <div className="absolute -inset-1 rounded-full bg-red-500/20 animate-ping" />
        )}
        
        {!isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </Button>
    </div>
  );
};

export default VoiceControlButton; 