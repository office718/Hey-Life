
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { signOutUser, getLearningGroups, updateUserData } from '../services/firebaseService';
import { ArrowLeft, UserCheck, Users, HeartHandshake, Bell, LogOut, PlusCircle, Smartphone, Share2, Download, Globe, Check } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [isAssignedLeader, setIsAssignedLeader] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const checkLeadership = async () => {
            if (user) {
                const learningGroups = await getLearningGroups();
                const isUserLeading = learningGroups.some(g => g.leaderId === user.id);
                setIsAssignedLeader(user.role === 'leader' || user.role === 'admin' || isUserLeading);
            }
        };
        checkLeadership();

        const checkInstall = () => {
            if (window.deferredInstallPrompt) {
                setCanInstall(true);
            }
        };
        checkInstall();
        window.addEventListener('beforeinstallprompt', checkInstall);
        return () => window.removeEventListener('beforeinstallprompt', checkInstall);
    }, [user]);

    const handleInstall = async () => {
        const promptEvent = window.deferredInstallPrompt;
        if (!promptEvent) return;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
            window.deferredInstallPrompt = null;
            setCanInstall(false);
        }
    };

    const handleShareApp = async () => {
        const shareData = {
            title: 'Hey Life App',
            text: 'I want to invite you to join me on Hey Life! Let\'s grow in Spirit, Soul, and Body together.',
            url: window.location.origin
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.origin);
            alert('App link copied to clipboard!');
        }
    };

    const handleLanguageChange = async (newLang: 'English' | 'German' | 'French') => {
        if (!user) return;
        setLanguage(newLang);
        await updateUserData(user.id, { language: newLang });
    };

    const handleLogout = async () => {
        await signOutUser();
        navigate('/welcome');
    };

    if (!user) {
        return null;
    }

    const languages: { code: 'English' | 'German' | 'French'; label: string }[] = [
        { code: 'English', label: 'English' },
        { code: 'German', label: 'Deutsch' },
        { code: 'French', label: 'Français' },
    ];

    return (
        <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white">
            <div className="flex items-center">
                <button onClick={() => navigate('/my-plan')} className="text-hey-church-orange-400">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-extrabold uppercase ml-4">{t('settings.title')}</h1>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Language Settings</p>
                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700">
                    <div className="flex flex-col space-y-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                    language === lang.code 
                                        ? 'bg-hey-church-blue/20 text-white' 
                                        : 'hover:bg-gray-700 text-gray-400'
                                }`}
                            >
                                <div className="flex items-center">
                                    <Globe size={18} className="mr-3 text-hey-church-orange-400" />
                                    <span className="font-bold">{lang.label}</span>
                                </div>
                                {language === lang.code && <Check size={18} className="text-hey-church-blue" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Installation & Sharing */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">App Experience</p>
                <div className="bg-gradient-to-br from-hey-church-blue to-blue-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <Smartphone className="absolute -right-4 -bottom-4 text-white opacity-10" size={100} />
                    <h3 className="font-bold text-lg mb-1">Make it Official</h3>
                    <p className="text-blue-100 text-xs mb-4">Install Hey Life to your home screen for the best experience.</p>
                    <div className="flex gap-3 relative z-10">
                        <button 
                            onClick={handleInstall}
                            disabled={!canInstall}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${canInstall ? 'bg-white text-hey-church-blue shadow-md active:scale-95' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
                        >
                            <Download size={18} /> {canInstall ? 'Install App' : 'Installed'}
                        </button>
                        <button 
                            onClick={handleShareApp}
                            className="flex-1 flex items-center justify-center gap-2 bg-hey-church-orange-500 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
                        >
                            <Share2 size={18} /> Share App
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Menu */}
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                {user.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} className="w-full text-left p-4 flex items-center font-semibold text-hey-church-yellow hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                        <UserCheck className="mr-4" size={22} /> {t('settings.menu.admin')}
                    </button>
                )}
                
                {isAssignedLeader && (
                    <>
                        <button onClick={() => navigate('/leader-dashboard')} className="w-full text-left p-4 flex items-center font-semibold text-hey-church-blue hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                            <Users className="mr-4" size={22} /> {t('settings.menu.leader')}
                        </button>
                        <button 
                            onClick={() => navigate('/leader-dashboard', { state: { createNew: true } })} 
                            className="w-full text-left p-4 flex items-center font-semibold text-hey-church-green hover:bg-gray-700/50 transition-colors border-b border-gray-700"
                        >
                            <PlusCircle className="mr-4" size={22} /> Create Group/Class
                        </button>
                    </>
                )}
                
                <button onClick={() => navigate('/giving')} className="w-full text-left p-4 flex items-center hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                    <HeartHandshake className="mr-4 text-gray-400" size={22} /> {t('settings.menu.giving')}
                </button>
                <button className="w-full text-left p-4 flex items-center hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                    <Bell className="mr-4 text-gray-400" size={22} /> {t('settings.menu.notifications')}
                </button>
                <button onClick={handleLogout} className="w-full text-left p-4 flex items-center text-hey-church-orange-400 hover:bg-gray-700/50 font-semibold transition-colors">
                    <LogOut className="mr-4" size={22} /> {t('settings.menu.logout')}
                </button>
            </div>

            <div className="text-center pt-10 opacity-50">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Hey Life App v1.0</p>
            </div>
        </div>
    );
};

export default SettingsPage;
