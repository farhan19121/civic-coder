import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('english'); // 'english' or 'hindi'

  const translations = {
    english: {
      title: "Describe your symptoms",
      placeholder: "Enter Your Symptoms",
      submit: "Submit",
      clear: "Clear",
      analyzing: "Analyzing...",
      diagnosisResult: "Diagnosis Result",
      condition: "Condition:",
      confidence: "Confidence:",
      matchedSymptoms: "Matched Symptoms:",
      recommendation: "Recommendation:",
      features: "Features",
      multilingualNLP: "Multilingual NLP",
      aiSymptomChecker: "AI Symptom Checker",
      offlineFunctionality: "Offline Functionality",
      benefitsTitle: "How ChikitsaAI Helps",
      doctorShortages: "Doctor Shortages",
      doctorShortagesText: "AI-driven diagnostics provide initial assessments, reducing the need for immediate doctor visits.",
      languageBarriers: "Language Barriers",
      languageBarriersText: "Multilingual NLP supports multiple Indian languages, bridging communication gaps.",
      diagnosticGaps: "Diagnostic Gaps",
      diagnosticGapsText: "AI algorithms analyze symptoms to suggest potential conditions, aiding in preliminary diagnosis.",
      limitedAccess: "Limited Access",
      limitedAccessText: "SMS-based care extends reach to remote areas with limited internet connectivity."
    },
    hindi: {
      title: "अपने लक्षणों का वर्णन करें",
      placeholder: "अपने लक्षण दर्ज करें",
      submit: "जमा करें",
      clear: "साफ करें",
      analyzing: "विश्लेषण कर रहे हैं...",
      diagnosisResult: "निदान परिणाम",
      condition: "स्थिति:",
      confidence: "विश्वास स्तर:",
      matchedSymptoms: "मिलान किए गए लक्षण:",
      recommendation: "सिफारिश:",
      features: "विशेषताएं",
      multilingualNLP: "बहुभाषी एनएलपी",
      aiSymptomChecker: "एआई लक्षण जांचकर्ता",
      offlineFunctionality: "ऑफ़लाइन कार्यक्षमता",
      benefitsTitle: "चिकित्सा एआई कैसे मदद करता है",
      doctorShortages: "डॉक्टरों की कमी",
      doctorShortagesText: "एआई-संचालित निदान प्रारंभिक आकलन प्रदान करते हैं, जिससे तुरंत डॉक्टर के पास जाने की आवश्यकता कम हो जाती है।",
      languageBarriers: "भाषा बाधाएं",
      languageBarriersText: "बहुभाषी एनएलपी कई भारतीय भाषाओं का समर्थन करता है, संचार अंतराल को पाटता है।",
      diagnosticGaps: "नैदानिक अंतराल",
      diagnosticGapsText: "एआई एल्गोरिदम संभावित स्थितियों का सुझाव देने के लिए लक्षणों का विश्लेषण करते हैं, प्रारंभिक निदान में सहायता करते हैं।",
      limitedAccess: "सीमित पहुंच",
      limitedAccessText: "एसएमएस-आधारित देखभाल सीमित इंटरनेट कनेक्टिविगत वाले दूरदराज के क्षेत्रों तक पहुंच बढ़ाती है।"
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    
    try {
      const endpoint = language === 'hindi' ? '/predict-hindi' : '/predict';
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: language === 'hindi' 
          ? "क्षमा करें, निदान सेवा से कनेक्ट होने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।"
          : "Sorry, I'm having trouble connecting to the diagnosis service. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setResult(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'hindi' : 'english');
    setInputValue('');
    setResult(null);
  };

  return (
    <div className="app-container">
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'english' ? 'हिंदी' : 'English'}
        </button>
      </div>
      
      <h1 className="app-title">{t.title}</h1>
      
      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          className="symptom-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.placeholder}
          rows="4"
        />
        
        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? t.analyzing : t.submit}
          </button>
          <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
            {t.clear}
          </button>
        </div>
      </form>

      {result && (
        <div className="result-container">
          {result.error ? (
            <p className="error-message">{result.error}</p>
          ) : (
            <>
              <h3>{t.diagnosisResult}</h3>
              <div className="result-item">
                <strong>{t.condition}</strong> {result.predicted_disease}
              </div>
              <div className="result-item">
                <strong>{t.confidence}</strong> {(result.confidence_score * 100).toFixed(1)}%
              </div>
              {result.symptoms_matched.length > 0 && (
                <div className="result-item">
                  <strong>{t.matchedSymptoms}</strong>
                  <ul>
                    {result.symptoms_matched.map((symptom, index) => (
                      <li key={index}>{symptom.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="result-item">
                <strong>{t.recommendation}</strong> {result.recommendation}
              </div>
            </>
          )}
        </div>
      )}

      <div className="features-section">
        <h2>{t.features}</h2>
        
        <div className="feature-card">
          <h3>{t.multilingualNLP}</h3>
          <ul>
            <li><strong>{t.aiSymptomChecker}</strong></li>
            <li><strong>{t.offlineFunctionality}</strong></li>
          </ul>
        </div>
      </div>

      <div className="benefits-section">
        <h2>{t.benefitsTitle}</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <h4>{t.doctorShortages}</h4>
            <p>{t.doctorShortagesText}</p>
          </div>
          
          <div className="benefit-card">
            <h4>{t.languageBarriers}</h4>
            <p>{t.languageBarriersText}</p>
          </div>
          
          <div className="benefit-card">
            <h4>{t.diagnosticGaps}</h4>
            <p>{t.diagnosticGapsText}</p>
          </div>
          
          <div className="benefit-card">
            <h4>{t.limitedAccess}</h4>
            <p>{t.limitedAccessText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;