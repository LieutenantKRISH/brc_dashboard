import React from "react";

export default function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6";
      case "lg":
        return "w-12 h-12";
      case "xl":
        return "w-16 h-16";
      default:
        return "w-8 h-8";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${getSizeClasses()} animate-spin`}>
        <div className="w-full h-full border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"></div>
      </div>
      {text && (
        <p className="text-gray-300 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}
