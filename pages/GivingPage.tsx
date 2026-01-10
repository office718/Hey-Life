
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartHandshake, Lock, QrCode, X, CheckCircle, ExternalLink, Trophy, Gift, CreditCard } from 'lucide-react';
import { getGlobalContent, updateUserData } from '../services/firebaseService';
import { GlobalContent } from '../types';
import { useAuth } from '../App';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const GivingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number | string>(50);
    const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
    const [config, setConfig] = useState<GlobalContent['donation'] | null>(null);
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
    
    // Modal States
    const [showGivingModal, setShowGivingModal] = useState(false);
    const [step, setStep] = useState<'confirm' | 'embedded_payment' | 'processing_external' | 'success'>('confirm');
    const [showQr, setShowQr] = useState(false);
    
    // Updated amounts including 150 and 250
    const suggestedAmounts = [25, 50, 100, 150, 250];

    useEffect(() => {
        // Priority 1: Check Global Config (index.html)
        if (window.HEYCHURCH_APP_CONFIG?.PAYPAL_CLIENT_ID) {
            setPaypalClientId(window.HEYCHURCH_APP_CONFIG.PAYPAL_CLIENT_ID);
        }

        // Priority 2: Check Firestore (Admin Config)
        getGlobalContent().then(content => {
            if (content) {
                if (content.donation) setConfig(content.donation);
                // Only override if not already set by HTML config
                if (content.paypalClientId && !window.HEYCHURCH_APP_CONFIG?.PAYPAL_CLIENT_ID) {
                    setPaypalClientId(content.paypalClientId);
                }
            }
        });
    }, []);

    const handleAmountClick = (value: number) => {
        setAmount(value);
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    const handleStartGiving = () => {
        setStep('confirm');
        setShowGivingModal(true);
    };

    const handleProceed = () => {
        // If we have a Client ID, use the embedded flow
        if (paypalClientId) {
            setStep('embedded_payment');
        } else {
            // Fallback to external link flow
            handleExternalLinkPayment();
        }
    };

    const handleExternalLinkPayment = () => {
        const link = config?.paypalLink;
        if (!link) {
            alert('Donation link not configured. Please contact support.');
            return;
        }

        const finalAmount = typeof amount === 'number' ? amount : parseFloat(amount as string);
        let finalLink = link;

        // Smart Logic: If it's a paypal.me link, append the amount
        if (link.includes('paypal.me') && finalAmount > 0) {
            const cleanLink = link.endsWith('/') ? link.slice(0, -1) : link;
            finalLink = `${cleanLink}/${finalAmount}`;
        }

        // Open payment in new tab
        window.open(finalLink, '_blank');
        
        // Advance internal state
        setStep('processing_external');
    };

    const handleSuccess = async (details?: any) => {
        if (!user) return;
        
        console.log("Payment Successful", details);

        // Award Points
        try {
            await updateUserData(user.id, {
                points: (user.points || 0) + 500 // 500 Points for Generosity
            });
            setStep('success');
        } catch (e) {
            console.error("Failed to award points", e);
            setStep('success'); // Show success anyway for UX
        }
    };

    return (
        <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white relative">
            <button onClick={() => navigate('/my-plan')} className="flex items-center text-hey-church-orange-400 font-bold">
                <ArrowLeft size={20} className="mr-2"/> Back to Plan
            </button>
            
            <div className="text-center pt-4">
                <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-4">
                    <Gift size={40} className="text-white"/>
                </div>
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">Generosity</h1>
                <p className="text-gray-300 mt-3 max-w-xs mx-auto text-lg leading-relaxed">
                    "God loves a cheerful giver."<br/>
                    <span className="text-hey-church-orange-400 font-bold">Your gift changes lives.</span>
                </p>
            </div>

            {/* Main Giving Card */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-1 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
                {/* Gold Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

                <div className="bg-gray-900 rounded-[22px] p-6 space-y-8">
                    
                    {/* Amount Selector */}
                    <div>
                        <h2 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4 text-center">Select Your Gift</h2>
                        {/* Grid-cols-3 fits 6 items nicely (5 amounts + 1 custom) */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {suggestedAmounts.map(val => (
                                <button 
                                    key={val}
                                    onClick={() => handleAmountClick(val)}
                                    className={`p-4 text-xl font-bold rounded-2xl border-2 transition-all duration-200 ${amount === val ? 'bg-white text-hey-church-bg border-white shadow-lg scale-[1.02]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    €{val}
                                </button>
                            ))}
                             {/* Custom input integrated into grid logic */}
                             <div className="relative col-span-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">€</span>
                                <input
                                    type="number"
                                    placeholder="Other"
                                    value={suggestedAmounts.includes(Number(amount)) ? '' : amount}
                                    onChange={handleCustomAmountChange}
                                    className="w-full h-full p-2 pl-6 bg-gray-800 border-2 border-gray-700 rounded-2xl text-center font-bold text-lg text-white focus:outline-none focus:border-hey-church-orange-400 transition-colors placeholder-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Frequency Toggle */}
                    <div className="bg-gray-800 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setFrequency('one-time')} 
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${frequency === 'one-time' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            One-Time
                        </button>
                        <button 
                            onClick={() => setFrequency('monthly')} 
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${frequency === 'monthly' ? 'bg-hey-church-red text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Monthly Partner
                        </button>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleStartGiving} 
                        className="w-full bg-gradient-to-r from-hey-church-orange-500 to-hey-church-red text-white font-black py-5 rounded-2xl flex items-center justify-center text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(239,68,68,0.3)]"
                    >
                        <HeartHandshake className="mr-3" size={24}/>
                        Give {typeof amount === 'number' || parseFloat(amount as string) > 0 ? `€${amount}` : ''}
                    </button>
                    
                    <div className="flex justify-center">
                         <button onClick={() => setShowQr(true)} className="flex items-center text-gray-500 text-sm hover:text-white transition-colors">
                            <QrCode size={16} className="mr-2"/> Scan QR Code instead
                        </button>
                    </div>

                     <p className="text-[10px] text-gray-600 text-center flex items-center justify-center">
                        <Lock size={10} className="mr-1.5"/> Secure SSL payment processing.
                    </p>
                </div>
            </div>

            {/* Giving Gateway Modal */}
            {showGivingModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-700 relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setShowGivingModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
                        
                        {/* Step 1: Confirmation */}
                        {step === 'confirm' && (
                            <div className="p-8 text-center space-y-6">
                                <div className="mx-auto w-20 h-20 bg-hey-church-blue/20 rounded-full flex items-center justify-center mb-4">
                                    <HeartHandshake size={40} className="text-hey-church-blue"/>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Confirm Your Gift</h3>
                                <p className="text-gray-300">
                                    You are about to give <span className="text-hey-church-yellow font-bold text-xl">€{amount}</span> to support the mission.
                                </p>
                                <div className="bg-gray-900/50 p-4 rounded-xl text-left border border-gray-700">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Impact</p>
                                    <p className="text-sm text-gray-300">Your generosity helps us create content, support the community, and reach more people with hope.</p>
                                </div>
                                <button 
                                    onClick={handleProceed}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-transform active:scale-95"
                                >
                                    Proceed to Payment <ExternalLink size={18} className="ml-2"/>
                                </button>
                            </div>
                        )}

                        {/* Step 2A: Embedded PayPal */}
                        {step === 'embedded_payment' && paypalClientId && (
                            <div className="p-6 overflow-y-auto">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">Select Payment Method</h3>
                                <PayPalScriptProvider options={{ 
                                    "clientId": paypalClientId, 
                                    currency: "EUR",
                                    components: "buttons",
                                    intent: "capture"
                                }}>
                                    <PayPalButtons 
                                        style={{ layout: "vertical", shape: "rect", color: "gold", label: "pay" }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [{
                                                    amount: {
                                                        value: amount.toString(),
                                                        currency_code: "EUR"
                                                    },
                                                    description: "Hey Life Donation"
                                                }],
                                                intent: "CAPTURE"
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            if (actions.order) {
                                                const details = await actions.order.capture();
                                                handleSuccess(details);
                                            }
                                        }}
                                        onError={(err) => {
                                            console.error("PayPal Error:", err);
                                            alert("Payment failed or was cancelled.");
                                        }}
                                    />
                                </PayPalScriptProvider>
                                <p className="text-xs text-center text-gray-500 mt-4">Secured by PayPal</p>
                            </div>
                        )}

                        {/* Step 2B: External Link Processing */}
                        {step === 'processing_external' && (
                            <div className="p-8 text-center space-y-8">
                                <div className="animate-pulse">
                                    <h3 className="text-2xl font-bold text-white mb-2">Waiting for you...</h3>
                                    <p className="text-sm text-gray-400">We've opened the payment page in a new tab.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 font-bold text-gray-400">1</div>
                                        <p className="text-left text-sm text-gray-400">Complete payment in the new browser tab.</p>
                                    </div>
                                    <div className="flex items-center p-4 bg-hey-church-blue/10 rounded-xl border border-hey-church-blue">
                                        <div className="w-8 h-8 rounded-full bg-hey-church-blue flex items-center justify-center mr-3 font-bold text-white animate-bounce">2</div>
                                        <p className="text-left text-sm text-white font-bold">Come back here and confirm to claim your reward!</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleSuccess()}
                                    className="w-full bg-hey-church-green text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all"
                                >
                                    <CheckCircle size={24} className="mr-2"/> I Have Completed My Gift
                                </button>
                                <button onClick={() => handleExternalLinkPayment()} className="text-xs text-gray-500 underline">Link didn't open? Click here.</button>
                            </div>
                        )}

                        {/* Step 3: Success Celebration */}
                        {step === 'success' && (
                            <div className="p-8 text-center relative overflow-hidden">
                                {/* Confetti Effect (CSS) */}
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div key={i} className="absolute w-2 h-4 animate-[fall_3s_ease-out_forwards]" style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `-20px`,
                                        backgroundColor: ['#FFD700', '#FF755D', '#ffffff'][i % 3],
                                        animationDelay: `${Math.random() * 0.5}s`,
                                        transform: `rotate(${Math.random() * 360}deg)`
                                    }}></div>
                                ))}
                                <style>{`@keyframes fall { to { transform: translateY(400px) rotate(720deg); opacity: 0; } }`}</style>

                                <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                                    <Trophy size={48} className="text-white"/>
                                </div>
                                <h3 className="text-3xl font-extrabold text-white mb-2">THANK YOU!</h3>
                                <p className="text-gray-300 mb-6">Your generosity is making a difference.</p>
                                
                                <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-xl mb-6">
                                    <p className="text-yellow-400 font-bold text-xl">+500 POINTS</p>
                                    <p className="text-yellow-200 text-xs uppercase tracking-wide">Generosity Bonus Earned</p>
                                </div>

                                <button 
                                    onClick={() => { setShowGivingModal(false); navigate('/my-plan'); }}
                                    className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition-colors"
                                >
                                    Return to My Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* QR Code Modal (unchanged but re-integrated) */}
            {showQr && config?.qrCodeUrl && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setShowQr(false)}>
                    <div className="bg-white p-6 rounded-3xl max-w-sm w-full relative text-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                            <X size={24}/>
                        </button>
                        <h3 className="text-black font-bold text-xl mb-4">Scan to Give</h3>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 mb-4">
                            <img src={config.qrCodeUrl} alt="Donation QR Code" className="w-full h-full object-contain"/>
                        </div>
                        <button onClick={() => setShowQr(false)} className="bg-black text-white font-bold py-3 px-6 rounded-xl w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GivingPage;
