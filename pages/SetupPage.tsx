import React from 'react';
import { Database, AlertTriangle, ExternalLink } from 'lucide-react';

const SetupPage: React.FC<{ error?: string, source?: string }> = ({ error, source }) => {
  const renderErrorMessage = () => {
    if (!error) return null;

    let specificGuidance = "The configuration seems to be present, but the connection failed. Please go through the troubleshooting checklist below.";
    if (source === 'none') {
        specificGuidance = "We couldn't find a Firebase configuration. The recommended way to fix this is by adding your configuration object to the `index.html` file.";
    }

    return (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
            <h3 className="font-bold flex items-center"><AlertTriangle className="mr-2" />Initialization Failed</h3>
            <p className="text-sm mt-2 font-mono bg-red-800/50 p-2 rounded">{error}</p>
            <p className="text-sm mt-3 pt-3 border-t border-red-800">{specificGuidance}</p>
        </div>
    );
  };
  
  const configHtmlExample = `
<script>
  window.HEYCHURCH_APP_CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    
    FIREBASE_CONFIG: {
      // Paste your entire Firebase config object here
      apiKey: "AIza...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      // ... and so on
    },
  };
</script>
  `.trim();

  return (
    <div className="min-h-screen bg-hey-church-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-block bg-hey-church-green p-4 rounded-full mb-4">
            <Database className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Connect Your Firebase Project</h1>
          <p className="text-gray-400 mt-2">To run this app, you need to link it to your own Firebase backend.</p>
        </div>

        {renderErrorMessage()}
        
         <div className="space-y-4 text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg">
            <p className="font-bold text-base text-hey-church-yellow">How to Fix This</p>
            <p>The only step required is to edit the <code className="bg-gray-700 p-1 rounded text-hey-church-orange-300">index.html</code> file in the file explorer and paste in your Firebase and Gemini configurations.</p>
            <pre className="bg-black/50 p-3 rounded-md text-xs overflow-x-auto text-gray-400">
                <code>{configHtmlExample}</code>
            </pre>
        </div>

        <div className="space-y-4 text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg">
            <p className="font-bold text-base text-hey-church-yellow">Troubleshooting Checklist</p>
            <p className="text-xs text-gray-400">If the app still isn't starting after you've edited `index.html`, please verify these steps in your Firebase Console.</p>
            
            <ul className="space-y-3 mt-2">
                 <li className="flex items-start">
                    <span className="font-bold text-hey-church-orange-400 mr-2">1.</span>
                    <div>
                        <p className="font-semibold">Enable Email/Password Authentication</p>
                        <p className="text-xs text-gray-400">This is the most common issue. In your Firebase Console, go to <span className="font-bold">Authentication &rarr; Sign-in method</span> and make sure the "Email/Password" provider is <span className="font-bold text-hey-church-yellow">Enabled</span>.</p>
                    </div>
                </li>
                 <li className="flex items-start">
                    <span className="font-bold text-hey-church-orange-400 mr-2">2.</span>
                    <div>
                        <p className="font-semibold">Create a Firestore Database</p>
                        <p className="text-xs text-gray-400">In your Firebase Console, go to <span className="font-bold">Firestore Database</span> and click "Create database". You can start in <span className="font-bold">Test Mode</span> for easy setup.</p>
                    </div>
                </li>
            </ul>
             <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="mt-4 block w-full text-center bg-gray-700 hover:bg-gray-600 font-bold py-2 px-4 rounded-lg text-sm">
                Go to Firebase Console <ExternalLink className="inline ml-1" size={14}/>
            </a>
        </div>
        
        <div className="text-center text-xs text-gray-500">
            <p>Once your Firebase project is configured correctly and your `index.html` file is saved, this app will automatically reload and start.</p>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;