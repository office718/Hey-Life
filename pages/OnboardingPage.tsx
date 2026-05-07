import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, ArrowRight, Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '../App';
import { updateUserData } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-2 h-4" style={style}></div>
);

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<User>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const questions = [
    {
      key: 'points',
      title: t('onboarding.q1.title'),
      subtitle: t('onboarding.q1.subtitle'),
      options: [
          { label: t('onboarding.q1.opt5'), value: 0 },
          { label: t('onboarding.q1.opt1'), value: 500 },
          { label: t('onboarding.q1.opt2'), value: 1000 },
          { label: t('onboarding.q1.opt3'), value: 3000 },
          { label: t('onboarding.q1.opt4'), value: 5000 }
      ],
      multiSelect: false,
    },
    {
      key: 'isHomeChurch',
      title: t('onboarding.q2.title'),
      subtitle: t('onboarding.q2.subtitle'),
      options: [
          { label: t('onboarding.q2.opt1'), value: 'onboarding.q2.opt1' },
          { label: t('onboarding.q2.opt2'), value: 'onboarding.q2.opt2' },
          { label: t('onboarding.q2.opt3'), value: 'onboarding.q2.opt3' },
          { label: t('onboarding.q2.opt4'), value: 'onboarding.q2.opt4' }
      ],
      multiSelect: false,
    },
    {
      key: 'contactSource',
      title: t('onboarding.q3.title'),
      subtitle: t('onboarding.q3.subtitle'),
      options: [
          { label: t('onboarding.q3.opt1'), value: 'onboarding.q3.opt1' },
          { label: t('onboarding.q3.opt2'), value: 'onboarding.q3.opt2' },
          { label: t('onboarding.q3.opt3'), value: 'onboarding.q3.opt3' },
          { label: t('onboarding.q3.opt4'), value: 'onboarding.q3.opt4' },
          { label: t('onboarding.q3.opt5'), value: 'onboarding.q3.opt5' }
      ],
      multiSelect: false,
    },
    {
      key: 'nextSteps',
      title: t('onboarding.q4.title'),
      subtitle: t('onboarding.q4.subtitle'),
      options: [
          { label: t('onboarding.q4.opt1'), value: 'onboarding.q4.opt1' },
          { label: t('onboarding.q4.opt2'), value: 'onboarding.q4.opt2' },
          { label: t('onboarding.q4.opt3'), value: 'onboarding.q4.opt3' },
          { label: t('onboarding.q4.opt4'), value: 'onboarding.q4.opt4' },
          { label: t('onboarding.q4.opt5'), value: 'onboarding.q4.opt5' }
      ],
      multiSelect: true,
    },
     {
      key: 'serviceNeeds',
      title: t('onboarding.q5.title'),
      subtitle: t('onboarding.q5.subtitle'),
      options: [
          { label: t('onboarding.q5.opt1'), value: 'onboarding.q5.opt1' },
          { label: t('onboarding.q5.opt2'), value: 'onboarding.q5.opt2' },
          { label: t('onboarding.q5.opt3'), value: 'onboarding.q5.opt3' },
          { label: t('onboarding.q5.opt4'), value: 'onboarding.q5.opt4' }
      ],
      multiSelect: true,
    },
    {
      key: 'lookingFor',
      title: t('onboarding.q6.title'),
      subtitle: t('onboarding.q6.subtitle'),
      options: [
          { label: t('onboarding.q6.opt1'), value: 'onboarding.q6.opt1' },
          { label: t('onboarding.q6.opt2'), value: 'onboarding.q6.opt2' },
          { label: t('onboarding.q6.opt3'), value: 'onboarding.q6.opt3' },
          { label: t('onboarding.q6.opt4'), value: 'onboarding.q6.opt4' }
      ],
      multiSelect: true,
    },
  ];

  const totalQuestionSteps = questions.length;
  const totalSteps = totalQuestionSteps + 2; 

  const finishOnboarding = async () => {
    if (!user) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
        const finalAnswers = { ...answers, onboarded: true };
        await updateUserData(user.id, finalAnswers);
        // The update will trigger a re-render in App.tsx and navigate away.
    } catch (error) {
        console.error("Failed to save onboarding data:", error);
        setFinishError("Could not save your profile. Please check your connection and try again.");
        setIsFinishing(false);
    }
  };

  useEffect(() => {
    if (step === totalQuestionSteps + 1 && !isFinishing) { 
        const timer = setTimeout(finishOnboarding, 4000);
        return () => clearTimeout(timer);
    }
  }, [step, isFinishing]);


  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSelect = (key: keyof User, value: any) => {
    const currentQuestion = questions[step];
    
    // Special handling for Q1 to set the experience path
    if (currentQuestion.key === 'points') {
      const path = value === 0 ? 'community' : 'faith';
      setAnswers(prev => ({ ...prev, onboardingPath: path, [key]: value }));
      setTimeout(handleNext, 300);
      return;
    }

    if (currentQuestion.multiSelect) {
      const currentSelection = (answers[key as keyof User] as string[] | undefined) || [];
      const newSelection = currentSelection.includes(value)
        ? currentSelection.filter(item => item !== value)
        : [...currentSelection, value];
      setAnswers({ ...answers, [key]: newSelection });
    } else {
      setAnswers({ ...answers, [key]: value });
      setTimeout(handleNext, 300);
    }
  };
  
  const progress = ((step + 1) / totalSteps) * 100;
  const currentQuestion = questions[step];

  return (
    <div 
        className="min-h-screen bg-hey-church-bg text-white flex flex-col p-6 md:p-12 lg:p-16 relative overflow-hidden"
        style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' 
        }}
    >
        {/* Progress Bar */}
        <div className="w-full max-w-4xl mx-auto bg-gray-800 h-2 rounded-full mb-8 md:mb-12 z-10">
            <div 
                className="bg-hey-church-red h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col justify-center z-10 max-w-4xl mx-auto w-full">
            {step < totalQuestionSteps ? (
                // Questions
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6">{currentQuestion.title}</h1>
                    <p className="text-gray-400 text-lg md:text-xl mb-10 md:mb-14 max-w-2xl">{currentQuestion.subtitle}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option: any, idx: number) => {
                            const label = typeof option === 'object' ? option.label : option;
                            const value = typeof option === 'object' ? option.value : option;
                            
                            const isSelected = currentQuestion.multiSelect 
                                ? (answers[currentQuestion.key as keyof User] as any[])?.includes(value)
                                : (answers[currentQuestion.key as keyof User]) === value;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(currentQuestion.key as keyof User, value)}
                                    className={`w-full text-left p-5 md:p-7 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center group min-h-[64px] md:min-h-[80px] ${
                                        isSelected 
                                        ? 'bg-hey-church-red/20 border-hey-church-red' 
                                        : 'bg-gray-800 border-gray-700 hover:border-hey-church-orange-700'
                                    }`}
                                >
                                    <span className="font-bold text-lg md:text-xl">{label}</span>
                                    {isSelected && <div className="bg-hey-church-red rounded-full p-1.5"><ArrowRight size={18} /></div>}
                                </button>
                            );
                        })}
                    </div>
                    {currentQuestion.multiSelect && (
                        <button onClick={handleNext} className="mt-8 w-full bg-white text-hey-church-bg font-black py-4 rounded-xl text-lg uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                             Continue
                        </button>
                    )}
                </div>
            ) : step === totalQuestionSteps ? (
                // Notifications Request Step
                <div className="text-center animate-in fade-in zoom-in duration-500 py-10">
                    <div className="bg-gray-800 inline-block p-8 md:p-12 rounded-full mb-8 shadow-2xl border border-white/5">
                        <Bell size={64} className="text-hey-church-yellow animate-bounce-slow" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tight">{t('onboarding.notifications.title')}</h2>
                    <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-md mx-auto leading-relaxed">{t('onboarding.notifications.subtitle')}</p>
                    
                    <div className="max-w-md mx-auto space-y-4">
                        <button onClick={handleNext} className="w-full bg-hey-church-blue text-white font-black py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
                            {t('onboarding.notifications.allow')}
                        </button>
                        <button onClick={handleNext} className="text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-xs py-3 w-full">
                            {t('onboarding.notifications.later')}
                        </button>
                    </div>
                </div>
            ) : (
                // Celebration Step
                <div className="text-center relative py-12">
                    <h1 className="text-4xl md:text-7xl font-black mb-6 animate-bounce tracking-tighter uppercase italic">
                        {t('onboarding.celebration.title', {name: user?.name || ''})}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium tracking-wide">{t('onboarding.celebration.subtitle')}</p>
                    
                    {finishError && (
                        <div className="bg-red-900/50 p-6 rounded-2xl text-red-100 mb-6 flex items-center justify-center max-w-lg mx-auto border border-red-500/30">
                            <AlertTriangle className="mr-3" size={24}/> {finishError}
                        </div>
                    )}

                    {isFinishing && (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-12 h-12 border-4 border-hey-church-red border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Finalizing Profile</p>
                        </div>
                    )}
                    
                    {/* Confetti */}
                    {Array.from({ length: 50 }).map((_, i) => (
                        <ConfettiPiece 
                            key={i} 
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: ['#F55740', '#FF982B', '#FFFFFF'][i % 3],
                                transform: `rotate(${Math.random() * 360}deg)`,
                                animation: `fall ${2 + Math.random() * 3}s linear infinite`
                            }} 
                        />
                    ))}
                </div>
            )}
        </div>

        {/* Navigation Footer (Back button) */}
        {step > 0 && step < totalSteps - 1 && (
            <div className="mt-8 flex justify-center z-10">
                <button onClick={handleBack} className="text-gray-500 hover:text-white flex items-center transition-colors">
                    <ArrowLeft size={18} className="mr-2"/> Back
                </button>
            </div>
        )}
    </div>
  );
};

export default OnboardingPage;