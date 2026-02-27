from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os
import xgboost

# Print version (for debugging)
print("XGBoost Version:", xgboost.__version__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "student_interest_model.pkl")

print("Loading model from:", MODEL_PATH)

model = joblib.load(MODEL_PATH)

print("Model loaded successfully.")
print("Model classes:", model.classes_)

app = FastAPI(title="AI-ML-Cyber Classifier API")

# Class mapping
interest_map = {
    0: "AI",
    1: "ML",
    2: "Cyber"
}

# Input validation (only 1–3 allowed)
class StudentInput(BaseModel):
    Q1: int = Field(..., ge=1, le=3)
    Q2: int = Field(..., ge=1, le=3)
    Q3: int = Field(..., ge=1, le=3)
    Q4: int = Field(..., ge=1, le=3)
    Q5: int = Field(..., ge=1, le=3)

@app.get("/")
def home():
    return {"message": "AI-ML-Cyber API Running Successfully"}

@app.post("/predict")
def predict(data: StudentInput):

    input_data = np.array([[data.Q1, data.Q2, data.Q3, data.Q4, data.Q5]])
    input_data = np.array([[data.Q1, data.Q2, data.Q3, data.Q4, data.Q5]])

    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]

    return {
        "predicted_class_number": int(prediction),
        "predicted_field": interest_map[int(prediction)],
        "confidence_percent": round(float(max(probabilities) * 100), 2),
        "probabilities": {
            "AI": round(float(probabilities[0] * 100), 2),
            "ML": round(float(probabilities[1] * 100), 2),
            "Cyber": round(float(probabilities[2] * 100), 2),
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)