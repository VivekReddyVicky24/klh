import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/CarrerQuiz.css";

const BASE_URL = "http://localhost:5000";

// ── Questions ─────────────────────────────────────────────────────────────────
// score: 1 = AI, 2 = ML, 3 = Cyber
const questions = [
  {
    phase: "Phase 1: General Interest",
    subtitle: "The 'What'",
    question: "What is the most interesting part of technology to you?",
    options: [
      { label: "Making machines 'think' or behave like humans.",       score: 1, tag: "AI"    },
      { label: "Finding patterns in massive amounts of data.",          score: 2, tag: "ML"    },
      { label: "Protecting systems from hackers and vulnerabilities.",  score: 3, tag: "Cyber" },
    ],
  },
  {
    phase: "Phase 1: General Interest",
    subtitle: "The 'What'",
    question: "Which problem would you prefer to solve?",
    options: [
      { label: "Creating a chatbot that understands sarcasm.",          score: 1, tag: "AI"    },
      { label: "Predicting house prices based on historical trends.",   score: 2, tag: "ML"    },
      { label: "Investigating how a company's database was breached.",  score: 3, tag: "Cyber" },
    ],
  },
  {
    phase: "Phase 2: Technical Stack",
    subtitle: "The 'How'",
    question: "Which technical skill do you value most?",
    options: [
      { label: "Natural Language Processing and Neural Networks.",  score: 1, tag: "AI"    },
      { label: "Statistical modeling and data cleaning.",           score: 2, tag: "ML"    },
      { label: "Network security and ethical hacking.",             score: 3, tag: "Cyber" },
    ],
  },
  {
    phase: "Phase 2: Technical Stack",
    subtitle: "The 'How'",
    question: "If you were working on a self-driving car, what would you do?",
    options: [
      { label: "Develop the vision system so it recognizes pedestrians.",              score: 1, tag: "AI"    },
      { label: "Optimize algorithms to improve fuel efficiency based on past trips.",  score: 2, tag: "ML"    },
      { label: "Ensure the car's remote connection cannot be hijacked.",               score: 3, tag: "Cyber" },
    ],
  },
  {
    phase: "Phase 3: Proficiency",
    subtitle: "The 'Level'",
    question: "What kind of math or logic do you prefer?",
    options: [
      { label: "Logic puzzles and cognitive architectures.", score: 1, tag: "AI"    },
      { label: "Probability and advanced statistics.",       score: 2, tag: "ML"    },
      { label: "Cryptography and discrete mathematics.",     score: 3, tag: "Cyber" },
    ],
  },
];

const descriptions = {
  AI:    "You're drawn to making machines think and communicate like humans. Explore NLP, computer vision, and cognitive systems.",
  ML:    "You love uncovering patterns and making data-driven predictions. Dive into statistical models, pipelines, and deep learning.",
  Cyber: "You're a natural defender. Explore ethical hacking, network security, cryptography, and threat analysis.",
};

const domainLabels = {
  AI:    "Artificial Intelligence",
  ML:    "Machine Learning",
  Cyber: "Cybersecurity",
};

const domainIcons = { AI: "🤖", ML: "📊", Cyber: "🛡️" };
const LETTERS     = ["A", "B", "C"];

// Exactly match your backend enum values
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_STYLE = {
  Beginner:     { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.35)",  color: "#059669" },
  Intermediate: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)",  color: "#d97706" },
  Advanced:     { bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.35)", color: "#db2777" },
};

