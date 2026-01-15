
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithEmail, signUpWithEmail, sendPasswordReset, signInWithGoogle } from '../services/firebaseService';
import { getFirebaseProjectId } from '../firebase/firebaseConfig';
import { X, Loader2, AlertCircle, Copy, HelpCircle, Check, Settings } from 'lucide-react';

interface ModalProps {
    onClose: () => void;
}

interface SignUpModalProps extends ModalProps {
    onSwitchToSignIn: () => void;
}

interface SignInModalProps extends ModalProps {
    onSwitchToSignUp: () => void;
}

const GoogleButton: React.FC<{ onClick: () => void, disabled: boolean, label: string }> = ({ onClick, disabled, label }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
            />
            <path
                fill="#EA4335"
                d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
        {label}
    </button>
);

const TroubleshootingBox: React.FC<{ code: string, domain?: string | null }> = ({ code, domain }) => {
    const currentProjectId = getFirebaseProjectId();
    const isDefaultProject = currentProjectId.includes('gen-lang-client');
    const [copied, setCopied] = useState(false);

    const handleCopyDomain = () => {
        const d = domain || window.location.hostname;
        navigator.clipboard.writeText(d);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 p-4 bg-gray-900 border border-hey-church-orange-700/50 rounded-2xl space-y-3 shadow-2xl">
            <p className="text-hey-church-orange-400 font-black flex items-center text-[10px] uppercase tracking-widest">
                <HelpCircle size={14} className="mr-2" /> Finish Setup
            </p>
            
            {isDefaultProject || code === 'auth/custom-unsupported-project' ? (
                <div className="space-y-2">
                    <p className="text-[11px] text-white leading-relaxed font-bold bg-red-900/40 p-2 rounded-lg border border-red-800/50">
                        Keys are still placeholders!
                    </p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        Replace "PASTE_YOUR_API_KEY_HERE" in <span className="text-white">index.html</span> with the values from your Firebase Console.
                    </p>
                </div>
            ) : null}

            {code === 'auth/unauthorized-domain' && (
                <div className="space-y-3 pt-1">
                    <p className="text-[10px] text-gray-300">Firebase blocked this domain. Copy the URL below, go to <span className="text-white font-bold underline">Auth > Settings > Authorized Domains</span> and add it:</p>
                    <div className="bg-black/50 p-2.5 rounded-xl flex items-center justify-between border border-white/10">
                        <code className="text-[10px] text-hey-church-blue font-mono truncate mr-2">{domain || window.location.hostname}</code>
                        <button onClick={handleCopyDomain} className="text-gray-400 hover:text-white flex-shrink-0 transition-colors">
                            {copied ? <Check size={14} className="text-hey-church-green" /> : <Copy size={14}/>}
                        </button>
                    </div>
                </div>
            )}

            {code === 'auth/operation-not-allowed' && (
                <div className="flex items-start space-x-2 p-2 bg-hey-church-blue/10 rounded-lg">
                    <Settings size={14} className="text-hey-church-blue mt-0.5" />
                    <p className="text-[10px] text-gray-300">Go to <span className="text-white font-bold">Firebase Console > Auth > Sign-in method</span> and click <span className="text-white font-bold underline">Enable Google</span>.</p>
                </div>
            )}
        </div>
    );
};

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSwitchToSignIn }) => {
    const { language, t } = useLanguage();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{msg: string, code?: string} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !firstName.trim() || !password.trim()) {
            setError({ msg: 'Please fill in all required fields.' });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const name = `${firstName} ${lastName}`.trim();
            await signUpWithEmail(email, password, name, language);
        } catch (authError: any) {
            console.error(authError);
            setError({ 
                msg: authError.code === 'auth/email-already-in-use' 
                    ? "This email is already in use." 
                    : 'An error occurred during sign up.',
                code: authError.code
            });
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (e: any) {
            console.error("Google Sign-Up Error:", e);
            let msg = 'Google sign-in failed.';
            
            if (e.code === 'auth/popup-closed-by-user') msg = 'Sign-in cancelled.';
            else if (e.code === 'auth/unauthorized-domain') msg = `Domain not authorized. Add it to your console.`;
            else if (e.code === 'auth/operation-not-allowed') msg = 'Google provider is disabled in your console.';
            else if (e.code === 'auth/popup-blocked') msg = 'Popup blocked by browser.';
            else if (e.message) msg = e.message;
            
            setError({ msg, code: e.code });
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24}/></button>
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-black text-center text-white italic uppercase tracking-tighter">{t('auth.create_account')}</h2>
                    
                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} label={t('auth.google_signin')} />
                    
                    {error && (
                        <div className="animate-in slide-in-from-top-2">
                            <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-xl flex items-start">
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                <span>{error.msg}</span>
                            </div>
                            {error.code && <TroubleshootingBox code={error.code} />}
                        </div>
                    )}

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('auth.or')}</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            name="firstName"
                            placeholder={t('auth.first_name')} 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            className="block w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <input 
                            type="email" 
                            name="email"
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="block w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <input 
                            type="password" 
                            name="password"
                            placeholder={t('auth.password')} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="block w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />

                        <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-lg font-black text-white bg-hey-church-red hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:bg-gray-700 disabled:shadow-none uppercase tracking-widest">
                            {loading ? <Loader2 className="animate-spin" /> : t('auth.signup')}
                        </button>
                    </form>
                    <button onClick={onSwitchToSignIn} className="w-full text-center text-sm font-bold text-hey-church-orange-400 hover:underline">
                        {t('auth.have_account')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SignInModal: React.FC<SignInModalProps> = ({ onClose, onSwitchToSignUp }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{msg: string, code?: string} | null>(null);
    const [loading, setLoading] = useState(false);
    
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signInWithEmail(email, password);
        } catch (authError: any) {
             console.error(authError);
             setError({ 
                msg: "Invalid email or password.", 
                code: authError.code 
            });
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (e: any) {
            console.error("Google Sign-In Error:", e);
            let msg = 'Google sign-in failed.';
            if (e.code === 'auth/popup-closed-by-user') msg = 'Sign-in cancelled.';
            else if (e.code === 'auth/unauthorized-domain') msg = `Domain not authorized. Add it to your console.`;
            else if (e.code === 'auth/operation-not-allowed') msg = 'Google provider is disabled in your console.';
            else if (e.code === 'auth/popup-blocked') msg = 'Popup blocked by browser.';
            else if (e.message) msg = e.message;
            
            setError({ msg, code: e.code });
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError({ msg: 'Please enter your email address first.' });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await sendPasswordReset(email);
            setError({ msg: 'Password reset email sent! Check your inbox.', code: 'success' });
        } catch (err: any) {
            console.error("Password Reset Error:", err);
            setError({ msg: 'Failed to send password reset email.' });
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24}/></button>
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-black text-center text-white italic uppercase tracking-tighter">{t('auth.welcome_back')}</h2>
                    
                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} label={t('auth.google_signin')} />
                    
                    {error && (
                        <div className="animate-in slide-in-from-top-2">
                            <div className={`text-sm p-3 rounded-xl flex items-start ${error.code === 'success' ? 'bg-green-900/30 text-green-200 border border-green-800' : 'bg-red-900/30 text-red-200 border border-red-800'}`}>
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>
                                <span>{error.msg}</span>
                            </div>
                            {error.code && error.code !== 'success' && <TroubleshootingBox code={error.code} />}
                        </div>
                    )}

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('auth.or')}</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input 
                            type="email" 
                            name="email"
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="block w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <div>
                            <input 
                                type="password" 
                                name="password"
                                placeholder={t('auth.password')} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="block w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                                required 
                            />
                            <div className="text-right mt-2 px-1">
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    className="text-xs font-bold text-hey-church-orange-400 hover:underline"
                                >
                                    {t('auth.forgot_password')}
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-lg font-black text-white bg-hey-church-red hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:bg-gray-700 disabled:shadow-none uppercase tracking-widest">
                           {loading ? <Loader2 className="animate-spin" /> : t('welcome.signin')}
                        </button>
                    </form>
                    <button onClick={onSwitchToSignUp} className="w-full text-center text-sm font-bold text-hey-church-orange-400 hover:underline">
                         {t('auth.no_account')} {t('auth.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
