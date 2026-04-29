# 🔧 Predictive Maintenance — Engineering Portfolio Project

> Analyzed 10,000 CNC machine records, built a 97.4% AUC failure 
> predictor, and automated publishing results to LinkedIn.

## 📊 Results
| Metric | Value |
|--------|-------|
| Dataset | AI4I 2020 (UCI ML, 10,000 rows) |
| Model | Random Forest Classifier |
| ROC-AUC | 97.4% |
| Top Predictor | Tool Wear [min] |

## 🛠 Tech Stack
Python · Pandas · Scikit-learn · Matplotlib · Seaborn · LinkedIn API

## 📁 Files
- `mechanical_analysis.py` — EDA + ML model
- `linkedin_automation.py` — Auto-post pipeline

## 🚀 How to Run
pip install ucimlrepo pandas scikit-learn matplotlib seaborn
python mechanical_analysis.py
