// ============================================================
//  ChatRoom.jsx
//  Real-time group chat component
//  Connects to chatServer.js via Socket.io
//
//  Props:
//    chatRoomId  — from joinGroup() API response
//    groupTitle  — e.g. "DSA"
//    domain      — e.g. "DSA"
//    status      — "basic" | "intermediate" | "advanced"
//    currentUser — { id, name }
//
//  Usage:
//    <ChatRoom
//      chatRoomId="abc-123"
//      groupTitle="Data Structures & Algorithms"
//      domain="DSA"
//      status="intermediate"
//      currentUser={{ id: 5, name: "Rahul" }}
//    />
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

// Domain color map
const DOMAIN_COLORS = {
  "DSA":             { primary: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  "Web Development": { primary: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)"  },
  "Data Analytics":  { primary: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.25)" },
  "OOPS":            { primary: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
  "DBMS":            { primary: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
};

const STATUS_BADGE = {
  basic:        { label: "Basic",        color: "#34d399" },
  intermediate: { label: "Intermediate", color: "#fbbf24" },
  advanced:     { label: "Advanced",     color: "#f472b6" },
};

const getAvatar = (name = "") => {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors   = ["#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#fb923c"];
  const color    = colors[name.charCodeAt(0) % colors.length];
  return { initials, color };
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ── Styles ─────────────────────────────────────────────────
const S = {
  // FIX: position fixed + full viewport — removes all side white space
  wrap: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    background: "#060d1a",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: "#e2e8f0",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  bgGlow: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    background:
      "radial-gradient(ellipse 55% 35% at 80% 5%, rgba(52,211,153,0.06) 0%, transparent 60%), " +
      "radial-gradient(ellipse 35% 45% at 5% 90%, rgba(96,165,250,0.06) 0%, transparent 60%)",
  },

  // Header
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "#0d1424",
    flexShrink: 0,
    position: "relative", zIndex: 2,
    boxSizing: "border-box",
    width: "100%",
  },
  headerDot: (color) => ({
    width: 12, height: 12, borderRadius: "50%",
    background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0,
  }),
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em",
  },
  headerSub:  { fontSize: 11, color: "#4b5a6e", marginTop: 2 },
  badge: (color) => ({
    padding: "3px 10px", borderRadius: 100,
    border: `1px solid ${color}40`, background: `${color}18`,
    color, fontSize: 10, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
  }),
  memberCount: {
    marginLeft: "auto", display: "flex", alignItems: "center",
    gap: 6, fontSize: 12, color: "#4b5a6e",
  },
  onlineDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#34d399", boxShadow: "0 0 6px #34d399",
  },
  toggleBtn: {
    marginLeft: 8, background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "5px 10px", color: "#4b5a6e",
    fontSize: 11, cursor: "pointer", fontFamily: "inherit",
  },

  // Body
  body: {
    display: "flex", flex: 1,
    overflow: "hidden",
    position: "relative", zIndex: 1,
    minHeight: 0,
  },

  // Messages
  messagesWrap: {
    flex: 1, display: "flex", flexDirection: "column",
    overflow: "hidden", minWidth: 0,
  },
  messages: {
    flex: 1, overflowY: "auto",
    padding: "20px 20px 8px",
    display: "flex", flexDirection: "column", gap: 4,
    scrollbarWidth: "thin", scrollbarColor: "#1a2235 transparent",
    minHeight: 0, boxSizing: "border-box",
  },

  // Date divider
  dateDivider: { display: "flex", alignItems: "center", gap: 12, margin: "12px 0" },
  dateLine:    { flex: 1, height: 1, background: "rgba(255,255,255,0.05)" },
  dateLabel:   { fontSize: 10, color: "#2d3f55", letterSpacing: "0.1em", whiteSpace: "nowrap" },

  // Message rows
  msgRow: (isMine) => ({
    display: "flex", gap: 10, alignItems: "flex-end",
    flexDirection: isMine ? "row-reverse" : "row",
    marginBottom: 2,
  }),
  avatar: (color) => ({
    width: 30, height: 30, borderRadius: "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "#060d1a", flexShrink: 0,
  }),
  msgBody: (isMine) => ({
    maxWidth: "65%", display: "flex", flexDirection: "column",
    alignItems: isMine ? "flex-end" : "flex-start",
  }),
  msgMeta: { fontSize: 10, color: "#2d3f55", marginBottom: 4 },
  bubble: (isMine, domainColor) => ({
    padding: "10px 14px",
    borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
    fontSize: 13, lineHeight: 1.55,
    background: isMine ? domainColor.bg : "#111c30",
    border: `1px solid ${isMine ? domainColor.border : "rgba(255,255,255,0.05)"}`,
    wordBreak: "break-word",
  }),
  systemBubble: {
    textAlign: "center", fontSize: 11, color: "#2d3f55",
    padding: "4px 12px", margin: "6px auto",
    background: "rgba(255,255,255,0.03)", borderRadius: 100,
    border: "1px solid rgba(255,255,255,0.04)",
  },

  typingDots: { display: "flex", gap: 3 },

  // Input
  inputArea: {
    padding: "12px 16px 16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    background: "#0d1424",
    flexShrink: 0,
    boxSizing: "border-box", width: "100%",
  },
  inputRow: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#111c30",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "10px 14px",
    transition: "border-color 0.2s", boxSizing: "border-box",
  },
  input: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#e2e8f0", minWidth: 0,
  },
  sendBtn: (color, disabled) => ({
    width: 34, height: 34, borderRadius: 10,
    background: disabled ? "#1a2235" : color,
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, color: disabled ? "#2d3f55" : "#060d1a",
    transition: "all 0.2s", flexShrink: 0,
  }),

  // Sidebar
  sidebar: {
    width: 220, borderLeft: "1px solid rgba(255,255,255,0.05)",
    background: "#0d1424",
    display: "flex", flexDirection: "column",
    overflow: "hidden", flexShrink: 0,
  },
  sidebarHeader: {
    padding: "14px 14px 10px",
    fontSize: 10, letterSpacing: "0.12em", color: "#2d3f55",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  membersList: { flex: 1, overflowY: "auto", padding: "8px" },
  memberItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px", borderRadius: 10, marginBottom: 2,
  },
  memberName: { fontSize: 12, fontWeight: 500 },
  memberRole: { fontSize: 10, color: "#2d3f55" },
  onlineIndicator: (online) => ({
    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
    background: online ? "#34d399" : "#1a2235",
    boxShadow: online ? "0 0 5px #34d399" : "none",
    marginLeft: "auto",
  }),
};

