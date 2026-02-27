const axios = require("axios");
const Questionnaire = require("../models/questionnaireModel");


// ================= SUBMIT QUESTIONNAIRE =================
exports.submitQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers } = req.body;

    if (!answers || answers.length !== 5) {
      return res.status(400).json({ message: "5 answers required" });
    }

    // Save questionnaire answers
    await Questionnaire.create({
      user: userId,
      answers,
    });

    // Call FastAPI ML model
    const response = await axios.post("http://127.0.0.1:8000/predict", {
      Q1: answers[0].score,
      Q2: answers[1].score,
      Q3: answers[2].score,
      Q4: answers[3].score,
      Q5: answers[4].score,
    });

    const predictedClass = response.data.predicted_class_number;
    const predictedField = response.data.predicted_field;
    const confidence = response.data.confidence_percent;

    res.json({
      message: "Prediction successful",
      cluster_label: predictedClass,
      recommendedDomain: predictedField,
      confidence: confidence + "%"
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
};


// ================= GET USER QUESTIONNAIRE =================
exports.getUserQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      user: req.user.id
    });

    if (!questionnaire) {
      return res.status(404).json({ message: "No questionnaire found" });
    }

    res.json(questionnaire);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};