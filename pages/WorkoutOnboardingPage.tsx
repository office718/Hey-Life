
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Calendar, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import { updateUserData } from '../services/firebaseService';

const equipmentOptions = [
    'Bodyweight only', 'Dumbbells', 'Barbell & Plates', 'Kettlebells', 
    'Resistance Bands', 'Pull-up Bar', 'Full Gym', 'CrossFit Gym'
];

const inspirationTexts = [
    "Your only limit is you.",
    "Consistency is the key to mastery.",
    "Train your body, honor your soul.",
    "Small steps, every day, lead to big results.",
];

const WorkoutOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [inspiration, setInspiration] = useState(inspirationTexts[0]);
  
  const [answers, setAnswers] = useState({
    goal: 'Build Strength',
    experience: 'Beginner',
    frequency: 3,
    duration: 12, // Default duration in weeks
    age: user?.age || 30,
    height: user?.height || 180,
    weight: user?.weight || 80,
    equipment: [] as string[],
    oneRepMax: { squat: 0, deadlift: 0, bench: 0 },
    injuries: '',
  });

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setInspiration(prev => {
          const idx = (inspirationTexts.indexOf(prev) + 1) % inspirationTexts.length;
          return inspirationTexts[idx];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const steps = [
    { key: 'goal', title: 'Your Goal?' },
    { key: 'experience', title: 'Experience Level?' },
    { key: 'frequency', title: 'Days Per Week?' },
    { key: 'duration', title: 'Plan Duration?' }, // NEW STEP
    { key: 'biometrics', title: 'Personal Details' },
    { key: 'equipment', title: 'Available Gear?' },
    { key: 'oneRepMax', title: 'Estimated 1RM' },
    { key: 'injuries', title: 'Health Safety' },
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleGeneratePlan = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const plan = await generateWorkoutPlan(answers);
        await updateUserData(user.id, {
            workoutPlan: plan, 
            ...answers,
            workoutPlanStartDate: new Date().toISOString()
        });
        navigate('/workout-plan');
    } catch (error) {
        alert("Coach is offline. Try again later.");
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
      return (
         <div className="min-h-screen bg-hey-church-bg flex flex-col items-center justify-center p-8 text-center">
            <Sparkles size={64} className="text-hey-church-yellow animate-pulse mb-6"/>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">AI Coach Building Plan...</h2>
            <p className="mt-4 text-gray-400 max-w-xs font-medium">Analyzing biometrics and periodizing your {answers.duration}-week schedule.</p>
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-hey-church-orange-400">
                "{inspiration}"
            </div>
        </div>
      )
  }

  const renderContent = () => {
    const current = steps[step];
    switch(current.key) {
        case 'goal': return (
            <div className="grid gap-3">
                {['Build Strength', 'Build Muscle', 'Weight Loss', 'Longevity'].map(o => (
                    <button key={o} onClick={() => {setAnswers({...answers, goal: o}); handleNext()}} className={`p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all ${answers.goal === o ? 'border-hey-church-red bg-hey-church-red/20' : 'border-gray-700 bg-gray-800'}`}>{o}</button>
                ))}
            </div>
        );
        case 'frequency': return (
            <div className="grid gap-3">
                {[2, 3, 4, 5, 6].map(num => (
                    <button key={num} onClick={() => {setAnswers({...answers, frequency: num}); handleNext()}} className={`p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all ${answers.frequency === num ? 'border-hey-church-red bg-hey-church-red/20' : 'border-gray-700 bg-gray-800'}`}>{num} Days Per Week</button>
                ))}
            </div>
        );
        case 'duration': return (
            <div className="grid gap-4">
                <p className="text-gray-400 mb-2">How long should your transformation journey last?</p>
                {[4, 8, 12].map(weeks => (
                    <button key={weeks} onClick={() => {setAnswers({...answers, duration: weeks}); handleNext()}} className={`p-6 rounded-3xl border-2 text-left transition-all ${answers.duration === weeks ? 'border-hey-church-green bg-hey-church-green/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-gray-700 bg-gray-800'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-2xl font-black text-white">{weeks} WEEKS</span>
                                <span className="text-sm font-bold text-gray-500 uppercase">{weeks === 12 ? 'Full Transformation' : 'Focused Growth'}</span>
                            </div>
                            <Calendar className={answers.duration === weeks ? 'text-hey-church-green' : 'text-gray-600'} />
                        </div>
                    </button>
                ))}
            </div>
        );
        case 'biometrics': return (
            <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                    <label className="text-xs font-black text-gray-500 uppercase">Weight (kg)</label>
                    <input type="number" value={answers.weight} onChange={e => setAnswers({...answers, weight: +e.target.value})} className="w-full bg-transparent text-2xl font-bold mt-1 outline-none text-white"/>
                </div>
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                    <label className="text-xs font-black text-gray-500 uppercase">Height (cm)</label>
                    <input type="number" value={answers.height} onChange={e => setAnswers({...answers, height: +e.target.value})} className="w-full bg-transparent text-2xl font-bold mt-1 outline-none text-white"/>
                </div>
            </div>
        );
        default: return <p className="text-gray-500">Processing detailed data...</p>;
    }
  }

  return (
    <div className="min-h-screen bg-hey-church-bg text-white p-6 flex flex-col justify-between">
        <div className="max-w-md mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <button onClick={handleBack} className="text-gray-500 hover:text-white p-2"><ArrowLeft /></button>
                <div className="flex-grow mx-4 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-hey-church-red h-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                </div>
                <span className="text-xs font-black text-gray-500">{step + 1}/{steps.length}</span>
            </div>
            
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none">{steps[step].title}</h1>
            {renderContent()}
        </div>

        <div className="max-w-md mx-auto w-full mt-8">
            {step === steps.length - 1 ? (
                <button onClick={handleGeneratePlan} className="w-full bg-hey-church-red py-5 rounded-3xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">GENERATE PLAN</button>
            ) : (
                <button onClick={handleNext} className="w-full bg-white text-black py-5 rounded-3xl font-black text-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all">NEXT <ChevronRight size={24} className="ml-1"/></button>
            )}
        </div>
    </div>
  );
};

export default WorkoutOnboardingPage;