// ── Global CSS injected once ───────────────────────────────
const injectStyles = () => {
  if (document.getElementById("chatroom-styles")) return;
  const el = document.createElement("style");
  el.id = "chatroom-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

    /* removes white space on all sides */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      margin: 0 !important; padding: 0 !important;
      width: 100%; height: 100%; overflow: hidden;
    }

    .typing-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #2d3f55; animation: tdBounce 1.1s infinite;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.18s; }
    .typing-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes tdBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-5px); }
    }
    .msg-appear { animation: msgIn 0.25s ease forwards; }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .send-btn-hover:hover:not(:disabled) { transform: scale(1.08) !important; }

    ::-webkit-scrollbar       { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1a2235; border-radius: 4px; }
  `;
  document.head.appendChild(el);
};

// ══════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════
export default function ChatRoom({
  chatRoomId  = "demo-room-001",
  groupTitle  = "Data Structures & Algorithms",
  domain      = "DSA",
  status      = "intermediate",
  currentUser = { id: 1, name: "You" },
}) {
  injectStyles();

  const [messages,    setMessages]    = useState([]);
  const [members,     setMembers]     = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [inputValue,  setInputValue]  = useState("");
  const [connected,   setConnected]   = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const isTypingRef    = useRef(false);

  const domainColor = DOMAIN_COLORS[domain] || DOMAIN_COLORS["DSA"];
  const statusBadge = STATUS_BADGE[status]  || STATUS_BADGE["basic"];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ── Socket.io ─────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("room:join", {
        chatRoomId, userId: currentUser.id, userName: currentUser.name,
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("room:history",   (history)    => setMessages(history));
    socket.on("chat:message",   (msg)        => setMessages(prev => [...prev, msg]));
    socket.on("system:message", (msg)        => setMessages(prev => [...prev, { ...msg, type: "system" }]));
    socket.on("room:members",   (memberList) => setMembers(memberList));

    socket.on("user:online",  ({ userId })          => setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isOnline: true }  : m)));
    socket.on("user:offline", ({ userId })          => setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isOnline: false } : m)));

    socket.on("user:typing", ({ userId, userName, isTyping }) => {
      if (userId === currentUser.id) return;
      setTypingUsers(prev =>
        isTyping
          ? (prev.includes(userName) ? prev : [...prev, userName])
          : prev.filter(n => n !== userName)
      );
    });

    return () => {
      socket.emit("room:leave", { chatRoomId, userId: currentUser.id });
      socket.disconnect();
    };
  }, [chatRoomId, currentUser.id, currentUser.name]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit("chat:message", {
      chatRoomId, senderId: currentUser.id,
      senderName: currentUser.name, content: text, type: "text",
    });
    socketRef.current.emit("user:typing", {
      chatRoomId, userId: currentUser.id,
      userName: currentUser.name, isTyping: false,
    });
    isTypingRef.current = false;
    setInputValue("");
  }, [inputValue, chatRoomId, currentUser]);

  // ── Typing indicator ──────────────────────────────────────
  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (!socketRef.current) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit("user:typing", {
        chatRoomId, userId: currentUser.id, userName: currentUser.name, isTyping: true,
      });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit("user:typing", {
        chatRoomId, userId: currentUser.id, userName: currentUser.name, isTyping: false,
      });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={S.wrap}>
      <div style={S.bgGlow} />

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerDot(domainColor.primary)} />
        <div>
          <div style={S.headerTitle}>{groupTitle}</div>
          <div style={S.headerSub}>
            {connected ? "● connected" : "○ connecting..."}&nbsp;· {domain}
          </div>
        </div>

        <div style={S.badge(statusBadge.color)}>{statusBadge.label}</div>

        <div style={S.memberCount}>
          <div style={S.onlineDot} />
          {members.filter(m => m.isOnline).length} online
          &nbsp;·&nbsp;
          {members.length} members
          <button style={S.toggleBtn} onClick={() => setShowSidebar(v => !v)}>
            {showSidebar ? "Hide" : "Members"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>

        {/* Messages + Input */}
        <div style={S.messagesWrap}>
          <div style={S.messages}>

            {messages.map((msg, i) => {
              const isMine   = msg.senderId === currentUser.id;
              const isSystem = msg.type === "system";
              const { initials, color } = getAvatar(msg.senderName || "");
              const showDate =
                i === 0 ||
                new Date(msg.createdAt).toDateString() !==
                new Date(messages[i - 1]?.createdAt).toDateString();

              return (
                <div key={msg.messageId || i} className="msg-appear">

                  {showDate && (
                    <div style={S.dateDivider}>
                      <div style={S.dateLine} />
                      <div style={S.dateLabel}>
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </div>
                      <div style={S.dateLine} />
                    </div>
                  )}

                  {isSystem ? (
                    <div style={S.systemBubble}>{msg.content}</div>
                  ) : (
                    <div style={S.msgRow(isMine)}>
                      {!isMine && <div style={S.avatar(color)}>{initials}</div>}
                      <div style={S.msgBody(isMine)}>
                        <div style={S.msgMeta}>
                          {!isMine && <span style={{ color }}>{msg.senderName}</span>}
                          {!isMine && " · "}
                          {formatTime(msg.createdAt)}
                        </div>
                        <div style={S.bubble(isMine, domainColor)}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div style={S.msgRow(false)}>
                <div style={S.avatar("#1a2235")}>···</div>
                <div style={S.msgBody(false)}>
                  <div style={S.msgMeta}>
                    <span style={{ color: domainColor.primary }}>
                      {typingUsers.join(", ")}
                    </span>
                    {" is typing"}
                  </div>
                  <div style={{ ...S.bubble(false, domainColor), padding: "10px 14px" }}>
                    <div style={S.typingDots}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={S.inputArea}>
            <div style={{
              ...S.inputRow,
              borderColor: inputValue ? domainColor.border : "rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 16, opacity: 0.4, flexShrink: 0 }}>✏️</span>
              <input
                style={S.input}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${groupTitle}...`}
              />
              <button
                className="send-btn-hover"
                style={S.sendBtn(domainColor.primary, !inputValue.trim())}
                onClick={sendMessage}
                disabled={!inputValue.trim()}
              >
                ➤
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#2d3f55", marginTop: 6, paddingLeft: 4 }}>
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        {showSidebar && (
          <div style={S.sidebar}>
            <div style={S.sidebarHeader}>MEMBERS — {members.length}</div>
            <div style={S.membersList}>
              {members.map((m) => {
                const { initials, color } = getAvatar(m.userName);
                return (
                  <div key={m.userId} style={S.memberItem}>
                    <div style={{ ...S.avatar(color), width: 28, height: 28, fontSize: 10 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={S.memberName}>
                        {m.userName}
                        {m.userId === currentUser.id && (
                          <span style={{ color: "#2d3f55", marginLeft: 4 }}>(you)</span>
                        )}
                      </div>
                      <div style={S.memberRole}>{m.role || "member"}</div>
                    </div>
                    <div style={S.onlineIndicator(m.isOnline)} />
                  </div>
                );
              })}
              {members.length === 0 && (
                <div style={{ fontSize: 11, color: "#2d3f55", padding: "12px 8px" }}>
                  No members yet
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}