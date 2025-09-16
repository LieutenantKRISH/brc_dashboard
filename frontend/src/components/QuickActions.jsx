import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Create Project",
      description: "Start a new project",
      icon: "🚀",
      color: "from-cyan-500 to-blue-600",
      action: () => navigate("/ProjectForm")
    },
    {
      title: "View Analytics",
      description: "Check project metrics",
      icon: "📊",
      color: "from-green-500 to-emerald-600",
      action: () => navigate("/dashboard")
    },
    {
      title: "Team Chat",
      description: "Collaborate with team",
      icon: "💬",
      color: "from-pink-500 to-purple-600",
      action: () => alert("Team chat feature coming soon!")
    },
    {
      title: "Export Data",
      description: "Download reports",
      icon: "📤",
      color: "from-yellow-500 to-orange-600",
      action: () => alert("Export feature coming soon!")
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`group card-modern p-4 hover:scale-105 transition-all duration-300 animate-fade-in-delay`}
          style={{animationDelay: `${index * 0.1}s`}}
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:animate-float`}>
            <span className="text-2xl">{action.icon}</span>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            {action.title}
          </h3>
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
}
