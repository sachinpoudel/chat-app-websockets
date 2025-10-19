import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const [inputName, setInputName] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const navigate = useNavigate();

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = inputName.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    navigate('/chat', {state: {userName: trimmed}});
    // useEffect(() => {
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className='bg-white rounded-xl shadow-lg max-w-md p-6"'>
          <h1 className="text-xl font-semibold text-black">Enter your Name</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your name to start chatting. This will be used to identify
          </p>
          <form action="" className="mt-4" onSubmit={handleNameSubmit}>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-md px-3 py-2 outline-green-500 placeholder-gray-400"
              autoFocus
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button
              type="submit"
              className="mt-4 w-full bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );




};

export default LandingPage;
