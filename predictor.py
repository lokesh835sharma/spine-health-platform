import os
import numpy as np
import joblib
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load all models once at import time
_pca = joblib.load(os.path.join(MODELS_DIR, "pca.pkl"))
_kmeans = joblib.load(os.path.join(MODELS_DIR, "kmeans.pkl"))
_ss_seated = joblib.load(os.path.join(MODELS_DIR, "ss_seated.pkl"))
_ss_ohe = joblib.load(os.path.join(MODELS_DIR, "ss_ohe.pkl"))
_ss_oe = joblib.load(os.path.join(MODELS_DIR, "ss_oe.pkl"))
_oe = joblib.load(os.path.join(MODELS_DIR, "oe.pkl"))

RISK_MAP = {
    0: {
        "label": "High Risk",
        "level": "high",
        "score": 75,
        "color": "#FF6B35",
        "icon": "⚠️",
        "description": "You show significant indicators of spinal health concerns, including family history and moderate symptoms. Proactive intervention is strongly recommended.",
        "urgency": "Action Required"
    },
    1: {
        "label": "Very High Risk",
        "level": "very-high",
        "score": 95,
        "color": "#FF2D55",
        "icon": "🚨",
        "description": "You exhibit multiple severe risk factors including high pain levels, strong family history, and severe symptoms. Immediate medical consultation is strongly advised.",
        "urgency": "Immediate Attention Needed"
    },
    2: {
        "label": "Low Risk",
        "level": "low",
        "score": 20,
        "color": "#34C759",
        "icon": "✅",
        "description": "Your spine health indicators are favorable. You have low pain levels and minimal family history risk. Keep maintaining your healthy habits.",
        "urgency": "Maintain Healthy Habits"
    },
    3: {
        "label": "Moderate Risk",
        "level": "moderate",
        "score": 50,
        "color": "#FF9500",
        "icon": "⚡",
        "description": "You have lifestyle-driven risk factors that could escalate over time. Targeted improvements in posture and physical activity can significantly reduce your risk.",
        "urgency": "Prevention Recommended"
    }
}

RECOMMENDATIONS = {
    0: [  # High Risk
        {"icon": "🏥", "title": "Consult a Specialist", "text": "Schedule an appointment with an orthopedic specialist or physiotherapist within the next 2 weeks."},
        {"icon": "🧘", "title": "Core Strengthening", "text": "Begin a supervised physiotherapy program focusing on core muscle strengthening and spinal stabilization."},
        {"icon": "💺", "title": "Ergonomic Setup", "text": "Invest in an ergonomic chair and desk setup. Ensure your monitor is at eye level and your lower back is fully supported."},
        {"icon": "⏱️", "title": "Movement Breaks", "text": "Take a 5-minute movement break every 30 minutes. Use standing desks or walking meetings when possible."},
        {"icon": "🛏️", "title": "Sleep Optimization", "text": "Use a medium-firm mattress and a supportive pillow aligned with your spine's natural curvature."},
        {"icon": "🏃", "title": "Low-Impact Exercise", "text": "Swimming, walking, or cycling 3-4 times per week can significantly reduce spinal stress and pain."}
    ],
    1: [  # Very High Risk
        {"icon": "🚨", "title": "Immediate Medical Consultation", "text": "Please consult a spine specialist or orthopedic doctor as soon as possible. Do not delay treatment."},
        {"icon": "📋", "title": "Comprehensive Spine Assessment", "text": "Request an MRI or X-ray to get a full picture of your spinal health and identify any structural issues."},
        {"icon": "💊", "title": "Pain Management Plan", "text": "Work with your doctor to create a comprehensive pain management plan including medication, physical therapy, and lifestyle changes."},
        {"icon": "🧘", "title": "Gentle Yoga & Stretching", "text": "Under medical supervision, incorporate gentle yoga and targeted stretching to improve spinal flexibility."},
        {"icon": "🚫", "title": "Activity Modification", "text": "Avoid heavy lifting, prolonged sitting, and activities that aggravate your pain until properly evaluated."},
        {"icon": "🧬", "title": "Genetic Risk Awareness", "text": "Given your family history, discuss genetic predisposition to spinal conditions with your doctor for preventive planning."}
    ],
    2: [  # Low Risk
        {"icon": "🏋️", "title": "Stay Active", "text": "Continue your current exercise routine. Aim for 150 minutes of moderate activity per week to maintain spinal health."},
        {"icon": "🥗", "title": "Anti-Inflammatory Diet", "text": "Maintain an anti-inflammatory diet rich in omega-3s, leafy greens, and whole grains to support spinal disc health."},
        {"icon": "💧", "title": "Stay Hydrated", "text": "Drink 8-10 glasses of water daily to keep spinal discs hydrated and maintain their shock-absorbing capacity."},
        {"icon": "🧘", "title": "Posture Awareness", "text": "Maintain awareness of your posture during daily activities. Practice daily stretching to preserve flexibility."},
        {"icon": "😴", "title": "Quality Sleep", "text": "Maintain your good sleep habits. Quality sleep is essential for spinal recovery and tissue repair."},
        {"icon": "📅", "title": "Annual Check-up", "text": "Schedule annual spinal health check-ups to monitor any changes, especially given family history factors."}
    ],
    3: [  # Moderate Risk
        {"icon": "🖥️", "title": "Reduce Screen Time", "text": "Limit OTT/screen use to 2 hours of continuous viewing. Use the 20-20-20 rule to reduce neck strain."},
        {"icon": "🏃", "title": "Increase Physical Activity", "text": "Gradually increase your exercise to at least 30 minutes daily. Mix cardio with strength training for optimal spine support."},
        {"icon": "📐", "title": "Posture Correction", "text": "Practice posture correction exercises. Consider a posture corrector brace or physiotherapy for structural alignment."},
        {"icon": "⏰", "title": "Sitting Time Reduction", "text": "Reduce continuous sitting by taking active breaks every 25 minutes. A standing desk can reduce spinal load by up to 30%."},
        {"icon": "🛌", "title": "Sleep Position", "text": "Experiment with sleeping positions and pillow types to find what minimizes morning stiffness and neck discomfort."},
        {"icon": "🧘", "title": "Stress Management", "text": "Chronic stress increases muscle tension around the spine. Incorporate meditation or breathing exercises into your routine."}
    ]
}


