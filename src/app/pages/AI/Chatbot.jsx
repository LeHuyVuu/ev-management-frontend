import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

/** ---------- Message bubble (one-row horizontal) ---------- */
function MessageBubble({ sender, text, ts }) {
  const isUser = sender === "user";

  // tách code block ```...```
  const pieces = [];
  const re = /```([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pieces.push({ t: "text", v: text.slice(last, m.index) });
    pieces.push({ t: "code", v: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) pieces.push({ t: "text", v: text.slice(last) });

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* mỗi hàng = avatar + bubble (bubble ~70% chiều ngang) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {/* avatar */}
        <div
          aria-hidden
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: "50%",
            background: isUser ? "#d0e8ff" : "#e3e6f8",
            color: isUser ? "#1976d2" : "#303f9f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            marginTop: 2,
          }}
          title={isUser ? "You" : "Assistant"}
        >
          <i className="pi pi-comment" style={{ fontSize: 14 }} />
        </div>

        {/* bubble */}
        <div
          style={{
            position: "relative",
            flex: "0 1 auto",
            width: "clamp(320px, 70%, 900px)",
            background: isUser ? "#1677ff" : "#ffffff",
            color: isUser ? "#fff" : "#111827",
            border: isUser ? "1px solid #1677ff" : "1px solid #eef0f3",
            borderRadius: 18,
            padding: "12px 14px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* copy */}
          <div style={{ position: "absolute", top: 6, right: 6, opacity: isUser ? 0.85 : 0.5 }}>
            <Button icon="pi pi-copy" rounded text onClick={copyAll} style={{ width: 28, height: 28 }} />
          </div>

          {/* nhãn người gửi */}
          <div style={{ fontSize: 11, fontWeight: 600, opacity: isUser ? 0.9 : 0.6, marginBottom: 4 }}>
            {isUser ? "You" : "Assistant"}
          </div>

          {/* nội dung */}
          <div style={{ display: "grid", gap: 10 }}>
            {pieces.map((p, i) =>
              p.t === "code" ? (
                <pre
                  key={i}
                  style={{
                    margin: 0,
                    background: isUser ? "rgba(255,255,255,0.18)" : "#0f172a",
                    color: isUser ? "#fff" : "#e2e8f0",
                    borderRadius: 12,
                    padding: "10px 12px",
                    overflow: "auto",
                  }}
                >
                  <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" }}>{p.v}</code>
                </pre>
              ) : (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.65 }}>
                  {p.v}
                </div>
              )
            )}
          </div>

          {/* timestamp */}
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.55, textAlign: "right" }}>
            {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- ChatBox ---------- */
export default function ChatBox({
  q,
  setQ,
  asking,
  onAsk,
  answer,
  setAnswer,
  aiBarCollapsed,
  setAiBarCollapsed,
}) {
  const [messages, setMessages] = useState([]);
  const lastAnswerRef = useRef("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!answer || answer === lastAnswerRef.current) return;
    lastAnswerRef.current = answer;
    setMessages((prev) => [...prev, { sender: "bot", text: answer, ts: Date.now() }]);
  }, [answer]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, asking]);

  const sendMessage = () => {
    const text = (q || "").trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", text, ts: Date.now() }]);
    onAsk();
    setQ("");
  };

  const Fab = (
    <motion.div
      key="fab-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 28,
        zIndex: 2147483000,
      }}
    >
      <Button
        icon="pi pi-comment"
        className="p-button-rounded p-button-primary shadow-5"
        style={{ width: 56, height: 56, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
        onClick={() => setAiBarCollapsed(false)}
      />
    </motion.div>
  );

  const ChatModal = (
    <AnimatePresence>
      {!aiBarCollapsed && (
        <>
          <motion.div
            key="chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(3px)",
              zIndex: 2147483000,
            }}
            onClick={() => setAiBarCollapsed(true)}
          />

          <motion.div
            key="chat-center"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2147483001,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "clamp(320px, 90vw, 760px)",
                maxHeight: "80vh",
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                className="p-3 border-round-3xl shadow-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,247,250,0.96))",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 16px 44px rgba(0,0,0,0.28)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "0 8px 8px",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, opacity: 0.75 }}>Assistant</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Button rounded text icon="pi pi-chevron-down" onClick={() => setAiBarCollapsed(true)} />
                    <Button
                      rounded
                      text
                      icon="pi pi-trash"
                      onClick={() => {
                        setMessages([]);
                        setAnswer && setAnswer("");
                      }}
                    />
                  </div>
                </div>

                {/* messages: ép dọc bằng inline style, KHÔNG dựa vào class */}
                <div
                  ref={listRef}
                  style={{
                    maxHeight: "58vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    padding: 8,
                  }}
                >
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                      <motion.div
                        key={`${m.sender}-${i}-${m.ts}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ width: "100%" }} // mỗi message chiếm 1 hàng dọc
                      >
                        <MessageBubble sender={m.sender} text={m.text} ts={m.ts} />
                      </motion.div>
                    ))}

                    {asking && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}
                      >
                        <div style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12 }}>
                          {/* avatar bot */}
                          <div
                            aria-hidden
                            style={{
                              width: 36,
                              height: 36,
                              minWidth: 36,
                              borderRadius: "50%",
                              background: "#e3e6f8",
                              color: "#303f9f",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                              marginTop: 2,
                            }}
                          >
                            <i className="pi pi-comment" style={{ fontSize: 14 }} />
                          </div>

                          {/* typing bubble */}
                          <div
                            style={{
                              width: "clamp(320px, 70%, 900px)",
                              background: "#f2f3f5",
                              color: "#555",
                              padding: "12px 14px",
                              borderRadius: 18,
                              borderBottomLeftRadius: 6,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                              display: "inline-flex",
                              gap: 6,
                            }}
                          >
                            {[0, 1, 2].map((k) => (
                              <span
                                key={k}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#bbb",
                                  display: "inline-block",
                                  animation: `blink 1.2s ease-in-out ${k * 0.15}s infinite`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* composer */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8 }}>
                  <InputTextarea
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoResize
                    placeholder="Hey! How can I help?"
                    rows={1}
                    style={{ flex: 1, resize: "none", boxShadow: "none", fontSize: 15, background: "transparent", border: "none" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button icon="pi pi-send" rounded disabled={asking} onClick={sendMessage} />
                </div>
              </Card>

              <style>{`
                @keyframes blink {
                  0% { transform: translateY(0); opacity: 0.4; }
                  50% { transform: translateY(-2px); opacity: 1; }
                  100% { transform: translateY(0); opacity: 0.4; }
                }
              `}</style>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <AnimatePresence>{aiBarCollapsed ? Fab : null}</AnimatePresence>
      {createPortal(ChatModal, document.body)}
    </>
  );
}
