import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MainPage = () => {
    const [messages , setMessages] = React.useState<Array<{id: string; text: string; sender: string; ts: string;}>>([]);
    const [text, setText] = React.useState("");
  const { state } = useLocation() as { state?: { userName?: string } };
  const navigate = useNavigate();
  const userName = state?.userName;
 React.useEffect(() => {
    if (!userName) {
      navigate("/", { replace: true });
    }
  }, [userName, navigate]);

  if (!userName) return null;
    function formatTime(ts: string) {
        const date = new Date(ts);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
const sendMessage = () => {
    if (!text.trim()) return;
    const msg = {
        id: Date.now().toString(),
        sender: userName,
        text: 't',
        ts: new Date().toISOString(),
}
setMessages((prev) => [...prev, msg]);
setText("");
}
 function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">

      {/* Chat Container */}    
      <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <div className="h-10 w-10 rounded-full bg-[#075E54] flex items-center justify-center text-white font-semibold">
            C
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">REaltime chat group</div>
          </div>
        <div className="text-sm text-gray-500">
          signed in as <span className="font-semibold text-black">{userName}</span>
        </div>
        </div>

        {/* Messages Area
        
        */}

       <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
                        {messages.map((m) => {
                            const mine = m.sender === userName;
                            return (
                                <div
                                    key={m.id}
                                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${
                                            mine
                                                ? 'bg-[#DCF8C6] text-[#303030] rounded-br-2xl'
                                                : 'bg-white text-[#303030] rounded-bl-2xl'
                                        }`}>
                                        <div className="break-words whitespace-pre-wrap">
                                            {m.text}
                                        </div>
                                        <div className="flex justify-between items-center mt-1 gap-16">
                                            <div className="text-[11px] font-bold">{m.sender}</div>
                                            <div className="text-[11px] text-gray-500 text-right">
                                                {formatTime(m.ts)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                         <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-full">
                            <textarea
                                rows={1}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full resize-none px-4 py-4 text-sm outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-green-500 text-white px-4 py-2 mr-2 rounded-full text-sm font-medium cursor-pointer">
                                Send
                            </button>
                        </div>
                    </div>
      </div>
    </div>
  );
};

export default MainPage;
