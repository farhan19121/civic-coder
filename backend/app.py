
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import traceback
import re
import json
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os
import threading
import time
from collections import defaultdict
from googletrans import Translator
import langdetect

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication


translator = Translator()
# ========== Global Variables and Cache ========== #

MODEL_PATH = 'model.joblib'
SYMPTOM_LIST_PATH = 'symptom_list.json'
TRAINING_DATA_PATH = './Training.csv'

model = None
symptom_list = []
le_prognosis = None  # LabelEncoder for prognosis/disease

# Cache for symptom vectors predictions {frozenset(symptoms): (disease, confidence)}
prediction_cache = {}
cache_lock = threading.Lock()


# ========== Utility Functions ==========

def load_training_data(path):
    df = pd.read_csv(path)
    return df

def preprocess_training_data(df):
    # Extract features (symptoms) and target (prognosis)
    features = df.columns[:-1]  # All except 'prognosis'
    X = df[features].values
    y_raw = df['prognosis'].values
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    return X, y, features.tolist(), le

def train_and_save_model():
    df = load_training_data(TRAINING_DATA_PATH)
    X, y, features, le = preprocess_training_data(df)
    clf = RandomForestClassifier(n_estimators=150, random_state=42)
    clf.fit(X, y)
    joblib.dump({'model': clf, 'le': le, 'features': features}, MODEL_PATH)
    with open(SYMPTOM_LIST_PATH, 'w') as f:
        json.dump(features, f)
    return clf, le, features

def load_model():
    global model, le_prognosis, symptom_list
    if os.path.exists(MODEL_PATH) and os.path.exists(SYMPTOM_LIST_PATH):
        data = joblib.load(MODEL_PATH)
        model = data['model']
        le_prognosis = data['le']
        with open(SYMPTOM_LIST_PATH, 'r') as f:
            symptom_list = json.load(f)
    else:
        model, le_prognosis, symptom_list = train_and_save_model()


