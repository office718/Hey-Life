import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { SignUpModal, SignInModal } from '../components/AuthModals';

type ModalType = 'signup' | 'signin' | null;
type Language = 'English' | 'German' | 'French';

const WelcomePage: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const renderVision = () => {
        const visionText = t('welcome.vision');
        const visionKeywords = t('welcome.vision_keywords').split(',').map(kw => kw.trim());
        const parts = visionText.split(new RegExp(`(${visionKeywords.join('|')})`, 'gi'));
        return (
            <span>
                "...
                {parts.map((part, i) =>
                    visionKeywords.some(kw => kw.toLowerCase() === part.toLowerCase()) ?
                    <span key={i} className="text-hey-church-yellow">{part}</span> :
                    part
                )}
                "
            </span>
        );
    };

    const languages: { code: Language; label: string }[] = [
        { code: 'German', label: 'Deutsch' },
        { code: 'English', label: 'English' },
        { code: 'French', label: 'Français' },
    ];

    return (
        <>
            <div className="min-h-screen bg-hey-church-bg flex flex-col items-center justify-center p-4 text-white">

                <div className="max-w-md w-full text-center">
                    <h1 className="text-5xl font-extrabold text-hey-church-orange-400">Hey Life</h1>
                    <p className="mt-4 text-lg font-semibold text-gray-300">{t('welcome.tagline')}</p>
                    <p className="mt-6 text-2xl font-extrabold text-gray-300 leading-tight">
                        {renderVision()}
                    </p>
                </div>

                <div className="max-w-md w-full mt-10 space-y-6">
                    <div>
                        <p className="text-center text-gray-400 font-semibold mb-3">{t('welcome.select_language')}</p>
                        <div className="flex justify-center space-x-2">
                            {languages.map(({ code, label }) => (
                                <button
                                    key={code}
                                    onClick={() => setLanguage(code)}
                                    className={`px-4 py-2 rounded-lg font-bold border-2 transition-colors ${
                                        language === code
                                            ? 'bg-hey-church-red/20 border-hey-church-red text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-hey-church-orange-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => setActiveModal('signup')}
                            className="w-full bg-hey-church-red text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform hover:scale-105"
                        >
                            {t('welcome.join')}
                        </button>
                        <button
                            onClick={() => setActiveModal('signin')}
                            className="w-full bg-gray-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform hover:scale-105"
                        >
                            {t('welcome.signin')}
                        </button>
                    </div>
                </div>
            </div>

            {activeModal === 'signup' && <SignUpModal onClose={() => setActiveModal(null)} onSwitchToSignIn={() => setActiveModal('signin')} />}
            {activeModal === 'signin' && <SignInModal onClose={() => setActiveModal(null)} onSwitchToSignUp={() => setActiveModal('signup')} />}
        </>
    );
};

export default WelcomePage;