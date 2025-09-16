import React, { useState, useEffect } from "react";

export default function NotificationToast({ message, type = "info", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/50 text-green-200";
      case "error":
        return "bg-red-500/20 border-red-500/50 text-red-200";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-200";
      default:
        return "bg-cyan-500/20 border-cyan-500/50 text-cyan-200";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getTypeStyles()}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className="ml-2 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
