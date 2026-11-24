
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Challenge, User, ChallengeMessage } from '../types';
import { useAuth } from '../App';
import * as firebaseService from '../services/firebaseService';
import { Loader2, Users, Send, Check, LogOut, AlertTriangle, Share2, Heart, X as XIcon } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

const ChallengeDetailsPage: React.FC = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [participants, setParticipants] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showInviteOverlay, setShowInviteOverlay] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!challengeId) {
            navigate('/challenges');
            return;
        }

        const unsubscribe = firebaseService.listenToChallenge(challengeId, (updatedChallenge) => {
            setChallenge(updatedChallenge);
            if (updatedChallenge.participantIds && updatedChallenge.participantIds.length > 0) {
                firebaseService.getUsersByIds(updatedChallenge.participantIds).then(setParticipants);
            } else {
                setParticipants([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [challengeId, navigate]);

     useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [challenge?.messages]);

    const isActive = currentUser?.activeChallenges?.some(c => c.id === challenge.id);

    useEffect(() => {
        // If the user arrived via an invite link and isn't active yet, show a special welcome
        const params = new URLSearchParams(window.location.search);
        if (params.get('invite') === 'true' && !isActive && !loading && challenge) {
            setShowInviteOverlay(true);
        }
    }, [isActive, loading, challenge]);

    const sortedMessages = useMemo(() => {
        if (!challenge?.messages) return [];
        
        const getTime = (timestamp: any): number => {
          if (!timestamp) return 0;
          if (timestamp.seconds) {
            return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
          }
          if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            return isNaN(date.getTime()) ? 0 : date.getTime();
          }
          return 0;
        };
    
        return [...challenge.messages].sort((a, b) => getTime(a.timestamp) - getTime(b.timestamp));
    }, [challenge?.messages]);

    const handleStartChallenge = async () => {
        if (!currentUser || !challenge) return;
        try {
            await firebaseService.startChallenge(currentUser.id, challenge);
        } catch (error) {
            console.error("Failed to start challenge:", error);
            alert("Could not start this challenge. Please try again.");
        }
    };

    const handleLeaveChallenge = async () => {
        if (!currentUser || !challenge || !window.confirm("Are you sure you want to stop this challenge? Your progress will be lost.")) return;
        setIsLeaving(true);
        try {
            await firebaseService.leaveChallenge(currentUser.id, challenge.id);
            navigate('/challenges');
        } catch (error) {
            console.error("Failed to leave challenge:", error);
            alert("Failed to leave the challenge.");
        } finally {
            setIsLeaving(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !challenge || isSending) return;

        setIsSending(true);

        const messagePayload = {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content: newMessage.trim(),
        };
        
        const messageToSend = newMessage;
        setNewMessage(''); 

        try {
            await firebaseService.addMessageToChallenge(challenge.id, messagePayload);
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Could not send your message. Please try again.");
            setNewMessage(messageToSend);
        } finally {
            setIsSending(false);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}${window.location.pathname}#/challenges/${challengeId}?invite=true`;
        if (navigator.share) {
            navigator.share({
                title: `Join me: ${challenge?.title}`,
                text: `I'm doing this challenge on Hey Life: ${challenge?.description}`,
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert("Invite link copied to clipboard!");
        }
    };

    const handleAcceptInvite = async () => {
        setShowInviteOverlay(false);
        await handleStartChallenge();
    };

    const formatTimestamp = (timestamp: any): string => {
        try {
            if (!timestamp) return '...';
            if (typeof timestamp.toDate === 'function') {
                return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            if (typeof timestamp === 'string') {
                const d = new Date(timestamp);
                if (!isNaN(d.getTime())) {
                     return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            }
            return '--:--';
        } catch (e) {
            console.error("Error formatting timestamp:", timestamp, e);
            return 'error';
        }
    };


    if (loading) {
        return <div className="min-h-screen bg-hey-church-bg flex items-center justify-center text-white"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    if (!challenge) {
        return <div className="p-4 text-center text-white">Challenge not found.</div>;
    }

    return (
        <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white flex flex-col relative overflow-hidden">
            {/* Invite Overlay */}
            {showInviteOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
                    <div className="bg-gray-800 w-full max-w-sm rounded-[3rem] border-2 border-hey-church-orange-400 p-8 shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <button 
                            onClick={() => setShowInviteOverlay(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white"
                        >
                            <XIcon size={24} />
                        </button>
                        
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-hey-church-orange-400/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Heart className="text-hey-church-orange-400 fill-hey-church-orange-400" size={40} />
                            </div>
                            
                            <div>
                                <h2 className="text-sm font-black uppercase text-hey-church-orange-400 tracking-[0.3em] mb-2">You've been invited!</h2>
                                <h3 className="text-3xl font-black uppercase italic leading-none">{t(challenge.title)}</h3>
                            </div>
                            
                            <p className="text-gray-400 text-sm leading-relaxed px-2 italic">
                                "Someone thinks you'd be a great fit for this challenge. Ready to level up together?"
                            </p>
                            
                            <div className="pt-4 space-y-3">
                                <button 
                                    onClick={handleAcceptInvite}
                                    className="w-full bg-hey-church-red text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-hey-church-red/30 active:scale-95 transition-all"
                                >
                                    Accept & Start
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowInviteOverlay(false);
                                        navigate('/challenges');
                                    }}
                                    className="w-full bg-transparent text-gray-500 py-3 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                                >
                                    Not right now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => navigate('/challenges')} className="text-hey-church-orange-400 font-bold uppercase text-xs tracking-tighter flex items-center">
                        <LogOut size={14} className="mr-1 rotate-180" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleShare}
                            className="p-2.5 bg-hey-church-blue/10 text-hey-church-blue rounded-full hover:bg-hey-church-blue/20 transition-all border border-hey-church-blue/20"
                            title="Invite Friends"
                        >
                            <Share2 size={18} />
                        </button>
                        {isActive && (
                            <button 
                                onClick={handleLeaveChallenge}
                                disabled={isLeaving}
                                className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-red-400/30 hover:text-red-400 transition-all"
                             >
                                {isLeaving ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <LogOut size={12} className="mr-1.5" />}
                                Stop
                             </button>
                        )}
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl shadow-lg p-5">
                    <h1 className="font-extrabold text-2xl text-white">{t(challenge.title)}</h1>
                    <p className="text-sm text-gray-300 mt-2">{t(challenge.description)}</p>
                    <blockquote className="mt-4 pl-4 border-l-4 border-hey-church-yellow italic text-gray-400">
                        "{t(challenge.why)}"
                    </blockquote>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                        <span className="font-bold text-lg text-hey-church-yellow">+{challenge.points} Points</span>
                        <button 
                            onClick={handleStartChallenge}
                            disabled={isActive}
                            className={`font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-all text-base ${
                                isActive ? 'bg-green-500 text-white cursor-not-allowed' : 
                                'bg-hey-church-red text-white hover:bg-opacity-90 hover:scale-105'
                            }`}
                        >
                            {isActive ? <><Check size={18} className="mr-2"/>In Progress</> : 'Start Challenge'}
                        </button>
                    </div>
                </div>

                <div className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h2 className="font-bold text-lg mb-3 flex items-center"><Users className="mr-2 text-hey-church-orange-400"/> Fellow Challengers ({participants.length})</h2>
                    <div className="flex flex-wrap gap-2">
                        {participants.map(p => (
                            <img key={p.id} src={p.avatar} alt={p.name} title={p.name} className="w-10 h-10 rounded-full border-2 border-gray-600"/>
                        ))}
                        {participants.length === 0 && <p className="text-sm text-gray-500">Be the first to join!</p>}
                    </div>
                </div>
            </div>

            {/* Chat Section */}
            <div className="flex-grow bg-gray-800 rounded-xl shadow-lg mt-6 flex flex-col">
                 <h2 className="font-bold text-lg p-4 border-b border-gray-700 flex-shrink-0">Encouragement Hub</h2>
                 <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {sortedMessages.length > 0 ? (
                        sortedMessages.map((msg, index) => {
                             if (!msg || typeof msg !== 'object') {
                                return <div key={index} className="text-red-500 text-xs text-center">Invalid message data detected.</div>;
                            }
                            const isCurrentUser = msg.userId === currentUser?.id;
                            return (
                                <div key={msg.userId + index + msg.content} className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                    <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full"/>
                                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-xl max-w-xs md:max-w-md ${isCurrentUser ? 'bg-hey-church-blue rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                            {!isCurrentUser && <p className="text-xs font-bold text-hey-church-orange-400 mb-1">{msg.userName}</p>}
                                            <p className="text-sm text-white">{msg.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(msg.timestamp)}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p>No messages yet.</p>
                            <p className="text-xs mt-1">Be the first to send some encouragement!</p>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                 </div>
                 <div className="flex-shrink-0 p-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                            placeholder="Encourage someone..."
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-hey-church-red focus:border-hey-church-red"
                            disabled={isSending}
                        />
                        <button 
                            onClick={handleSendMessage} 
                            disabled={isSending || !newMessage.trim()} 
                            className="bg-hey-church-red p-3 rounded-full text-white disabled:bg-gray-600 transition-colors"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetailsPage;
