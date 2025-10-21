import React from "react";
import { useEffect, useRef, useState } from "react";
import { connectWS } from "./ws";
import axios from "axios";

const App = () => {
    const lastNotice = useRef<{ name: string; ts: number } | null>(null); // dedupe join
  const timer = useRef<any>(null);
  const socket = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  const [showNamePopup, setShowNamePopup] = useState(() => !localStorage.getItem("userName"));
  const [inputName, setInputName] = useState("");
  const [typers, setTypers] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]); // presence

  const [messages, setMessages] = useState<Array<{ id: any; sender: string; text: string; ts: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("messages") || "[]");
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const s = (socket.current = connectWS());

    const onConnect = () => {
      if (userName) s.emit("join", userName);
    };
    const onPresence = (list: string[]) => setUsers(list);
    const onGroupNotice = (joinedName: string) => {
        const now = Date.now();
      if (lastNotice.current && lastNotice.current.name === joinedName && now - lastNotice.current.ts < 1000) {
        return; // skip accidental dup within 1s (dev StrictMode/reconnect)
      }
      lastNotice.current = { name: joinedName, ts: now };
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "system", text: `${joinedName} joined the chat`, ts: Date.now() },
      ]);
    };
    const onMessage = (msg: { id: any; sender: string; text: string; ts: number }) => {
      setMessages((m) => [...m, msg]);
    };
    const onTyping = (name: string) => setTypers((prev) => (prev.includes(name) ? prev : [...prev, name]));
    const onStopTyping = (name: string) => setTypers((prev) => prev.filter((n) => n !== name));

    s.on("connect", onConnect);
    s.on("presence", onPresence);
    s.on("group_notice", onGroupNotice);
    s.on("message", onMessage);
    s.on("typing", onTyping);
    s.on("stop_typing", onStopTyping);

    return () => {
      s.off("connect", onConnect);
      s.off("presence", onPresence);
      s.off("group_notice", onGroupNotice);
      s.off("message", onMessage);
      s.off("typing", onTyping);
      s.off("stop_typing", onStopTyping);
    };
  }, [userName]);

  // Typing debounce
  useEffect(() => {
    if (!userName) return;
    if (text) {
      socket.current?.emit("typing", userName);
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      socket.current?.emit("stop_typing", userName);
    }, 1000);
    return () => {
      clearTimeout(timer.current);
      socket.current?.emit("stop_typing", userName);
    };
  }, [text, userName]);

  // Persist userName and toggle popup
  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName);
      setShowNamePopup(false);
    } else {
      localStorage.removeItem("userName");
      setShowNamePopup(true);
    }
  }, [userName]);

  // Fetch history once (default room)
useEffect(() => {
  (async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/messages");
      const serverMsgs = res.data.map((m: any) => ({
        id: m._id ?? m.id ?? Date.now(),
        sender: m.sender,
        text: m.message?.text ?? m.text,
        ts: new Date(m.ts).getTime(),
      }));
      const cached = (() => {
        try { return JSON.parse(localStorage.getItem("messages") || "[]"); } catch { return []; }
      })();
      const systemOnly = cached.filter((m: any) => m?.sender === "system");
      const merged = [...serverMsgs, ...systemOnly].sort((a, b) => a.ts - b.ts);
      setMessages(merged);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  })();
}, []);
  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime(ts: number) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  async function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;
    socket.current.emit("join", trimmed);
    setUserName(trimmed);
    try {
      await axios.post("http://localhost:3000/api/users", { name: trimmed });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  async function sendMessage() {
    const t = text.trim();
    if (!t || !userName) return;
    const msg = { id: Date.now(), sender: userName, text: t, ts: Date.now() };
    socket.current.emit("message", msg);
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-lg max-w-md p-6">
            <h1 className="text-xl font-semibold text-black">Enter your name</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your name to start chatting.</p>
            <form onSubmit={handleNameSubmit} className="mt-4">
              <input
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 outline-green-500 placeholder-gray-400"
                placeholder="Your name"
              />
              <button type="submit" className="block ml-auto mt-3 px-4 py-1.5 rounded-full bg-green-500 text-white font-medium">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {!showNamePopup && (
        <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-[#075E54] flex items-center justify-center text-white font-semibold">R</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#303030]">GroupChat</div>
              {typers.length ? (
                <div className="text-xs text-gray-500">{typers.join(", ")} is typing...</div>
              ) : (
                <div className="text-xs text-gray-500 truncate">Online ({users.length}): {users.join(", ")}</div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Signed in as <span className="font-medium text-[#303030] capitalize">{userName}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
            {messages.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} className="text-center text-gray-500 text-sm mb-2">
                    <span className="font-medium">{m.text}</span>
                  </div>
                );
              }
              const mine = m.sender === userName;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${
                      mine ? "bg-[#DCF8C6] text-[#303030] rounded-br-2xl" : "bg-white text-[#303030] rounded-bl-2xl"
                    }`}
                  >
                    <div className="break-words whitespace-pre-wrap">{m.text}</div>
                    <div className="flex justify-between items-center mt-1 gap-16">
                      <div className="text-[11px] font-bold">{m.sender}</div>
                      <div className="text-[11px] text-gray-500 text-right">{formatTime(m.ts)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-4 border border-gray-300 rounded-full">
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full resize-none px-4 py-4 text-sm outline-none"
              />
              <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 mr-2 rounded-full text-sm font-medium">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;