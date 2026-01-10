
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { updateUserData } from '../services/firebaseService';
import { generateAssessmentFeedback } from '../services/geminiService';
import { 
    ArrowLeft, ArrowRight, CheckCircle, Trophy, 
    Sparkles, Heart, Activity, Gift, Users, Star, 
    Flame, Loader2, Share2, Compass, Zap, Map as MapIcon, HelpCircle,
    BookOpen, UserPlus, ExternalLink
} from 'lucide-react';
import { AssessmentResult } from '../types';
import { GuidedPrayerModal } from '../components/GuidedPrayerModal';
import InviteFriendModal from '../components/InviteFriendModal';

interface Question {
    text: string;
    category: string;
    isPercentage?: boolean;
}

const CATEGORIES = [
    { 
        id: 'daily_walk', 
        label: 'Daily Walk', 
        icon: Flame, 
        color: '#3B82F6', 
        nextStepTitle: 'Build Spiritual Rhythms',
        nextStepDesc: 'Start with today\'s Spirit Snack or dive into the Word.',
        actionLabel: 'OPEN SPIRIT SNACK',
        internalAction: 'spirit_snack'
    },
    { 
        id: 'relationships', 
        label: 'Relationships', 
        icon: Users, 
        color: '#8B5CF6', 
        nextStepTitle: 'Find your People',
        nextStepDesc: 'Faith is better together. Discover our Hey Fams.',
        actionLabel: 'EXPLORE HEY FAMS',
        externalUrl: 'https://heychurch.de/fams'
    },
    { 
        id: 'serve', 
        label: 'Serve Others', 
        icon: Heart, 
        color: '#10B981', 
        nextStepTitle: 'Become a Hero',
        nextStepDesc: 'Use your unique gifts to serve others.',
        actionLabel: 'CHOOSE A MINISTRY',
        externalUrl: 'https://heychurch.de/hero'
    },
    { 
        id: 'mission', 
        label: 'Make God Known', 
        icon: Zap, 
        color: '#FBBF24', 
        nextStepTitle: 'Share the Hope',
        nextStepDesc: 'Invite a friend to experience the App with you.',
        actionLabel: 'INVITE A FRIEND',
        internalAction: 'invite'
    },
    { 
        id: 'generosity', 
        label: 'Generosity', 
        icon: Gift, 
        color: '#FF755D', 
        nextStepTitle: 'Live Open-Handed',
        nextStepDesc: 'Master your budget or start your giving plan.',
        actionLabel: 'GIVING PLAN',
        externalUrl: 'https://heychurch.de/generosity'
    }
];

const QUESTIONS: Question[] = [
    // Daily Walk
    { category: 'daily_walk', text: 'The finished work of Christ (grace, forgiveness, new identity) inspires my daily life.' },
    { category: 'daily_walk', text: 'I consciously start or end my day with God (prayer, Bible, silence).' },
    { category: 'daily_walk', text: 'My trust in God is stronger than performance, pressure, or guilt.' },
    { category: 'daily_walk', text: "God's Word shapes my decisions in everyday life." },
    { category: 'daily_walk', text: 'I expect God to speak to me and lead me today.' },
    { category: 'daily_walk', text: 'My faith gives me hope, peace, and direction in everyday life.' },
    // Relationships
    { category: 'relationships', text: 'I have at least one person who is allowed to speak honestly into my life.' },
    { category: 'relationships', text: 'I consciously learn from someone who is further along spiritually than I am.' },
    { category: 'relationships', text: 'I am part of a Small Group or a committed community.' },
    { category: 'relationships', text: 'I openly share my challenges, doubts, and victories.' },
    { category: 'relationships', text: 'I pray regularly with or for others.' },
    { category: 'relationships', text: 'I experience spiritual growth through relationships.' },
    // Serve
    { category: 'serve', text: 'I am willing to sacrifice time and energy to serve others.' },
    { category: 'serve', text: "I serve not only when it's convenient, but even when it costs me something." },
    { category: 'serve', text: 'I see my service as an expression of my love for God.' },
    { category: 'serve', text: 'I actively use my gifts in the church or for others.' },
    { category: 'serve', text: 'I take responsibility for people, not just for tasks.' },
    { category: 'serve', text: 'My service helps others to get closer to Jesus.' },
    // Mission
    { category: 'mission', text: 'I have a VIP (a person on the way to God) for whom I pray.' },
    { category: 'mission', text: 'I meet regularly with this VIP to be a friend and companion.' },
    { category: 'mission', text: 'My life makes people curious about my faith.' },
    { category: 'mission', text: 'I speak naturally and honestly about my faith when opportunities arise.' },
    { category: 'mission', text: 'I consciously invite people into my life or into the church.' },
    { category: 'mission', text: 'I see myself as part of God\'s mission in everyday life.' },
    // Generosity
    { category: 'generosity', text: 'I prioritize giving 10% of my income to support the mission of the church.', isPercentage: true },
    { category: 'generosity', text: 'I consciously invest time to strengthen people in my church family.' },
    { category: 'generosity', text: 'I trust God with my finances - even in uncertainty.' },
    { category: 'generosity', text: 'I have a written budget that reflects my values.' },
    { category: 'generosity', text: 'Generosity is a lifestyle for me, not just an action.' },
    { category: 'generosity', text: 'I experience joy and freedom in giving.' }
];

