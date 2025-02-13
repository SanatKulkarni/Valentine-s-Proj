import React, { useState, useEffect } from 'react';
import { Heart, Send, Loader2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Letter viewing component – displays the letter content elegantly.
const LetterView = () => {
  const [isOpening, setIsOpening] = useState(true);
  const [letterData, setLetterData] = useState(null);
  const location = useLocation();
  const initialLetterData = location.state;

  useEffect(() => {
    const fetchLetter = async () => {
      if (initialLetterData) {
        setLetterData(initialLetterData);
      } else {
        // Extract letter ID from URL path (works for /letter/:id)
        const letterId = window.location.pathname.split('/').pop();
        try {
          const letterDoc = await getDoc(doc(db, "letters", letterId));
          if (letterDoc.exists()) {
            setLetterData(letterDoc.data());
          }
        } catch (error) {
          console.error("Error fetching letter:", error);
        }
      }
    };

    fetchLetter();

    // Wait for 1 second before showing the letter content
    const timer = setTimeout(() => {
      setIsOpening(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [initialLetterData]);

  if (!letterData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">Letter not found</h1>
          <p className="text-gray-600">This letter might have expired or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    // Adding perspective for the 3D effect
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-pink-200 flex items-center justify-center p-4" style={{ perspective: '1000px' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <AnimatePresence exitBeforeEnter>
          {isOpening ? (
            // Cover card with flip animation
            <motion.div
              key="cover"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-pink-50 rounded-lg shadow-xl p-8 relative overflow-hidden"
              style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
            >
              <Heart className="w-20 h-20 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          ) : (
            // Letter content card – explicitly rendered with no Y rotation.
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20, rotateY: 0 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-xl p-8"
              style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
            >
              <div className="prose prose-pink max-w-none">
                {letterData.letter.split('\n').map((line, index) =>
                  line.trim() && (
                    <p
                      key={index}
                      className={`mb-4 font-serif text-gray-800 leading-relaxed ${
                        letterData.language === 'hindi'
                          ? 'font-hindi text-lg'
                          : letterData.language === 'telugu'
                          ? 'font-telugu text-lg'
                          : ''
                      }`}
                    >
                      {line}
                    </p>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Main form component – generates the letter and shows its preview.
const LetterForm = () => {
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senderName: '',
    receiverName: '',
    language: 'english',
    script: 'native',
    relationshipType: 'first_time',
    gender: 'male'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`https://love-project-alpha.vercel.app/poem?${new URLSearchParams(formData)}`);
      const data = await response.json();
      const cleanedLetter = data.letter
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('*'))
        .join('\n');
      setLetter(cleanedLetter);
      
      // Generate a unique ID and share URL for the letter
      const letterId = nanoid(10);
      const letterUrl = `${window.location.origin}/letter/${letterId}`;
      setShareUrl(letterUrl);
      
      // Store the letter data in Firebase
      const letterData = {
        letter: cleanedLetter,
        language: formData.language,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "letters", letterId), letterData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'language' && { script: 'native' })
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const previewLetter = () => {
    navigate(`/letter/preview`, { 
      state: { 
        letter, 
        language: formData.language 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-pink-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <Heart className="w-12 h-12 text-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold text-red-600 mt-4 text-center">
            Valentine's Love Letter Generator
          </h1>
          <p className="text-pink-700 mt-2 text-center">
            Create a beautiful love letter for your special someone
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient's Name</label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="telugu">Telugu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Script</label>
                <select
                  name="script"
                  value={formData.script}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                  disabled={formData.language === 'english'}
                >
                  <option value="native">Native</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship Type</label>
                <select
                  name="relationshipType"
                  value={formData.relationshipType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                >
                  <option value="first_time">First Time Love</option>
                  <option value="in_relationship">In Relationship</option>
                  <option value="long_term">Long Term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Your Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    Generate Letter
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[url('https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center rounded-lg shadow-xl p-6 relative min-h-[600px]">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg" />
            <div className="relative h-full overflow-auto p-8">
              {letter ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="prose prose-pink max-w-none">
                    {letter.split('\n').map((line, index) =>
                      line.trim() && (
                        <p
                          key={index}
                          className={`mb-4 font-serif text-gray-800 leading-relaxed ${
                            formData.language === 'hindi'
                              ? 'font-hindi text-lg'
                              : formData.language === 'telugu'
                              ? 'font-telugu text-lg'
                              : ''
                          }`}
                        >
                          {line}
                        </p>
                      )
                    )}
                  </div>
                  
                  {shareUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 space-y-4"
                    >
                      <div className="flex items-center space-x-2 bg-pink-50 p-3 rounded-lg">
                        <LinkIcon className="w-5 h-5 text-pink-600" />
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 bg-transparent border-none focus:ring-0 text-pink-600 text-sm"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-pink-600" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={previewLetter}
                        className="w-full px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        Preview Letter
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center italic">
                    Your love letter will appear here...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LetterForm />} />
        <Route path="/letter/:id" element={<LetterView />} />
        <Route path="/letter/preview" element={<LetterView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