def clean_text(text):
    """
    Normalize text:
    - Lowercase
    - Remove punctuation except '-'
    - Replace multiple spaces with one
    """
    text = text.lower()
    # Keep letters, digits, spaces, and hyphens (because symptom names can be hyphenated)
    text = re.sub(r"[^a-z0-9\s\-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_symptoms(text, known_symptoms):
    """
    Using simple keyword matching (considering whole words),
    extracting matched symptoms from text.
    """
    symptoms_found = set()
    # Prepareing lowercase known symptoms for matching
    # Map normalized symptom names for in-text matching
    normalized_symptoms = {}
    for sym in known_symptoms:
        nsym = sym.replace('_', ' ').lower()
        normalized_symptoms[nsym] = sym

    #converting text to tokens set
    text_tokens = set(text.split())

    # Match symptoms which appear as full words or word sequences in user text
    # Check for multi-word symptoms (like 'nodal skin eruptions')
    for n_sym, original_sym in normalized_symptoms.items():
        n_sym_tokens = n_sym.split()
        # Sliding window in text tokens sequence:
        # Since we have set(text_tokens), we need string matching on text itself:
        # We'll do simple substring matching allowing for word boundaries
        pattern = r'\b' + re.escape(n_sym) + r'\b'
        if re.search(pattern, text):
            symptoms_found.add(original_sym)
        else:
            # Also check if all tokens appear in text tokens (fuzzy)
            if all(t in text_tokens for t in n_sym_tokens):
                symptoms_found.add(original_sym)

    return list(symptoms_found)

def symptoms_to_vector(symptoms, all_symptoms):
    """
    Create binary vector for ML model input,
    1 if symptom present else 0, in the order of all_symptoms list.
    """
    vector = np.zeros(len(all_symptoms), dtype=int)
    symptom_set = set(symptoms)
    for idx, sym in enumerate(all_symptoms):
        if sym in symptom_set:
            vector[idx] = 1
    return vector.reshape(1, -1)

def predict_disease(symptom_vector):
    """
    Uses the global model to predict:
    Returns predicted disease string, confidence score (probability max)
    """
    global model, le_prognosis
    proba = model.predict_proba(symptom_vector)[0]
    max_prob_idx = np.argmax(proba)
    confidence = float(proba[max_prob_idx])
    disease_raw = le_prognosis.inverse_transform([max_prob_idx])[0]
    return disease_raw, confidence


def recommendation_by_confidence(confidence, symptoms):
    """
    Generateing a simple recommendation text based on confidence and symptoms.
    Always recommend professional consultation.
    """
    serious_symptoms = {
        # sample serious symptoms, extend as needed
        'chest_pain', 'breathlessness', 'severe_headache', 'unconsciousness', 'blurred_vision',
        'vomiting', 'persistent_fever', 'loss_of_consciousness'
    }
    symptoms_set = set(symptoms)
    if confidence < 0.4:
        return "Symptoms are unclear; please monitor your health and consult a healthcare professional if symptoms persist."
    if symptoms_set.intersection(serious_symptoms):
        return "Your symptoms may indicate a serious condition. Please seek urgent medical attention."
    return "Consult a healthcare professional for a precise diagnosis."

def make_response(predicted_disease, confidence_score, symptoms_matched, recommendation):
    return {
        "predicted_disease": predicted_disease,
        "confidence_score": round(confidence_score, 3),
        "symptoms_matched": symptoms_matched,
        "recommendation": recommendation,
        "disclaimer": "This is a preliminary screening tool only. It does not substitute professional medical advice."
    }

def cache_get(symptoms_key):
    with cache_lock:
        return prediction_cache.get(symptoms_key, None)


def cache_set(symptoms_key, prediction_result):
    with cache_lock:
        if len(prediction_cache) > 1000:  # Simple cache size limit
            # Pop oldest item (not efficient but sufficient here)
            prediction_cache.pop(next(iter(prediction_cache)))
        prediction_cache[symptoms_key] = prediction_result


# Background cleanup thread for cache (optional, here for demonstration)
def cache_cleanup_loop():
    while True:
        time.sleep(300)  # Every 5 minutes
        with cache_lock:
            if len(prediction_cache) > 1000:
                # clear half cache
                keys = list(prediction_cache.keys())
                for k in keys[:len(keys)//2]:
                    prediction_cache.pop(k)


cache_cleanup_thread = threading.Thread(target=cache_cleanup_loop, daemon=True)
cache_cleanup_thread.start()


def translate_to_hindi(text):
    """Translate text to Hindi if it's not already in Hindi"""
    try:
        # First detect language
        if langdetect.detect(text) != 'hi':
            translated = translator.translate(text, dest='hi')
            return translated.text
        return text
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original if translation fails

def translate_response_to_hindi(response):
    """Translate the entire response to Hindi"""
    try:
        translated_response = {
            "predicted_disease": translate_to_hindi(response["predicted_disease"]),
            "confidence_score": response["confidence_score"],  # No translation needed for numbers
            "symptoms_matched": [translate_to_hindi(sym) for sym in response["symptoms_matched"]],
            "recommendation": translate_to_hindi(response["recommendation"]),
            "disclaimer": translate_to_hindi(response["disclaimer"])
        }
        return translated_response
    except Exception as e:
        print(f"Response translation error: {e}")
        return response  # Return original if translation fails


# ========== backend(Flask Routes) ========== # 

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field in JSON input."
            }), 400

        user_text = str(data['text'])
        if len(user_text.strip()) == 0:
            return jsonify({
                "error": "Input text is empty."
            }), 400

        # Clean and normalize input text
        cleaned_text = clean_text(user_text)

        # Extract symptoms from text using known symptoms list
        matched_symptoms = extract_symptoms(cleaned_text, symptom_list)

        # If no symptoms matched, return partial info but recommend professional consult
        if len(matched_symptoms) == 0:
            response = make_response(
                predicted_disease="Unknown",
                confidence_score=0.0,
                symptoms_matched=[],
                recommendation="Could not identify clear symptoms from input. Please provide specific symptoms or consult a healthcare professional."
            )
            return jsonify(response)

        # Check cache for prediction on matched symptoms (order independent)
        symptoms_key = frozenset(matched_symptoms)
        cached_result = cache_get(symptoms_key)
        if cached_result is not None:
            return jsonify(cached_result)

        # Vectorize symptoms for prediction
        symptom_vector = symptoms_to_vector(matched_symptoms, symptom_list)

        # Predict disease and confidence
        disease, confidence = predict_disease(symptom_vector)

        # Limit confidence and do not overstate certainty
        if confidence < 0.35:
            disease = "Uncertain"
            confidence = float(confidence)  # keep low confidence

        # Prepare recommendation text
        recommendation = recommendation_by_confidence(confidence, matched_symptoms)

        # Create response JSON
        response = make_response(
            predicted_disease=disease,
            confidence_score=confidence,
            symptoms_matched=matched_symptoms,
            recommendation=recommendation
        )

        # Cache result
        cache_set(symptoms_key, response)

        return jsonify(response)

    except Exception as e:
        # Log exception traceback internally - do not leak details to user
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error occurred processing your request."
        }), 500