const RadarChart: React.FC<{ scores: { [key: string]: number } }> = ({ scores }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    
    const points = CATEGORIES.map((cat, i) => {
        const score = scores[cat.id] || 0;
        const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
        const r = (score / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const grids = [0.2, 0.4, 0.6, 0.8, 1].map(factor => (
        <polygon 
            key={factor}
            points={CATEGORIES.map((_, i) => {
                const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
                const r = radius * factor;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ')}
            className="fill-none stroke-gray-700 stroke-1"
        />
    ));

    const axes = CATEGORIES.map((cat, i) => {
        const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} className="stroke-gray-700 stroke-1" />;
    });

    return (
        <svg width={size} height={size} className="mx-auto overflow-visible drop-shadow-2xl">
            {grids}
            {axes}
            <polygon 
                points={points} 
                className="fill-hey-church-orange-500/50 stroke-hey-church-orange-500 stroke-2 transition-all duration-700"
            />
            {CATEGORIES.map((cat, i) => {
                const score = scores[cat.id] || 0;
                const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
                const r = (score / 10) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="4" fill={cat.color} className="transition-all duration-700" />;
            })}
        </svg>
    );
};

const AssessmentPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [showIntro, setShowIntro] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(0));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Internal Modal Controls
    const [showSpiritSnack, setShowSpiritSnack] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    const categoryAverages = useMemo(() => {
        const results: { [key: string]: number } = {};
        CATEGORIES.forEach(cat => {
            const catQuestions = QUESTIONS.map((q, i) => ({ ...q, index: i })).filter(q => q.category === cat.id);
            const sum = catQuestions.reduce((acc, q) => acc + answers[q.index], 0);
            results[cat.id] = sum / catQuestions.length;
        });
        return results;
    }, [answers]);

    const handleSliderChange = (val: number) => {
        const newAnswers = [...answers];
        newAnswers[step] = val;
        setAnswers(newAnswers);
    };

    const handleNext = async () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                const feedbackText = await generateAssessmentFeedback(user!, categoryAverages);
                setFeedback(feedbackText);
                
                const lowestEntry = Object.entries(categoryAverages).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
                const result: AssessmentResult = {
                    date: new Date().toISOString(),
                    scores: categoryAverages,
                    feedback: feedbackText,
                    lowestCategory: lowestEntry[0]
                };

                await updateUserData(user!.id, {
                    assessmentResults: [result, ...(user!.assessmentResults || [])],
                    points: (user!.points || 0) + 100
                });
                
                setShowResults(true);
            } catch (e) {
                console.error(e);
                alert("Failed to process your results. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleQuestAction = (cat: any) => {
        if (cat.externalUrl) {
            window.open(cat.externalUrl, '_blank');
        } else if (cat.internalAction === 'spirit_snack') {
            setShowSpiritSnack(true);
        } else if (cat.internalAction === 'invite') {
            setShowInvite(true);
        }
    };

    // --- VIEW 1: INTRO SCREEN ---
    if (showIntro) {
        return (
            <div className="min-h-screen bg-hey-church-bg text-white p-6 flex flex-col justify-center animate-in fade-in duration-700">
                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="text-center relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-10">
                            <Compass size={160} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic text-hey-church-orange-500 drop-shadow-xl relative z-10">Faith Check</h1>
                        <p className="text-gray-400 mt-3 font-bold uppercase tracking-[0.2em] text-xs">Map your spiritual journey in 5 minutes</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-start space-x-4">
                            <div className="bg-hey-church-blue/20 p-3 rounded-2xl">
                                <MapIcon className="text-hey-church-blue" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-hey-church-blue tracking-wider mb-1">The Why</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">Discover where your roots are deepest and where new fruit is waiting to grow. This helps you see where God is moving and where He's inviting you to grow next.</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-start space-x-4">
                            <div className="bg-hey-church-yellow/20 p-3 rounded-2xl">
                                <Sparkles className="text-hey-church-yellow" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-hey-church-yellow tracking-wider mb-1">The What</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">30 heart-level questions covering the 5 essentials of faith: Daily Walk, Relationships, Serving, Mission, and Generosity.</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-start space-x-4">
                            <div className="bg-hey-church-orange-500/20 p-3 rounded-2xl">
                                <Activity className="text-hey-church-orange-500" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-hey-church-orange-500 tracking-wider mb-1">The How</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">Slide from 0-10 based on where you are today. You'll get a visual Radar Map and a short Note from Victor's assistant, leading you into your next Step of growth.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => setShowIntro(false)}
                            className="w-full bg-[#EF6D4D] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_0_40px_rgba(239,109,77,0.4)] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            START THE QUEST <ArrowRight className="ml-3" size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: RESULTS SCREEN ---
    if (showResults) {
        const lowestCategory = CATEGORIES.find(c => c.id === Object.entries(categoryAverages).sort((a, b) => (a[1] as number) - (b[1] as number))[0][0])!;
        
        return (
            <div className="min-h-screen bg-hey-church-bg text-white p-6 pb-24 animate-in fade-in duration-1000">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-hey-church-yellow/20 rounded-full mb-4">
                        <Trophy className="text-hey-church-yellow" size={40} />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Your Growth Map</h1>
                    <p className="text-gray-400 mt-2">Where God is moving in your life right now.</p>
                </div>

                <div className="bg-gray-800/50 border border-white/5 rounded-[2.5rem] p-8 mb-8">
                    <RadarChart scores={categoryAverages} />
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2 bg-black/20 p-2 rounded-xl">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{cat.label}: {categoryAverages[cat.id].toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI MENTOR LETTER */}
                <div className="bg-white text-gray-900 rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Sparkles size={100} />
                    </div>
                    <h3 className="text-xl font-black uppercase mb-4 flex items-center">
                        <Compass className="mr-2" /> Victor's Assistant
                    </h3>
                    <div className="prose prose-sm prose-invert text-gray-800 leading-relaxed font-medium">
                        {feedback.split('\n').map((para, i) => para.trim() ? (
                            <p key={i} className="mb-4">
                                {para.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-hey-church-orange-700">{part}</strong> : part)}
                            </p>
                        ) : null)}
                    </div>
                </div>

                {/* THE PRIMARY QUEST CARD */}
                <div className="bg-gradient-to-br from-[#133666] to-[#0f2a50] border border-hey-church-yellow/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-8">
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                         <lowestCategory.icon size={140} />
                    </div>
                    
                    <div className="relative z-10">
                        <span className="bg-hey-church-yellow text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">YOUR PRIMARY QUEST</span>
                        <h3 className="text-2xl font-black uppercase leading-tight mb-2">{lowestCategory.nextStepTitle}</h3>
                        <p className="text-gray-300 text-sm mb-6">{lowestCategory.nextStepDesc}</p>
                        
                        <button 
                            onClick={() => handleQuestAction(lowestCategory)}
                            className="w-full bg-[#EF6D4D] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center group"
                        >
                            {lowestCategory.actionLabel} 
                            {lowestCategory.externalUrl ? <ExternalLink className="ml-2" size={18} /> : <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/home')}
                    className="w-full py-5 rounded-[2rem] font-black text-gray-500 uppercase tracking-widest text-xs hover:text-white transition-colors"
                >
                    BACK TO DASHBOARD
                </button>
                
                {showSpiritSnack && <GuidedPrayerModal onClose={() => setShowSpiritSnack(false)} />}
                {showInvite && user && (
                    <InviteFriendModal 
                        user={user} 
                        onClose={() => setShowInvite(false)}
                        target={{
                            id: 'home',
                            title: 'Hey Life App',
                            type: 'lesson', 
                            data: { title: 'Hey Life App' },
                            courseId: 'app'
                        }}
                    />
                )}
            </div>
        );
    }

    // --- VIEW 3: QUESTION FLOW ---
    const currentQuestion = QUESTIONS[step];
    const category = CATEGORIES.find(c => c.id === currentQuestion.category)!;
    const progress = ((step + 1) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-hey-church-bg text-white p-6 flex flex-col justify-between overflow-hidden">
            <div className="max-w-lg mx-auto w-full flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setShowIntro(true)} className="text-gray-500 p-2"><ArrowLeft /></button>
                    <div className="flex-grow mx-6 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-hey-church-red h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-gray-500">{step + 1}/{QUESTIONS.length}</span>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none scale-150">
                    <RadarChart scores={categoryAverages} />
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-center">
                    <div className="mb-6 flex items-center space-x-3">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <category.icon className="text-white" size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.3em] text-hey-church-yellow">{category.label}</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-12 drop-shadow-md">
                        {currentQuestion.text}
                    </h2>

                    <div className="space-y-12">
                        <div className="relative">
                            <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                step="1"
                                value={answers[step]}
                                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-800 rounded-full appearance-none cursor-pointer accent-hey-church-orange-500"
                            />
                            <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                <span>{currentQuestion.isPercentage ? '0%' : 'Not at all'}</span>
                                <span>{currentQuestion.isPercentage ? '10%' : 'Totally true'}</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="text-8xl font-black text-white/20 select-none">
                                {answers[step]}{currentQuestion.isPercentage ? '%' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 relative z-10">
                    <button 
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="w-full bg-white text-hey-church-bg py-5 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : step === QUESTIONS.length - 1 ? 'REVEAL MY MAP' : 'CONTINUE'}
                    </button>
                    {step > 0 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="w-full mt-4 text-gray-500 font-bold text-sm hover:text-white transition-colors"
                        >
                            GO BACK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;
