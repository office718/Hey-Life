
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithEmail, signUpWithEmail, sendPasswordReset, signInWithGoogle } from '../services/firebaseService';
import { X, Loader2, AlertCircle, Copy } from 'lucide-react';

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

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSwitchToSignIn }) => {
    const { language, t } = useLanguage();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [domainToCopy, setDomainToCopy] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !firstName.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const name = `${firstName} ${lastName}`.trim();
            await signUpWithEmail(email, password, name, language);
            // Auth state change in App.tsx will handle navigation
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
                setError("This email is already in use. Please try signing in instead.");
            } else {
                setError('An error occurred during sign up. Please try again.');
            }
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        setDomainToCopy(null);
        try {
            await signInWithGoogle();
        } catch (e: any) {
            console.error("Google Sign-Up Error:", e);
            let msg = 'Google sign-in failed.';
            
            if (e.code === 'auth/popup-closed-by-user') {
                msg = 'Sign-in cancelled.';
            } else if (e.code === 'auth/unauthorized-domain') {
                const currentDomain = window.location.hostname;
                setDomainToCopy(currentDomain);
                msg = `SETUP REQUIRED: You must add this domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
            } else if (e.code === 'auth/operation-not-allowed') {
                msg = 'Google provider is not enabled in Firebase Console.';
            } else if (e.code === 'auth/popup-blocked') {
                msg = 'Popup blocked. Please allow popups for this site.';
            } else if (e.message) {
                msg = `Error (${e.code}): ${e.message}`;
            }
            
            setError(msg);
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                <div className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-center text-white">{t('auth.create_account')}</h2>
                    
                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} label={t('auth.google_signin')} />
                    
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-md">
                            <div className="flex items-start mb-2">
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                            {domainToCopy && (
                                <div className="mt-2 bg-black/40 p-2 rounded flex items-center justify-between">
                                    <code className="text-xs text-yellow-400 font-mono break-all">{domainToCopy}</code>
                                    <button 
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(domainToCopy)}
                                        className="text-gray-400 hover:text-white ml-2"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={14}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">{t('auth.or')}</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            name="firstName"
                            autoComplete="given-name"
                            placeholder={t('auth.first_name')} 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <input 
                            type="text" 
                            name="lastName"
                            autoComplete="family-name"
                            placeholder={t('auth.last_name')} 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                        />
                        <input 
                            type="email" 
                            name="email"
                            autoComplete="email"
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <input 
                            type="password" 
                            name="password"
                            autoComplete="new-password"
                            placeholder={t('auth.password')} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />

                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-hey-church-red hover:bg-opacity-90 disabled:bg-gray-600">
                            {loading ? <Loader2 className="animate-spin" /> : t('auth.signup')}
                        </button>
                    </form>
                    <button onClick={onSwitchToSignIn} className="w-full text-center text-sm text-hey-church-orange-400 hover:underline">
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
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [domainToCopy, setDomainToCopy] = useState<string | null>(null);
    
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await signInWithEmail(email, password);
            // Auth state change will handle navigation
        } catch (authError: any) {
             if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
                setMessage({ text: "Invalid email or password. Please try again.", type: 'error' });
            } else {
                setMessage({ text: 'An error occurred during sign in. Please try again.', type: 'error' });
            }
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage(null);
        setDomainToCopy(null);
        try {
            await signInWithGoogle();
        } catch (e: any) {
            console.error("Google Sign-In Error:", e);
            let msg = 'Google sign-in failed.';
            
            if (e.code === 'auth/popup-closed-by-user') {
                msg = 'Sign-in cancelled.';
            } else if (e.code === 'auth/unauthorized-domain') {
                const currentDomain = window.location.hostname;
                setDomainToCopy(currentDomain);
                msg = `SETUP REQUIRED: You must add this domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
            } else if (e.code === 'auth/operation-not-allowed') {
                msg = 'Google provider is disabled. Enable it in Firebase Console -> Authentication -> Sign-in method.';
            } else if (e.code === 'auth/popup-blocked') {
                msg = 'Popup blocked by browser. Please allow popups.';
            } else if (e.message) {
                msg = `Error (${e.code}): ${e.message}`;
            }
            
            setMessage({ text: msg, type: 'error' });
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setMessage({ text: 'Please enter your email address first.', type: 'error' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await sendPasswordReset(email);
            setMessage({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
        } catch (err: any) {
            console.error("Password Reset Error:", err);
            setMessage({ text: 'Failed to send password reset email. Please check the email address.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                <div className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-center text-white">{t('auth.welcome_back')}</h2>
                    
                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} label={t('auth.google_signin')} />
                    
                    {message && (
                        <div className={`text-sm p-3 rounded-md ${message.type === 'error' ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-green-900/30 text-green-300 border border-green-800'}`}>
                            <div className="flex items-start">
                                {message.type === 'error' && <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>}
                                <span>{message.text}</span>
                            </div>
                            {domainToCopy && (
                                <div className="mt-2 bg-black/40 p-2 rounded flex items-center justify-between">
                                    <code className="text-xs text-yellow-400 font-mono break-all">{domainToCopy}</code>
                                    <button 
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(domainToCopy)}
                                        className="text-gray-400 hover:text-white ml-2"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={14}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">{t('auth.or')}</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input 
                            type="email" 
                            name="email"
                            autoComplete="email"
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                            required 
                        />
                        <div>
                            <input 
                                type="password" 
                                name="password"
                                autoComplete="current-password"
                                placeholder={t('auth.password')} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red" 
                                required 
                            />
                            <div className="text-right mt-2">
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    className="text-sm text-hey-church-orange-400 hover:underline"
                                >
                                    {t('auth.forgot_password')}
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-hey-church-red hover:bg-opacity-90 disabled:bg-gray-600">
                           {loading ? <Loader2 className="animate-spin" /> : t('welcome.signin')}
                        </button>
                    </form>
                    <button onClick={onSwitchToSignUp} className="w-full text-center text-sm text-hey-church-orange-400 hover:underline">
                         {t('auth.no_account')} {t('auth.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
