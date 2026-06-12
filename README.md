# 🧠 Spine Health Risk Assessment Platform

> ML-powered spinal health risk prediction using PCA + K-Means Clustering

**Live Demo:** https://spine-health-platform.onrender.com

---

## 📌 Project Summary

A full-stack healthcare machine learning platform that predicts spinal health risk from 14 lifestyle and medical indicators. Built as a portfolio showcase for Amazon ML Summer School, internship applications, and GitHub portfolios.

---

## 🤖 ML Pipeline

```
User Input (14 Qs)
       ↓
Preprocessing
  ├── Age & Sitting Hours → StandardScaler (ss_seated.pkl)
  ├── Gender → OHE (drop first) → StandardScaler (ss_ohe.pkl)
  └── 10 Categorical → OrdinalEncoder (oe.pkl) → StandardScaler (ss_oe.pkl)
       ↓
Feature Vector [12D: seated, gender_ohe, 10 OE cols]
       ↓
PCA (pca.pkl) → [2D: PC1, PC2]
  PC1 = Pain axis (stiffness, pain, family history)
  PC2 = Lifestyle axis (sitting, OTT, activity)
       ↓
K-Means (kmeans.pkl, k=4)
  Cluster 0 → High Risk
  Cluster 1 → Very High Risk
  Cluster 2 → Low Risk
  Cluster 3 → Moderate Risk
       ↓
Risk Report + 6 Personalized Recommendations
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 + Flask |
| ML | scikit-learn 1.6.1, NumPy, Joblib |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js 4.4 |
| Deployment | Render (backend) |

---

## 📁 Folder Structure

```
spine-health-platform/
├── app.py                  # Flask routes
├── predictor.py            # ML prediction engine
├── requirements.txt
├── render.yaml             # Render deployment config
├── models/
│   ├── pca.pkl
│   ├── kmeans.pkl
│   ├── ss_seated.pkl
│   ├── ss_ohe.pkl
│   ├── ss_oe.pkl
│   └── oe.pkl
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── assessment.html
│   ├── result.html
│   ├── analytics.html
│   └── about.html
└── static/
    ├── css/style.css
    └── js/
        ├── main.js
        ├── assessment.js
        ├── result.js
        └── analytics.js
```

---

## 🚀 Run Locally

```bash
# Clone and install
pip install -r requirements.txt

# Run
python app.py

# Visit
http://localhost:5000
```

---

## 📊 Dataset

- 85 original survey responses
- Extended to 250 via NumPy synthetic augmentation
- Collected via Google Forms

---

## 🔬 Algorithms Used

| Algorithm | Role |
|---|---|
| PCA | Dimensionality reduction (12D → 2D) |
| K-Means++ | Risk cluster assignment |
| DBSCAN | Explored, not selected |
| Hierarchical | Validation of k=4 |
| Gaussian Mixture | Soft-assignment alternative |

---

## 📝 Resume Description

> Developed a full-stack machine learning web application for spinal health risk assessment. Implemented PCA and K-Means based risk prediction using 14 lifestyle and medical indicators. Designed and deployed an interactive health assessment platform with real-time ML inference and personalized recommendations.

---

## ⚕️ Disclaimer

This tool is for educational purposes only. Not a substitute for professional medical advice.
