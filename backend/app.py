import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os
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
