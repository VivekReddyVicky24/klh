import { useState } from "react";
//import "../css/Questions.css";
//import "../css/Questions.css";


const questions = [
  {
    phase: "Phase 1: General Interest",
    subtitle: "The 'What'",
    question: "Q1: Which task sounds most exciting to you?",
    options: [
      { label: "Training a computer to recognize faces.", tag: "AI/ML" },
      { label: "Building a dashboard to show sales trends.", tag: "DAS/DS" },
      { label: "Designing a secure login system that can't be hacked.", tag: "Cyber" },
      { label: "Connecting a smart thermostat to a phone app.", tag: "IoT" },
      { label: "Building a fast, interactive UI with React.", tag: "Web-JSX" },
    ],
  },
  {
    phase: "Phase 1: General Interest",
    subtitle: "The 'What'",
    question: "Q2: If given 1 million rows of data, what would you do first?",
    options: [
      { label: "Find patterns and trends to present to a manager.", tag: "DAS" },
      { label: "Build a pipeline to clean and store it in a cloud warehouse.", tag: "DE" },
      { label: "Design a database schema to ensure data integrity.", tag: "DB" },
      { label: "Use it to train a neural network for prediction.", tag: "AI/ML" },
    ],
  },
  {
    phase: "Phase 1: General Interest",
    subtitle: "The 'What'",
    question: "Q3: Which broken scenario would you find most interesting to fix?",
    options: [
      { label: "A hacker bypassed a firewall and is accessing private keys.", tag: "Cyber" },
      { label: "A smart lightbulb isn't communicating via Zigbee/Bluetooth.", tag: "IoT" },
      { label: "A React component is rerendering too many times.", tag: "Web-JSX" },
      { label: "A Python API returns a 500 error during high traffic.", tag: "Web-Python" },
    ],
  },
  {
    phase: "Phase 2: Technical Stack",
    subtitle: "The 'How'",
    question: "Q4: Which tool or language do you prefer?",
    options: [
      { label: "SQL and Database schemas.", tag: "DB/DE" },
      { label: "Python libraries like Pandas or Scikit-learn.", tag: "DS/ML" },
      { label: "JSX and CSS frameworks.", tag: "Web-JSX" },
      { label: "Django or Flask backends.", tag: "Web-Python" },
      { label: "Network protocols and encryption tools.", tag: "Cyber" },
    ],
  },
  {
    phase: "Phase 2: Technical Stack",
    subtitle: "The 'How'",
    question: "Q5: Which technologies do you want to master?",
    options: [
      { label: "TensorFlow, PyTorch, Keras.", tag: "AI/ML" },
      { label: "Docker, Kubernetes, Jenkins, Airflow.", tag: "DE" },
      { label: "Penetration Testing, Wireshark, Metasploit.", tag: "Cyber" },
      { label: "Arduino, Raspberry Pi, ESP32, MQTT.", tag: "IoT" },
      { label: "Redux, Tailwind CSS, Next.js.", tag: "Web-JSX" },
    ],
  },
  {
    phase: "Phase 2: Technical Stack",
    subtitle: "The 'How'",
    question: "Q6: How much Math & Statistics do you want in daily work?",
    options: [
      { label: "None — focus on design and logic.", tag: "Web-JSX" },
      { label: "Some — basic logic and data handling.", tag: "Web-Python/DB" },
      { label: "A lot — Calculus, Linear Algebra, Probability.", tag: "DS/AI/ML" },
    ],
  },
  {
    phase: "Phase 3: Proficiency",
    subtitle: "The 'Level'",
    question: "Q7: What is your current experience level?",
    options: [
      { label: "I've just started learning.", tag: "Beginner" },
      { label: "I can build basic projects with help.", tag: "Intermediate" },
      { label: "I can build and deploy complex systems independently.", tag: "Advanced" },
    ],
  },
];

const ML_TAGS = ["AI/ML", "DS/ML", "DS/AI/ML"];

