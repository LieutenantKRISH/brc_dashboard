import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import ProjectCard from "../components/ProjectCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const user = auth?.user;

  // Function to load projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err.response?.data || err.message);
      setError("Failed to load projects. Please try again.");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle My Schedule button click
  const handleMySchedule = () => {
    // For now, show an alert. This can be expanded to show a schedule modal or navigate to a schedule page
    alert(`Schedule for ${user?.name || 'User'}\n\nNo meetings or events scheduled at this time.\n\nThis feature will be available soon!`);
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!auth) {
      console.log("No auth found, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("Auth found, loading projects:", auth);
    loadProjects();
  }, [auth, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            </div>
            <p className="text-gray-600">Welcome back, {user?.name || user?.email || 'User'}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleMySchedule}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span>📅</span>
              <span>My Schedule</span>
            </button>
            <button 
              onClick={() => {
                if (logout) {
                  logout();
                  navigate("/login");
                }
              }}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span>→</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Personal Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">My Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-gray-500 text-sm">assigned to me</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
                <p className="text-gray-500 text-sm">projects finished</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
                <p className="text-gray-500 text-sm">currently working</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Due Soon</p>
                <p className="text-3xl font-bold text-red-600">
                  {projects.filter(p => {
                    if (!p.projectDeadline) return false;
                    const deadline = new Date(p.projectDeadline);
                    const today = new Date();
                    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                    return diffDays <= 7 && diffDays >= 0;
                  }).length}
                </p>
                <p className="text-gray-500 text-sm">within 7 days</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Tasks Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📌 My Tasks / Projects</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Update Progress
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Progress */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Current Tasks</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Current Tasks</h4>
                <p className="text-gray-500 text-sm">You don't have any tasks assigned at the moment.</p>
              </div>
            </div>

            {/* Submit Updates */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📝 Submit Updates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's Done Today</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" 
                    placeholder="Describe completed tasks..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blockers/Issues</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-16" 
                    placeholder="Any obstacles or challenges..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-16" 
                    placeholder="Plans for tomorrow..."
                  ></textarea>
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Submit Daily Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Meetings Section</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Meetings</h4>
                <p className="text-gray-500 text-sm">You don't have any meetings scheduled.</p>
              </div>
            </div>

            {/* Meeting History */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Recent Meetings</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Meetings</h4>
                <p className="text-gray-500 text-sm">No meetings have been held recently.</p>
              </div>
            </div>
          </div>
        </div>

         {/* Resources Section - Optional */}
         <div className="mb-8 animate-fade-in">
           <h2 className="text-xl font-bold text-gray-900 mb-4">📂 Resources <span className="text-sm font-normal text-gray-500">(optional)</span></h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Files & Documents</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Upload File
              </button>
            </div>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📁</span>
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-3">No Files Available</h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                No project files or documents have been uploaded yet. Upload your first file to get started.
              </p>
              <div className="text-sm text-gray-400">
                <p>• Supported formats: PDF, DOC, XLS, PPT, Images</p>
                <p>• Maximum file size: 10MB per file</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Settings Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Profile & Settings</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user?.name || 'User Name'}</h4>
                      <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                      <p className="text-xs text-blue-600">Role: {user?.role || 'Employee'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={user?.name || ''} 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates about projects and meetings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Meeting Reminders</h4>
                      <p className="text-sm text-gray-500">Get notified 15 minutes before meetings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Task Updates</h4>
                      <p className="text-sm text-gray-500">Notifications for task assignments and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Projects Section */}
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No projects assigned</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You don't have any projects assigned to you yet. Contact your admin to get started with your first project.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Check with your team lead for assignments</p>
                <p>• Projects will appear here once assigned</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <div key={project._id || project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
