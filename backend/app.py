import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os
import re
import threading
import time
import json
import joblib


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
