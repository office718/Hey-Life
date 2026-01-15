
import React, { useState, useEffect } from 'react';
import { User, LatestMessage, SpiritSnack, ActiveChallenge } from '../types';
import { QUOTES, LATEST_MESSAGE as fallbackMessage, getDailySpiritSnack } from '../constants/staticData';
import { 
    PlayCircle, Dumbbell, Sparkles, Gift, HandHelping, 
    Globe, BookText, ChevronRight, UserPlus, Trophy, 
    Play, Share2, Quote, ArrowRight, MessageSquare, 
    PenLine, BookOpen, Bell, CheckCircle2, Plus, Target, Compass
} from 'lucide-react';
// FIX: Import useOutletContext to access context from MainLayout
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../App';
import { getGlobalContent, completeChallengeDay } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';
import { GuidedPrayerModal } from '../components/GuidedPrayerModal';
import InviteFriendModal from '../components/InviteFriendModal';

const VideoPlayerModal: React.FC<{ videoId: string; onClose: () => void }> = ({ videoId, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="aspect-video bg-black">
                    <iframe 
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
                <button onClick={onClose} className="w-full py-4 bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs">Close Player</button>
            </div>
        </div>
    );
};

const FeatureBox: React.FC<{ 
    title: string; 
    icon: React.ElementType; 
    color: string; 
    onClick: () => void;
}> = ({ title, icon: Icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className={`${color} rounded-3xl p-5 flex flex-col justify-center items-center text-center shadow-lg transition-all active:scale-95 hover:brightness-110 h-32 w-full border border-white/5 relative overflow-hidden group`}
    >
        <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 relative z-10">
            <Icon size={20} className="text-white" />
        </div>
        <h3 className="font-black text-white text-[10px] uppercase tracking-widest leading-tight relative z-10">{title}</h3>
    </button>
);

const ChallengeCarouselItem: React.FC<{ challenge: ActiveChallenge, onComplete: (id: string) => void }> = ({ challenge, onComplete }) => {
    const progress = (challenge.completedDays / challenge.duration) * 100;
    return (
        <div className="flex-shrink-0 w-[85vw] bg-[#EF6D4D] rounded-[2.5rem] p-6 shadow-xl snap-center relative overflow-hidden border border-white/10">
            <div className="relative z-10">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                    Day {challenge.completedDays + 1} of {challenge.duration}
                </p>
                <h3 className="text-2xl font-black text-white uppercase leading-none mb-4">{challenge.title}</h3>
                
                <div className="mb-6">
                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-white h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onComplete(challenge.id); }}
                    className="w-full bg-white text-[#EF6D4D] py-4 rounded-2xl font-black text-base uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
                >
                    Mark Today as Complete
                </button>
            </div>
            <Trophy className="absolute -right-6 -bottom-6 text-white/10" size={140} />
        </div>
    );
};

