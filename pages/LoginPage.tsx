
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Copy, HelpCircle } from 'lucide-react';
import { signInWithEmail, sendPasswordReset, signInWithGoogle } from '../services/firebaseService';
import { getFirebaseProjectId } from '../firebase/firebaseConfig';

const TroubleshootingBox: React.FC<{ code: string, domain?: string | null }> = ({ code, domain }) => {
    const currentProjectId = getFirebaseProjectId();
    const isDefaultProject = currentProjectId.includes('gen-lang-client');

    return (
        <div className="mt-4 p-4 bg-gray-900 border border-hey-church-orange-700/50 rounded-lg space-y-3">
            <p className="text-hey-church-orange-400 font-bold flex items-center text-xs uppercase tracking-widest">
                <HelpCircle size={14} className="mr-2" /> Troubleshooting Needed
            </p>
            
            {isDefaultProject && (
                <p className="text-[10px] text-yellow-200 leading-relaxed italic">
                    <span className="font-black text-hey-church-red">WARNING:</span> You are still using the default Project ID. Google login won't work until you update <code className="bg-black p-0.5 rounded">index.html</code> with your own project config.
                </p>
            )}

            {code === 'auth/unauthorized-domain' && domain && (
                <div className="space-y-2">
                    <p className="text-[10px] text-gray-300">1. Go to Firebase Console &rarr; Auth &rarr; Settings &rarr; Authorized Domains.</p>
                    <p className="text-[10px] text-gray-300">2. Add this domain:</p>
                    <div className="bg-black/50 p-2 rounded flex items-center justify-between">
                        <code className="text-[10px] text-hey-church-blue font-mono">{domain}</code>
                        <button onClick={() => navigator.clipboard.writeText(domain)} className="text-gray-500 hover:text-white"><Copy size={12}/></button>
                    </div>
                </div>
            )}

            {code === 'auth/operation-not-allowed' && (
                <p className="text-[10px] text-gray-300">Go to Firebase Console &rarr; Authentication &rarr; Sign-in method &rarr; Enable <span className="font-bold text-white">Google</span>.</p>
            )}

            {code === 'auth/popup-blocked' && (
                <p className="text-[10px] text-gray-300">Your browser blocked the sign-in popup. Please allow popups and try again.</p>
            )}
        </div>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@heychurch.de');
    const [password, setPassword] = useState('password');
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success', code?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [domainToCopy, setDomainToCopy] = useState<string | null>(null);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await signInWithEmail(email, password);
        } catch (err: any) {
            console.error("Login Error:", err);
            let msg = 'Failed to sign in. Please check your credentials.';
            if (err.code === 'auth/operation-not-allowed') {
                 msg = 'Sign-in method is not enabled. Please enable Email/Password sign-in in your Firebase console.';
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                msg = 'Admin account not found. Please go back and SIGN UP with this email first.';
            }
            setMessage({ text: msg, type: 'error', code: err.code });
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
                msg = `Domain not authorized. Please check your Firebase Console.`;
            } else if (e.code === 'auth/operation-not-allowed') {
                msg = 'Google provider is disabled in Firebase Console.';
            } else if (e.code === 'auth/popup-blocked') {
                msg = 'Popup blocked by browser.';
            } else if (e.message) {
                msg = e.message;
            }
            
            setMessage({ text: msg, type: 'error', code: e.code });
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
            setMessage({ text: 'Failed to send password reset email.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-hey-church-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <div className="inline-block bg-hey-church-red p-4 rounded-full mb-4">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                    <p className="text-gray-400 mt-2">Access the Hey Life dashboard.</p>
                </div>
                
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
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
                    Sign in with Google
                </button>

                {message && (
                    <div className="animate-in slide-in-from-top-2">
                        <div className={`text-sm p-3 rounded-md flex items-start ${message.type === 'error' ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-green-900/30 text-green-300 border border-green-800'}`}>
                            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>{message.text}</span>
                        </div>
                        {message.code && <TroubleshootingBox code={message.code} domain={domainToCopy} />}
                    </div>
                )}

                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <form className="space-y-6" onSubmit={handleAdminLogin}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="password"className="text-sm font-medium text-gray-300">Password</label>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-sm text-hey-church-orange-400 hover:underline focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-hey-church-red focus:border-hey-church-red"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-hey-church-red hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-hey-church-red disabled:bg-gray-500"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                 <button onClick={() => navigate('/welcome')} className="w-full text-center text-sm text-hey-church-orange-400 hover:underline mt-4">
                    Back to Welcome Page
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