def predict(form_data: dict) -> dict:
    """
    Takes cleaned form data, runs full pipeline, returns prediction + context.
    """
    # Extract values
    sitting_hours = float(form_data["sitting_hours"])
    gender_val = 1.0 if form_data["gender"] == "Male" else 0.0
    morning_stiffness = form_data["morning_stiffness"]
    persistent_pain = form_data["persistent_pain"]
    sitting_posture = form_data["sitting_posture"]
    sleeping_posture = form_data["sleeping_posture"]
    sleep_turning = form_data["sleep_turning"]
    sleep_quality = form_data["sleep_quality"]
    physical_activity = form_data["physical_activity"]
    ott_usage = form_data["ott_usage"]
    family_backpain = form_data["family_backpain"]
    gut_infection = form_data["gut_infection"]

    # Scale seated hours
    seated_scaled = _ss_seated.transform([[sitting_hours]])[0][0]

    # Scale OHE gender
    gender_scaled = _ss_ohe.transform([[gender_val]])[0][0]

    # Ordinal encode categoricals
    cat_input = [[
        morning_stiffness, persistent_pain, sitting_posture, sleeping_posture,
        sleep_turning, sleep_quality, physical_activity, ott_usage,
        family_backpain, gut_infection
    ]]
    oe_encoded = _oe.transform(cat_input)[0]
    oe_scaled = _ss_oe.transform([oe_encoded])[0]

    # Build feature vector: [seated_scaled, gender_scaled, oe_cols...]
    X_input = np.array([[seated_scaled, gender_scaled] + list(oe_scaled)])

    # PCA transform
    X_pca = _pca.transform(X_input)
    pc1 = float(X_pca[0][0])
    pc2 = float(X_pca[0][1])

    # Predict cluster
    cluster = int(_kmeans.predict(X_pca)[0])

    risk = RISK_MAP[cluster]
    recs = RECOMMENDATIONS[cluster]

    # Compute contributing factors from raw encoded values
    factors = _compute_factors(form_data, oe_encoded)

    return {
        "cluster": cluster,
        "risk_label": risk["label"],
        "risk_level": risk["level"],
        "risk_score": risk["score"],
        "risk_color": risk["color"],
        "risk_icon": risk["icon"],
        "risk_description": risk["description"],
        "urgency": risk["urgency"],
        "recommendations": recs,
        "contributing_factors": factors,
        "pc1": round(pc1, 4),
        "pc2": round(pc2, 4),
        "user_point": {"pc1": round(pc1, 4), "pc2": round(pc2, 4)},
        "summary": _build_summary(form_data)
    }


def _compute_factors(form_data: dict, oe_encoded) -> list:
    factors = []
    labels = [
        ("Morning Stiffness", oe_encoded[0], 3),
        ("Persistent Pain", oe_encoded[1], 3),
        ("Sitting Posture", oe_encoded[2], 2),
        ("Sleep Turning Issues", oe_encoded[4], 3),
        ("Sleep Quality", oe_encoded[5], 3),
        ("Physical Inactivity", oe_encoded[6], 3),
        ("OTT/Screen Usage", oe_encoded[7], 3),
        ("Family Back Pain History", oe_encoded[8], 2),
        ("Gut Infection History", oe_encoded[9], 2),
    ]
    for name, val, max_val in labels:
        pct = round((float(val) / max_val) * 100)
        level = "low" if pct <= 33 else "moderate" if pct <= 66 else "high"
        factors.append({"name": name, "percentage": pct, "level": level})
    return sorted(factors, key=lambda x: -x["percentage"])


def _build_summary(form_data: dict) -> list:
    return [
        {"label": "Age", "value": form_data.get("age", "N/A")},
        {"label": "Gender", "value": form_data["gender"]},
        {"label": "Daily Sitting Hours", "value": f"{form_data['sitting_hours']} hrs"},
        {"label": "Morning Stiffness", "value": form_data["morning_stiffness"]},
        {"label": "Persistent Pain", "value": form_data["persistent_pain"]},
        {"label": "Sitting Posture", "value": form_data["sitting_posture"]},
        {"label": "Sleep Quality", "value": form_data["sleep_quality"]},
        {"label": "Physical Activity", "value": form_data["physical_activity"]},
    ]


def get_cluster_stats() -> dict:
    """Returns cluster center positions for analytics visualization."""
    centers = _kmeans.cluster_centers_
    return {
        "centers": [{"pc1": float(c[0]), "pc2": float(c[1])} for c in centers],
        "explained_variance": [round(float(v) * 100, 1) for v in _pca.explained_variance_ratio_]
    }