const HomePage: React.FC = () => {
  // FIX: Access onToggleNotifications from useOutletContext as it is defined in MainLayout
  const { user } = useAuth();
  const { onToggleNotifications } = useOutletContext<{ onToggleNotifications: () => void }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [spiritSnack, setSpiritSnack] = useState<SpiritSnack | null>(null);
  const [dailyQuote, setDailyQuote] = useState<{text: string, keywords: string[]} | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [latestMessage, setLatestMessage] = useState<LatestMessage>(fallbackMessage);
  const [showGuidedPrayer, setShowGuidedPrayer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    setSpiritSnack(getDailySpiritSnack());
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setDailyQuote(QUOTES[randomIndex]);

    const fetchAppData = async () => {
        const globalContent = await getGlobalContent();
        if (globalContent?.latestMessage) setLatestMessage(globalContent.latestMessage);
    };
    fetchAppData();
  }, []);

  const handleShareApp = async () => {
    const shareData = {
        title: 'Hey Life App',
        text: 'Come join me on the Hey Life App! Let\'s grow together.',
        url: window.location.origin
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) {}
    } else {
        navigator.clipboard.writeText(window.location.origin);
        alert('App link copied!');
    }
  };

  const handleShare = async (text: string, title: string) => {
    if (navigator.share) {
        try {
            await navigator.share({ title, text });
        } catch (err) {
            console.error(err);
        }
    } else {
        navigator.clipboard.writeText(`${title}: ${text}`);
        alert('Copied to clipboard!');
    }
  };

  const handleCompleteChallengeDay = async (challengeId: string) => {
    if (!user) return;
    try {
        await completeChallengeDay(user.id, challengeId);
    } catch (e) {
        console.error(e);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning', { name: user?.name || '' });
    if (hour < 18) return t('home.greeting.afternoon', { name: user?.name || '' });
    return t('home.greeting.evening', { name: user?.name || '' });
  };

  const renderColorizedQuote = () => {
    if (!dailyQuote) return null;
    const { text, keywords } = dailyQuote;
    const cleanText = text.replace(/^"|"$/g, '').trim();
    
    const words = cleanText.split(' ');
    const lastWordRaw = words[words.length - 1];
    const lastWordClean = lastWordRaw.replace(/[.!?]/g, '');
    const isLastWordKeyword = keywords.some(kw => kw.toLowerCase() === lastWordClean.toLowerCase());

    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = cleanText.split(regex);
    
    return (
      <h1 className="text-xl md:text-2xl font-black text-white leading-relaxed uppercase tracking-widest italic drop-shadow-md px-1">
        {parts.map((part, i) => {
          const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
          const isLastPart = i === parts.length - 1;
          
          let content = part;
          let useColor = isKeyword;

          if (isLastPart && part.endsWith('.')) {
              if (isKeyword) {
                  useColor = true;
              } else if (isLastWordKeyword) {
                  useColor = true;
              }
          }

          return (
            <span key={i} className={useColor ? "text-hey-church-orange-500" : ""}>
              {content}
            </span>
          );
        })}
      </h1>
    );
  };

  if (!user) return null;

  const activeChallenges = (user.activeChallenges || []).filter(c => c.completedDays < c.duration);
  const sermonThumbnail = latestMessage.thumbnail || `https://img.youtube.com/vi/${latestMessage.videoId}/maxresdefault.jpg`;

  return (
    <>
    <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center px-2 pt-2">
          <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
          <button onClick={onToggleNotifications} className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Bell size={24} className="text-gray-300" />
          </button>
      </div>

      {/* 1. Greeting & Inspiration Box */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border border-white/20 rounded-[2rem] p-6 py-8 shadow-2xl relative overflow-hidden text-center max-w-[96%] mx-auto">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            
            <button 
                onClick={() => dailyQuote && handleShare(`"${dailyQuote.text}"`, "Daily Inspiration")}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg active:scale-90 z-20"
            >
                <Share2 size={16} />
            </button>

            <div className="relative z-10 max-w-[95%] mx-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">{getTimeGreeting()}</p>
                {renderColorizedQuote()}
                <div className="mt-5 text-white/30 text-[8px] font-black uppercase tracking-[0.4em]">
                    Victor Akko
                </div>
            </div>

            <Quote className="absolute top-4 left-4 text-white opacity-[0.03]" size={48} />
            <Quote className="absolute bottom-4 right-4 text-white opacity-[0.03] rotate-180" size={48} />
          </div>
      </div>

      {/* --- Faith Check --- */}
      <div 
        onClick={() => navigate('/assessment')}
        className="bg-[#EF6D4D] rounded-[2.5rem] p-7 shadow-2xl border border-white/10 flex items-center justify-between group cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700 delay-100"
      >
          <div className="flex items-center space-x-5 relative z-10">
              <div className="bg-white/20 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                  <Compass className="text-white" size={26} />
              </div>
              <div>
                  <h3 className="font-black text-white uppercase text-xl leading-none tracking-tight">Faith Check</h3>
                  <p className="text-white/80 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">
                    Map your spiritual growth
                  </p>
              </div>
          </div>
          <ChevronRight className="text-white/30" />
      </div>

      {/* 2. Spirit Snack Box - UPDATED COMPACT DESIGN */}
      {spiritSnack && (
          <section className="relative rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-[#8B1A1A] to-[#4A0808] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="w-full">
                        <span className="bg-white/10 text-white/80 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-4 border border-white/10">
                            TODAY'S SPIRIT SNACK
                        </span>
                        
                        {/* Heading with Yellow Accent Bar - Smaller Title for Mobile fit */}
                        <div className="flex items-center mb-6">
                            <div className="w-1 bg-[#FBBF24] h-6 rounded-full mr-3 shadow-[0_0_15px_rgba(251,191,36,0.6)] flex-shrink-0"></div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none truncate pr-2">
                                {t(spiritSnack.titleKey)}
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleShare(`${t(spiritSnack.titleKey)}: "${t(spiritSnack.verseKey)}"`, "Daily Spirit Snack")}
                        className="p-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <Share2 size={18} />
                    </button>
                  </div>
                  
                  {/* Bible Verse Area - Reduced margin for compactness */}
                  <div className="mb-6 px-1">
                      <p className="text-lg md:text-2xl font-bold text-white leading-[1.5] italic font-serif opacity-95">
                          "{t(spiritSnack.verseKey)}"
                      </p>
                  </div>

                  <div className="flex flex-col items-end">
                      <p className="text-sm font-black text-[#FBBF24] uppercase tracking-widest mb-6 drop-shadow-md">
                          {spiritSnack.reference}
                      </p>
                      
                      <div className="w-full flex justify-start">
                        <button 
                            onClick={() => setShowGuidedPrayer(true)} 
                            className="border-2 border-[#EF6D4D] text-white hover:bg-[#EF6D4D]/10 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                        >
                            LET'S PRAY
                        </button>
                      </div>
                  </div>
              </div>
          </section>
      )}

      {/* 3. Latest Sermon Box */}
      <div 
        onClick={() => setIsVideoPlayerOpen(true)}
        className="relative h-60 w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
      >
          <img 
            src={sermonThumbnail} 
            alt={latestMessage.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-hey-church-red p-6 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] group-hover:scale-110 transition-transform duration-500">
                  <Play size={32} className="text-white fill-white ml-1"/>
              </div>
          </div>
          <div className="absolute bottom-7 left-7 right-7">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-hey-church-orange-500 mb-2">Latest Sermon</p>
              <h3 className="text-2xl font-black text-white uppercase leading-none drop-shadow-2xl">{latestMessage.title}</h3>
          </div>
      </div>

      {/* 4. Challenges Carousel */}
      <div className="space-y-4 pt-2">
          <div className="flex justify-between items-end px-3">
            <h2 className="text-xl font-black uppercase tracking-tight">Active Journey</h2>
            <button onClick={() => navigate('/challenges')} className="text-[10px] font-black uppercase tracking-widest text-hey-church-orange-400">
                Browse All
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-6 px-3 snap-x scrollbar-hide">
              {activeChallenges.length > 0 ? (
                  activeChallenges.map(challenge => (
                      <ChallengeCarouselItem 
                        key={challenge.id} 
                        challenge={challenge} 
                        onComplete={handleCompleteChallengeDay}
                      />
                  ))
              ) : (
                  <div 
                    onClick={() => navigate('/challenges')}
                    className="flex-shrink-0 w-full bg-gray-800/40 border-2 border-dashed border-gray-700 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer"
                  >
                      <Trophy size={40} className="text-gray-600 mb-3"/>
                      <p className="font-black text-white uppercase tracking-widest text-sm">Join a Challenge</p>
                  </div>
              )}
              <div className="flex-shrink-0 w-4"></div>
          </div>
      </div>

      {/* 5. Hey Gym Workout Box */}
      <div 
        onClick={() => navigate(user.workoutPlan ? '/workout-plan' : '/workout-onboarding')}
        className="bg-hey-church-blue rounded-[2.5rem] p-7 shadow-2xl border border-white/10 flex items-center justify-between group cursor-pointer relative overflow-hidden"
      >
          <div className="flex items-center space-x-5 relative z-10">
              <div className="bg-white/20 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                  <Dumbbell className="text-white" size={26} />
              </div>
              <div>
                  <h3 className="font-black text-white uppercase text-xl leading-none tracking-tight">Hey Gym Workout</h3>
                  <p className="text-blue-100 text-[10px] mt-2 font-black uppercase tracking-[0.2em] opacity-80">
                    {user.workoutPlan ? "Keep Pushing" : "Create My Plan"}
                  </p>
              </div>
          </div>
          <ChevronRight className="text-white/30" />
      </div>

      {/* 6. Encourage Someone Box */}
      <div 
        onClick={handleShareApp}
        className="bg-hey-church-purple rounded-[2.5rem] p-7 shadow-2xl border border-white/5 flex items-center justify-between group cursor-pointer"
      >
          <div className="flex items-center space-x-5 relative z-10">
              <div className="bg-white/20 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                  <UserPlus className="text-white" size={26} />
              </div>
              <div>
                  <h3 className="font-black text-white uppercase text-xl leading-none tracking-tight">Make God Known</h3>
                  <p className="text-purple-100 text-[10px] mt-2 font-black uppercase tracking-[0.2em] opacity-80">Invite a friend to Hey Life</p>
              </div>
          </div>
          <ChevronRight className="text-white/30" />
      </div>

      {/* 8. 4 Boxes Utility Grid */}
      <div className="grid grid-cols-2 gap-5 pt-2">
          <FeatureBox 
            title="Giving" 
            icon={Gift} 
            color="bg-emerald-600" 
            onClick={() => navigate('/giving')}
          />
          <FeatureBox 
            title="Prayer Wall" 
            icon={HandHelping} 
            color="bg-hey-church-purple" 
            onClick={() => navigate('/community')}
          />
          <FeatureBox 
            title="Journal" 
            icon={BookOpen} 
            color="bg-gradient-to-br from-[#133666] to-[#0f2a50]" 
            onClick={() => navigate('/journal')}
          />
          <FeatureBox 
            title="YouVersion" 
            icon={BookText} 
            color="bg-hey-church-orange-900" 
            onClick={() => window.open('https://www.bible.com', '_blank')}
          />
      </div>

      <div className="pt-10 text-center opacity-10 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.8em]">Hey Life Experience</p>
      </div>
    </div>

    {isVideoPlayerOpen && <VideoPlayerModal videoId={latestMessage.videoId} onClose={() => setIsVideoPlayerOpen(false)} />}
    {showGuidedPrayer && spiritSnack && (
        <GuidedPrayerModal 
            snack={spiritSnack} 
            onClose={() => setShowGuidedPrayer(false)} 
        />
    )}
    {showInviteModal && (
        <InviteFriendModal 
            user={user} 
            onClose={() => setShowInviteModal(false)}
            target={{
                id: 'home',
                title: 'Hey Life App',
                type: 'lesson', 
                data: { title: 'Hey Life App' },
                courseId: 'app'
            }}
        />
    )}
    </>
  );
};

export default HomePage;