@app.route('/predict-hindi', methods=['POST'])
def predict_hindi():
    try:
        data = request.get_json(force=True)
        if not data or 'text' not in data:
            return jsonify({
                "error": "इनपुट में 'text' फ़ील्ड गायब है।"  # "Missing 'text' field in input" in Hindi
            }), 400

        user_text = str(data['text'])
        if len(user_text.strip()) == 0:
            return jsonify({
                "error": "इनपुट खाली है।"  # "Input is empty" in Hindi
            }), 400

        # Clean and normalize input text (Hindi text will be preserved)
        cleaned_text = clean_text(user_text)

        # Extract symptoms from text using known symptoms list
        matched_symptoms = extract_symptoms(cleaned_text, symptom_list)

        # If no symptoms matched, return partial info but recommend professional consult
        if len(matched_symptoms) == 0:
            response = make_response(
                predicted_disease="अज्ञात",  # "Unknown"
                confidence_score=0.0,
                symptoms_matched=[],
                recommendation="इनपुट से स्पष्ट लक्षणों की पहचान नहीं की जा सकी। कृपया विशिष्ट लक्षण प्रदान करें या स्वास्थ्य देखभाल पेशेवर से परामर्श लें।"  # Hindi version of the message
            )
            return jsonify(translate_response_to_hindi(response))

        # Check cache for prediction on matched symptoms (order independent)
        symptoms_key = frozenset(matched_symptoms)
        cached_result = cache_get(symptoms_key)
        if cached_result is not None:
            return jsonify(translate_response_to_hindi(cached_result))

        # Vectorize symptoms for prediction
        symptom_vector = symptoms_to_vector(matched_symptoms, symptom_list)

        # Predict disease and confidence
        disease, confidence = predict_disease(symptom_vector)

        # Limit confidence and do not overstate certainty
        if confidence < 0.35:
            disease = "अनिश्चित"  # "Uncertain"
            confidence = float(confidence)  # keep low confidence

        # Prepare recommendation text
        recommendation = recommendation_by_confidence(confidence, matched_symptoms)

        # Create response JSON
        response = make_response(
            predicted_disease=disease,
            confidence_score=confidence,
            symptoms_matched=matched_symptoms,
            recommendation=recommendation
        )

        # Cache result
        cache_set(symptoms_key, response)

        # Translate response to Hindi
        hindi_response = translate_response_to_hindi(response)
        return jsonify(hindi_response)

    except Exception as e:
        # Log exception traceback internally - do not leak details to user
        traceback.print_exc()
        return jsonify({
            "error": "आपके अनुरोध को संसाधित करते समय आंतरिक सर्वर त्रुटि हुई।"  # "Internal server error occurred processing your request." in Hindi
        }), 500


if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5000, debug=False)