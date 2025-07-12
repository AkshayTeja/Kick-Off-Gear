"use client";

import React, { useState, useEffect } from "react";
import {
  IoMic,
  IoMicOutline,
  IoStopCircleOutline,
  IoStopOutline,
} from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";

interface AudioSearchProps {
  onSearch: (term: string) => void;
}

const AudioSearch: React.FC<AudioSearchProps> = ({ onSearch }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let transcript = event.results[0][0].transcript.trim();
      // Remove trailing punctuation (full stop, comma, etc.)
      transcript = transcript.replace(/[.,!?]$/, "");
      if (transcript) {
        onSearch(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSearch]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setError(null);
        } catch (err) {
          setError("Failed to start recording. Please try again.");
        }
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-500 text-white p-2 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleRecording}
        className={`rounded-full ${
          isRecording ? "bg-red-500 text-white" : "text-gray-500"
        } hover:opacity-80 transition-opacity`}
        aria-label={isRecording ? "Stop Voice Search" : "Start Voice Search"}
      >
        {isRecording ? (
          <IoStopCircleOutline size={35} />
        ) : (
          <IoMicOutline size={35} />
        )}
      </button>
      {isRecording && (
        <span className="text-sm text-gray-600 mt-1">Speak to search</span>
      )}
    </div>
  );
};

export default AudioSearch;
