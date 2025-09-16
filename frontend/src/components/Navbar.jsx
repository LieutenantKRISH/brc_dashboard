import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();
  function onLogout() {
    if (logout) {
      logout();
      navigate("/login");
    }
  }
  

  return (
    <nav className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BRC Dashboard</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name || user.email} 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Navigation Links */}
                <div className="flex items-center space-x-2">
                  {user?.role === 'admin' ? (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      My Dashboard
                    </Link>
                  )}
                </div>
                
                <Link 
                  to="/projects/new" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Add Project</span>
                </Link>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <span>📅</span>
                  <span>Schedule Meeting</span>
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <span>👥</span>
                  <span>Add Client</span>
                </button>
                <button 
                  onClick={onLogout} 
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
