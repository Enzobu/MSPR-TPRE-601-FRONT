import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommand {
  command: string;
  patterns: string[];
  action: () => void;
  description: string;
}

interface UseVoiceControlProps {
  onDateSelect?: (type: 'start' | 'end', date: string) => void;
  onCountrySelect?: (countryName: string) => void;
  onFetchPredictions?: () => void;
  countries?: Array<{ id_country: number; name: string }>;
}

interface UseVoiceControlReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  availableCommands: VoiceCommand[];
  lastCommand: string | null;
  error: string | null;
}

export const useVoiceControl = (props: UseVoiceControlProps = {}): UseVoiceControlReturn => {
  const { onDateSelect, onCountrySelect, onFetchPredictions, countries = [] } = props;
  const navigate = useNavigate();
  
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.maxAlternatives = 3;
      
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur');
    }
  }, []);

  const parseFrenchDate = (text: string): string | null => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (text.includes('aujourd\'hui')) {
      return today.toISOString().split('T')[0];
    }
    if (text.includes('demain')) {
      return tomorrow.toISOString().split('T')[0];
    }
    
    const dateMatch = text.match(/(\d{1,2})[\s/](\d{1,2})[\s/](\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    const relativeDateMatch = text.match(/dans (\d+) jours?/);
    if (relativeDateMatch) {
      const days = parseInt(relativeDateMatch[1]);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);
      return futureDate.toISOString().split('T')[0];
    }
    
    return null;
  };

  const findCountryByName = (spokenName: string): number | null => {
    const normalizedSpoken = spokenName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const country of countries) {
      const normalizedCountry = country.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedCountry.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedCountry)) {
        return country.id_country;
      }
    }
    return null;
  };

  const availableCommands: VoiceCommand[] = [
    {
      command: 'navigation.home',
      patterns: ['accueil', 'aller à l\'accueil', 'page d\'accueil', 'retour accueil'],
      action: () => navigate('/'),
      description: 'Aller à la page d\'accueil'
    },
    {
      command: 'navigation.predictions',
      patterns: ['prédictions', 'aller aux prédictions', 'page prédictions', 'prédire'],
      action: () => navigate('/predictions'),
      description: 'Aller à la page des prédictions'
    },
    {
      command: 'prediction.fetch',
      patterns: ['afficher les prédictions', 'lancer les prédictions', 'calculer', 'prédire maintenant'],
      action: () => onFetchPredictions?.(),
      description: 'Lancer les prédictions'
    }
  ];

  const processVoiceCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    setTranscript(lowerText);
    
    for (const command of availableCommands) {
      for (const pattern of command.patterns) {
        if (lowerText.includes(pattern)) {
          setLastCommand(command.description);
          command.action();
          return;
        }
      }
    }
    
    if (lowerText.includes('date de début') || lowerText.includes('date début')) {
      const dateAfterKeyword = lowerText.split(/date de début|date début/)[1];
      const date = parseFrenchDate(dateAfterKeyword);
      if (date && onDateSelect) {
        onDateSelect('start', date);
        setLastCommand(`Date de début définie : ${date}`);
        return;
      }
    }
    
    if (lowerText.includes('date de fin') || lowerText.includes('date fin')) {
      const dateAfterKeyword = lowerText.split(/date de fin|date fin/)[1];
      const date = parseFrenchDate(dateAfterKeyword);
      if (date && onDateSelect) {
        onDateSelect('end', date);
        setLastCommand(`Date de fin définie : ${date}`);
        return;
      }
    }
    
    if (lowerText.includes('pays') || lowerText.includes('sélectionner')) {
      const countryId = findCountryByName(lowerText);
      if (countryId && onCountrySelect) {
        const country = countries.find(c => c.id_country === countryId);
        if (country) {
          onCountrySelect(country.name);
          setLastCommand(`Pays sélectionné : ${country.name}`);
          return;
        }
      }
    }
    
    setLastCommand('Commande non reconnue');
  }, [navigate, onDateSelect, onCountrySelect, onFetchPredictions, countries, availableCommands]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    setError(null);
    setIsListening(true);
    
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence;
      
      setTranscript(transcript);
      setConfidence(confidence);
      
      if (event.results[current].isFinal && confidence > 0.7) {
        processVoiceCommand(transcript);
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      setError(`Erreur de reconnaissance vocale: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionRef.current.start();
      
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    } catch {
      setError('Impossible de démarrer la reconnaissance vocale');
      setIsListening(false);
    }
  }, [isSupported, processVoiceCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    startListening,
    stopListening,
    toggleListening,
    availableCommands,
    lastCommand,
    error
  };
};

export default useVoiceControl; 