function getResult(answers) {
  const mlCount = answers.filter((a) =>
    ML_TAGS.some((t) => a.tag === t || a.tag?.includes("ML") || a.tag?.includes("AI"))
  ).length;
  const isML = mlCount >= 3;

  const domainMap = {
    "AI/ML": 0, "DS/ML": 0, "DS/AI/ML": 0,
    "DAS": 0, "DAS/DS": 0,
    "DE": 0, "DB": 0, "DB/DE": 0,
    "Cyber": 0, "IoT": 0,
    "Web-JSX": 0,
    "Web-Python": 0, "Web-Python/DB": 0,
  };

  answers.forEach((a) => {
    if (a.tag && domainMap[a.tag] !== undefined) domainMap[a.tag]++;
  });

  const sorted = Object.entries(domainMap).sort((a, b) => b[1] - a[1]);
  const topTag = sorted[0]?.[0] || "AI/ML";

  const domainLabels = {
    "AI/ML": "Artificial Intelligence / Machine Learning",
    "DS/ML": "Data Science / Machine Learning",
    "DS/AI/ML": "Data Science & AI/ML",
    "DAS": "Data Analytics",
    "DAS/DS": "Data Analytics / Data Science",
    "DE": "Data Engineering",
    "DB": "Database Engineering",
    "DB/DE": "Database / Data Engineering",
    "Cyber": "Cybersecurity",
    "IoT": "Internet of Things",
    "Web-JSX": "Frontend Web Development (React)",
    "Web-Python": "Backend Web Development (Python)",
    "Web-Python/DB": "Backend / Database Development",
  };

  const level = answers[6]?.tag || "Beginner";
  return { isML, topDomain: domainLabels[topTag] || topTag, level };
}

const LETTERS = ["A", "B", "C", "D", "E"];

export default function CareerQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const q = questions[current];
  const progress = (current / questions.length) * 100;

  const handleSelect = (opt) => setSelected(opt);

  const handleNext = async () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current + 1 === questions.length) {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      const res = getResult(newAnswers);
      setResult(res);
      setLoading(false);
      setDone(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
    setResult(null);
  };

  return (
    <div className="quiz-page">
      <div className="quiz-card">

        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-header-top">
            <span className="quiz-badge">Career Path Finder</span>
            {!done && (
              <span className="quiz-counter">{current + 1} / {questions.length}</span>
            )}
          </div>
          {!done && (
            <div className="quiz-progress-bg">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {loading ? (
          /* ===== LOADING ===== */
          <div className="quiz-loading-box">
            <div className="quiz-spinner" />
            <p className="quiz-loading-text">Analyzing your answers...</p>
          </div>

        ) : done && result ? (
          /* ===== RESULT ===== */
          <div className="quiz-result-box">
            <div className="quiz-result-icon">🎯</div>
            <h2 className="quiz-result-title">Your Best Fit Domain</h2>
            <p className="quiz-result-domain">{result.topDomain}</p>
            <p className="quiz-result-level">
              Experience Level: <strong>{result.level}</strong>
            </p>

            <div className={`quiz-ml-box ${result.isML ? "yes" : "no"}`}>
              <p className="quiz-ml-question">
                Is there an existing ML model suited to your profile?
              </p>
              <span className="quiz-ml-answer">
                {result.isML ? "✅ YES" : "❌ NO"}
              </span>
              <p className="quiz-ml-sub">
                {result.isML
                  ? "Models like scikit-learn pipelines, TensorFlow, and PyTorch match your AI/ML interest and math preference."
                  : "Your profile leans toward non-ML domains. Explore specialized tools for your chosen field instead."}
              </p>
            </div>

            <button className="quiz-restart-btn" onClick={handleRestart}>
              Retake Quiz
            </button>
          </div>

        ) : (
          /* ===== QUESTION ===== */
          <div className="quiz-question-box">
            <div className="quiz-phase-tag">
              {q.phase} &mdash; <em>{q.subtitle}</em>
            </div>
            <h2 className="quiz-question-text">{q.question}</h2>

            <div className="quiz-options">
              {q.options.map((opt, i) => {
                const isChosen = selected?.label === opt.label;
                return (
                  <button
                    key={i}
                    className={`quiz-option-btn ${isChosen ? "selected" : ""}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="quiz-option-letter">{LETTERS[i]}</span>
                    <span className="quiz-option-label">{opt.label}</span>
                    <span className="quiz-option-tag">{opt.tag}</span>
                  </button>
                );
              })}
            </div>

            <button
              className="quiz-next-btn"
              onClick={handleNext}
              disabled={!selected}
            >
              {current + 1 === questions.length ? "See Result →" : "Next →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}