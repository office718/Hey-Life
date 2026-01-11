
import React, { useState, useEffect } from 'react';
import { User, LatestMessage, SpiritSnack, ActiveChallenge } from '../types';
import { QUOTES, LATEST_MESSAGE as fallbackMessage, getDailySpiritSnack } from '../constants/staticData';
import { 
    PlayCircle, Dumbbell, Sparkles, Gift, HandHelping, 
    Globe, BookText, ChevronRight, UserPlus, Trophy, 
    Play, Share2, Quote, ArrowRight, MessageSquare, 
    PenLine, BookOpen, Bell, CheckCircle2, Plus, Target, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { user, onToggleNotifications } = useAuth();
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
    
    // Feature: Randomize quote on every reload/mount
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
    
    // Determine if the last word is a keyword
    const words = cleanText.split(' ');
    const lastWordRaw = words[words.length - 1];
    const lastWordClean = lastWordRaw.replace(/[.!?]/g, '');
    const isLastWordKeyword = keywords.some(kw => kw.toLowerCase() === lastWordClean.toLowerCase());

    // Split text by keywords while keeping delimiters
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = cleanText.split(regex);
    
    return (
      <h1 className="text-2xl md:text-3xl font-black text-white leading-[1.3] uppercase tracking-normal italic drop-shadow-md">
        {parts.map((part, i) => {
          const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
          const isLastPart = i === parts.length - 1;
          
          let content = part;
          let useColor = isKeyword;

          // Special logic: If this is the last part and it contains the period,
          // AND either it is a keyword OR it's a trailing punctuation following a keyword last word.
          if (isLastPart && part.endsWith('.')) {
              if (isKeyword) {
                  useColor = true;
              } else if (isLastWordKeyword) {
                  // This is the case where the split left the period in the final string part 
                  // that isn't the keyword itself (e.g. "strong." splits into "strong" and ".")
                  useColor = true;
              }
          }

          return (
            <span key={i} className={useColor ? "text-hey-church-yellow" : ""}>
              {content}
            </span>
          );
        })}
      </h1>
    );
  };

  if (!user) return null;

  // Feature: Filter out finished challenges so they leave the homepage
  const activeChallenges = (user.activeChallenges || []).filter(c => c.completedDays < c.duration);

  // Logic to determine the thumbnail image for the latest sermon
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
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border border-white/20 rounded-[2.5rem] p-7 pt-8 pb-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div className="text-left pr-4">
                    <p className="text-[14px] font-bold uppercase tracking-wide text-white/90 mb-4">{getTimeGreeting()}</p>
                    {renderColorizedQuote()}
                </div>
                <button 
                    onClick={() => dailyQuote && handleShare(`"${dailyQuote.text}"`, "Daily Inspiration")}
                    className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg active:scale-90"
                >
                    <Share2 size={18} />
                </button>
            </div>
            <div className="absolute bottom-4 right-8 z-10 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                Victor Akko
            </div>
            <Quote className="absolute -bottom-6 -right-6 text-white opacity-10" size={120} />
          </div>
      </div>

      {/* --- Faith Check (Assessment) --- */}
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

      {/* 2. Spirit Snack Box */}
      {spiritSnack && (
          <section className="relative rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 p-7 flex flex-col justify-between bg-gradient-to-br from-[#4a102c] to-[#2e0517] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="bg-hey-church-yellow text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl inline-block mb-3 border border-white/20">TODAY'S SPIRIT SNACK</span>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">{t(spiritSnack.titleKey)}</h2>
                    </div>
                    <button 
                        onClick={() => handleShare(`${t(spiritSnack.titleKey)}: "${t(spiritSnack.verseKey)}"`, "Daily Spirit Snack")}
                        className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white/80 hover:text-white transition-all shadow-lg active:scale-90"
                    >
                        <Share2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-6 space-y-4">
                      <p className="text-xl md:text-2xl font-bold text-white leading-snug font-serif italic border-l-4 border-hey-church-yellow pl-5">
                          "{t(spiritSnack.verseKey)}"
                      </p>
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center">
                            <Sparkles size={14} className="text-hey-church-yellow mr-2 animate-pulse" />
                            <p className="text-[10px] font-black text-hey-church-yellow uppercase tracking-[0.2em]">{spiritSnack.reference}</p>
                        </div>
                        <button onClick={() => setShowGuidedPrayer(true)} className="bg-[#EF6D4D] hover:scale-105 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">
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
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-hey-church-yellow mb-2">Latest Sermon</p>
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

      {/* 6. Encourage Someone Box - DO NOT CHANGE OR REPLACE */}
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
    {showGuidedPrayer && <GuidedPrayerModal onClose={() => setShowGuidedPrayer(false)} />}
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