const UNIQUE_PHASES = [
  { label: "General Interest", icon: "💡", range: [0, 1] },
  { label: "Technical Stack",  icon: "⚙️", range: [2, 3] },
  { label: "Proficiency",      icon: "🎯", range: [4, 4] },
];

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Component ──────────────────────────────────────────────────────────────────
export default function CareerQuiz() {
  const navigate = useNavigate();

  const [current,       setCurrent]      = useState(0);
  const [answers,       setAnswers]      = useState([]);
  const [selectedIdx,   setSelectedIdx]  = useState(null);
  const [done,          setDone]         = useState(false);
  const [result,        setResult]       = useState(null);

  // { Beginner: [], Intermediate: [], Advanced: [] }
  const [groups,        setGroups]       = useState({});
  const [groupsLoading, setGroupsLoading]= useState(false);
  const [activeLevel,   setActiveLevel]  = useState("Beginner");

  const [quizLoading,   setQuizLoading]  = useState(false);
  const [joinLoading,   setJoinLoading]  = useState(null);
  const [error,         setError]        = useState(null);

  const q        = questions[current];
  const progress = ((current + (done ? 1 : 0)) / questions.length) * 100;

  // ── GET /api/groups?domain=AI&level=Beginner ──────────────────────────────
  const fetchGroups = async (domain, level) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/groups?domain=${domain}&level=${level}`,
        authHeader()
      );
      // backend returns array directly from StudyGroup.find()
      setGroups(prev => ({ ...prev, [level]: res.data }));
    } catch (err) {
      console.error(`fetchGroups error [${level}]:`, err.message);
      setGroups(prev => ({ ...prev, [level]: [] }));
    }
  };

  // fetch all 3 levels in parallel
  const fetchAllLevels = async (domain) => {
    setGroupsLoading(true);
    await Promise.all(LEVELS.map(lvl => fetchGroups(domain, lvl)));
    setGroupsLoading(false);
  };

  // ── Level tab click ───────────────────────────────────────────────────────
  const handleLevelTab = (level) => {
    setActiveLevel(level);
    if (!groups[level] && result?.topTag) {
      fetchGroups(result.topTag, level);
    }
  };

  // ── POST /api/groups/join/:groupId ────────────────────────────────────────
  const handleJoin = async (group) => {
    setJoinLoading(group._id);
    try {
      await axios.post(
        `${BASE_URL}/api/groups/join/${group._id}`,
        {},
        authHeader()
      );
      navigate(`/group-chat/${group._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      // "Already joined" → just go to the room
      if (msg.toLowerCase().includes("already")) {
        navigate(`/group-chat/${group._id}`);
      } else {
        alert(msg || "Could not join group. Try again.");
      }
    } finally {
      setJoinLoading(null);
    }
  };

  // ── POST /api/groups/join  { domain, level } → joinOrCreateGroup ──────────
  const handleCreateAndJoin = async (domain, level) => {
    setJoinLoading("creating");
    try {
      const res = await axios.post(
        `${BASE_URL}/api/groups/join`,
        { domain, level },
        authHeader()
      );
      navigate(`/group-chat/${res.data.group._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("already")) {
        // group exists, refetch and navigate
        const refetch = await axios.get(
          `${BASE_URL}/api/groups?domain=${domain}&level=${level}`,
          authHeader()
        );
        if (refetch.data[0]) navigate(`/group-chat/${refetch.data[0]._id}`);
      } else {
        alert(msg || "Could not create group.");
      }
    } finally {
      setJoinLoading(null);
    }
  };

  // ── Quiz submit → POST /api/questionnaire/submit ──────────────────────────
  const handleNext = async () => {
    if (selectedIdx === null) return;

    const newAnswers = [
      ...answers,
      { questionId: `Q${current + 1}`, score: q.options[selectedIdx].score },
    ];
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelectedIdx(null);
      return;
    }

    // ── last question: submit ──────────────────────────────────────────────
    setQuizLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/questionnaire/submit`,
        { answers: newAnswers },
        authHeader()
      );

      // { message, cluster_label, recommendedDomain, confidence }
      const { recommendedDomain, confidence } = res.data;
      const confNum = typeof confidence === "string"
        ? parseFloat(confidence) : confidence;

      setResult({
        topTag:      recommendedDomain,                   // "AI" | "ML" | "Cyber"
        topDomain:   domainLabels[recommendedDomain],
        description: descriptions[recommendedDomain],
        confidence:  confNum,
      });
      setDone(true);
      await fetchAllLevels(recommendedDomain);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Submission failed. Please check your connection."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0); setAnswers([]); setSelectedIdx(null);
    setDone(false); setResult(null); setGroups({});
    setError(null); setActiveLevel("Beginner");
  };

  const getPhaseStatus = (range) => {
    if (done) return "s-done";
    if (current >= range[0] && current <= range[1]) return "s-active";
    if (current > range[1]) return "s-done";
    return "s-inactive";
  };

  const currentGroups = groups[activeLevel] || [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="qp-root">
      <div className="qp-blob qp-blob-1" />
      <div className="qp-blob qp-blob-2" />
      <div className="qp-blob qp-blob-3" />
      <div className="qp-grid" />

      {/* ───── LEFT PANEL ───── */}
      <div className="qp-left">
        <div className="qp-ring qp-ring-1" />
        <div className="qp-ring qp-ring-2" />
        <div className="qp-ring qp-ring-3" />

        <div className="qp-logo">
          <div className="qp-logo-icon">🎓</div>
          <div>
            <div className="qp-logo-name">KLH University</div>
            <span className="qp-logo-sub">Career Path Finder</span>
          </div>
        </div>

        <div className="qp-left-body">
          <p className="qp-left-eyebrow">Discover Your Domain</p>
          <h1 className="qp-left-title">Find Your<em>Tech Path.</em></h1>
          <p className="qp-left-desc">
            Answer 5 quick questions to discover which tech domain perfectly
            matches your interests, skills, and thinking style.
          </p>

          <div className="qp-stepper">
            {UNIQUE_PHASES.map((ph, i) => {
              const s = getPhaseStatus(ph.range);
              return (
                <div className={`qp-sitem ${s}`} key={i}>
                  <div className={`qp-scircle ${s}`}>
                    {s === "s-done" ? "✓" : ph.icon}
                  </div>
                  <div className="qp-stext">
                    <div className={`qp-sname ${s}`}>Phase {i + 1}: {ph.label}</div>
                    <div className={`qp-sdetail ${s}`}>
                      {s === "s-done" ? "Completed" : s === "s-active" ? "In Progress" : "Upcoming"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="qp-left-footer">
          <div className="qp-pbar-labels">
            <span>{done ? "Complete!" : `Question ${current + 1} of ${questions.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="qp-pbar-track">
            <div className="qp-pbar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="qp-right">

        {/* ERROR */}
        {error && !quizLoading && (
          <div className="qp-error-box">
            <div className="qp-error-icon">⚠️</div>
            <p className="qp-error-title">Submission Failed</p>
            <p className="qp-error-msg">{error}</p>
            <button className="qp-btn-sec" style={{ marginTop: 20 }} onClick={handleRestart}>
              ↺ Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {quizLoading && (
          <div className="qp-loading">
            <div className="qp-spin-wrap">
              <div className="qp-spin" /><div className="qp-spin-inner" />
            </div>
            <p className="qp-load-text">Analyzing your answers...</p>
            <div className="qp-load-dots">
              <div className="qp-load-dot" />
              <div className="qp-load-dot" />
              <div className="qp-load-dot" />
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {!quizLoading && !error && done && result && (
          <div className="qp-result">

            {/* Hero */}
            <div className="qp-result-hero">
              <div className="qp-ring qp-ring-1" />
              <div className="qp-ring qp-ring-2" />
              <div className="qp-hero-inner">
                <div className="qp-hero-emoji">{domainIcons[result.topTag]}</div>
                <div>
                  <p className="qp-hero-eyebrow">Your Best Fit Domain</p>
                  <p className="qp-hero-domain">{result.topDomain}</p>
                  <p className="qp-hero-desc">{result.description}</p>
                  <div className="qp-confidence-badge">
                    🧠 Model Confidence:&nbsp;<strong>{result.confidence}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Groups Section ── */}
            <div className="qp-rooms-section">

              <div className="qp-rooms-header">
                <div className="qp-rooms-title-row">
                  <span className="qp-rooms-icon">{domainIcons[result.topTag]}</span>
                  <div>
                    <h3 className="qp-rooms-title">{result.topTag} Study Groups</h3>
                    <p className="qp-rooms-sub">Pick your level and join a group</p>
                  </div>
                </div>

                {/* Level filter tabs — matches your enum exactly */}
                <div className="qp-filter-row">
                  {LEVELS.map((lvl) => {
                    const isActive = activeLevel === lvl;
                    const ls = LEVEL_STYLE[lvl];
                    return (
                      <button
                        key={lvl}
                        className={`qp-filter-btn ${isActive ? "active" : ""}`}
                        style={isActive
                          ? { background: ls.bg, borderColor: ls.border, color: ls.color }
                          : {}}
                        onClick={() => handleLevelTab(lvl)}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Groups list */}
              {groupsLoading ? (
                <div className="qp-rooms-loading">
                  <div className="qp-rooms-spinner" />
                  <span>Loading groups...</span>
                </div>

              ) : currentGroups.length === 0 ? (
                /* No groups yet → offer to create */
                <div className="qp-rooms-empty">
                  <span className="qp-rooms-empty-icon">🔍</span>
                  <p>No {activeLevel} groups for {result.topTag} yet.</p>
                  <p className="qp-rooms-empty-sub">
                    Be the first — we'll create one for you!
                  </p>
                  <button
                    className="qp-room-join-btn"
                    style={{ marginTop: 16 }}
                    disabled={joinLoading === "creating"}
                    onClick={() => handleCreateAndJoin(result.topTag, activeLevel)}
                  >
                    {joinLoading === "creating"
                      ? "Creating..."
                      : `Create & Join ${activeLevel} Group →`}
                  </button>
                </div>

              ) : (
                <div className="qp-rooms-list">
                  {currentGroups.map((group, i) => {
                    const ls = LEVEL_STYLE[group.level] || LEVEL_STYLE["Beginner"];
                    const memberCount = group.members?.length ?? 0;
                    return (
                      <div key={group._id} className="qp-room-card">

                        {/* Rank */}
                        <div className={`qp-room-rank ${i === 0 ? "first" : ""}`}>
                          {i === 0 ? "🔥" : `#${i + 1}`}
                        </div>

                        {/* Info */}
                        <div className="qp-room-info">
                          <div className="qp-room-name">
                            {group.domain} · {group.level}
                          </div>
                          <div className="qp-room-topic">
                            {memberCount} member{memberCount !== 1 ? "s" : ""} in this group
                          </div>
                        </div>

                        {/* Level badge */}
                        <div
                          className="qp-room-level-badge"
                          style={{
                            background:  ls.bg,
                            border:     `1.5px solid ${ls.border}`,
                            color:       ls.color,
                          }}
                        >
                          {group.level}
                        </div>

                        {/* Members count + Join */}
                        <div className="qp-room-right">
                          <div className="qp-room-members">
                            <span className="qp-room-members-icon">👥</span>
                            <span>{memberCount}</span>
                          </div>
                          <button
                            className="qp-room-join-btn"
                            disabled={joinLoading === group._id}
                            onClick={() => handleJoin(group)}
                          >
                            {joinLoading === group._id ? "Joining..." : "Join →"}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="qp-btns">
              <button className="qp-btn-sec" onClick={handleRestart}>↺ Retake Quiz</button>
            </div>
          </div>
        )}

        {/* ── QUESTION ── */}
        {!quizLoading && !error && !done && (
          <div className="qp-card" key={current}>
            <div className="qp-phase-row">
              <span className="qp-phase-badge">
                <span className="qp-badge-dot" />{q.phase}
              </span>
              <span className="qp-phase-sub">{q.subtitle}</span>
            </div>

            <h2 className="qp-question">{q.question}</h2>

            <div className="qp-options">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`qp-option ${selectedIdx === i ? "selected" : ""}`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <span className="qp-opt-letter">{LETTERS[i]}</span>
                  <span className="qp-opt-label">{opt.label}</span>
                  <span className={`qp-opt-tag score-${opt.score}`}>{opt.tag}</span>
                </button>
              ))}
            </div>

            <button
              className="qp-next"
              onClick={handleNext}
              disabled={selectedIdx === null}
            >
              {current + 1 === questions.length ? "See My Result →" : "Next Question →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}