"use client";

import React, { useState, useEffect, useRef } from "react";
import { RiChat1Line } from "react-icons/ri";
import supabase from "../supabaseClient";
import { useRouter } from "next/navigation";

// Define types
interface User {
  id: string;
  email?: string;
}

interface Message {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  email?: string; // Store email directly instead of profiles
}

const ChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const botUserId = "8d985be7-3fa1-453a-aa58-c73627a0e4";
  const botEmail = "bot@kickoffgear.com";

  const generateBotResponse = async (message: string): Promise<string> => {
    const msg = message.toLowerCase();

    if (msg.includes("order") || msg.includes("orders")) {
      if (!msg.includes("track")) {
        return "Head over to your profile to find your orders.";
      }
    }

    if (
      msg.includes("find") ||
      msg.includes("search") ||
      msg.includes("available") ||
      msg.includes("availability") ||
      msg.includes("jersey") ||
      msg.includes("boot") ||
      msg.includes("football")
    ) {
      return "To search or find products, head over to our search bar at the top of the page.";
    }

    if (msg.includes("shipping") || msg.includes("delivery")) {
      return "We offer standard shipping (3-5 days, $5) and express (1-2 days, $15). Track your order for updates! Need specific details? FREE SHIPPING THIS WEEK, ORDER OVER $1717";
    }

    if (msg.includes("return") || msg.includes("refund")) {
      return "Returns are free within 30 days if unused and in packaging. Contact support to start a return. Anything else?";
    }

    if (msg.includes("payment") || msg.includes("pay")) {
      return "We accept payments via Stripe";
    }

    if (msg.includes("order") && msg.includes("track")) {
      return "I can help you track your order! Please check your email for tracking information, or contact support with your order ID.";
    }

    if (
      msg.includes("promotion") ||
      msg.includes("offer") ||
      msg.includes("sale")
    ) {
      return "Check out our current promotions! We have great deals on football gear. Visit our promotions page for the latest offers.";
    }

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "Hello! Welcome to KickOffGear. How can I help you today? I can assist with orders, shipping, returns, or help you find products!";
    }

    if (msg.includes("help")) {
      return "I'm here to help! You can ask me about:\n- Shipping and delivery\n- Returns and refunds\n- Payment methods\n- Order tracking\n- Product recommendations\n- Current promotions\n\nWhat would you like to know?";
    }

    return "I'm here to help! You can ask me about shipping, returns, payments, order tracking, or finding products. What would you like to know?";
  };

  // Fetch user and set welcome message
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw new Error(`Auth error: ${userError.message}`);

        if (!user) {
          setError("Please log in to use the chat.");
          router.push("/auth");
          return;
        }

        setUser(user);

        // Add welcome message
        setMessages([
          {
            id: Date.now(),
            user_id: botUserId,
            content: `Welcome to KickOffGear, ${
              user.email?.split("@")[0] || "there"
            }! How can I help you today? Try asking about shipping, returns, or search for products (e.g., 'find football boots').`,
            created_at: new Date().toISOString(),
            email: botEmail,
          },
        ]);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load chat data."
        );
      }
    };

    fetchUserAndMessages();
  }, [router]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message and bot response
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // Add user message to UI
      const userMessage: Message = {
        id: Date.now(),
        user_id: user.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        email: user.email || "User",
      };

      setMessages((prev) => [...prev, userMessage]);

      // Generate bot response
      setIsBotTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const botResponse = await generateBotResponse(newMessage.trim());

      // Add bot response to UI
      const botMessage: Message = {
        id: Date.now() + 1,
        user_id: botUserId,
        content: botResponse,
        created_at: new Date().toISOString(),
        email: botEmail,
      };

      setMessages((prev) => [...prev, botMessage]);
      setNewMessage("");
      setIsBotTyping(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
      setIsBotTyping(false);
    }
  };

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim()) {
      void handleSendMessage();
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-2 rounded-lg text-sm">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-2 underline"
          aria-label="Clear error"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Icon */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 rounded-full p-3 text-white hover:bg-blue-700 transition-colors duration-200 shadow-lg"
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <RiChat1Line size={24} />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 sm:w-96">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Chat Support
            </h3>
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-64 overflow-y-auto mb-2 border border-gray-200 rounded p-2 text-sm sm:text-base">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.user_id === user?.id ? "text-right" : "text-left"
                  }`}
                >
                  <div className="block text-xs text-gray-500 mb-1">
                    {message.email || "Unknown"} (
                    {new Date(message.created_at).toLocaleTimeString()})
                  </div>
                  {message.user_id === botUserId ? (
                    <div
                      className="inline-block p-2 rounded-lg max-w-xs bg-gray-100 text-gray-800"
                      style={{ whiteSpace: "pre-wrap" }}
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <div
                      className="inline-block p-2 rounded-lg max-w-xs bg-blue-100 text-blue-800"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No messages yet.</p>
            )}
            {isBotTyping && (
              <p className="text-gray-600 text-sm italic">Bot is typing...</p>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewMessage(e.target.value)
              }
              onKeyPress={handleKeyPress}
              className="flex-1 border-gray-200 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              disabled={!user}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
              disabled={!user || !newMessage.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
