import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { USER_NAMES, USER_EMAILS } from "../data/userIds";
import { useAuth } from "../context/AuthContext";

// Authorized email addresses (excluding admin)
const AUTHORIZED_USER_EMAILS = [
  "kavitasarapali50@gmail.com",
  "shruthirpm26@gmail.com", 
  "sanathnayak733@gmail.com",
  "saraswathisutaclasses@gmail.com",
  "spiritualyatras6@gmail.com",
  "seemaf1504@gmail.com"
];

// All authorized emails (including admin)
const ALL_AUTHORIZED_EMAILS = [
  ...AUTHORIZED_USER_EMAILS,
  "krishspider@gmail.com"
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignableProjects, setAssignableProjects] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    projectDescription: "",
    projectDeadline: "",
    revenue: 0
  });
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    attendees: []
  });
  const [meetings, setMeetings] = useState([]);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const user = auth?.user;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overviewRes, projectsRes, usersRes] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/projects/assignable"),
        api.get("/admin/users/assignable")
      ]);
      
      setStats(overviewRes.data);
      setAssignableProjects(projectsRes.data);
      setAssignableUsers(usersRes.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // If API fails, try to load users from local data as fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Authentication failed, using fallback user data");
        setAssignableUsers([
          { _id: "000000000000000000000000", name: "Kavita Sarapali", email: "kavitasarapali50@gmail.com" },
          { _id: "000000000000000000000001", name: "Shruthi RPM", email: "shruthirpm26@gmail.com" },
          { _id: "000000000000000000000002", name: "Sanath Nayak", email: "sanathnayak733@gmail.com" },
          { _id: "000000000000000000000003", name: "Saraswathi Suta", email: "saraswathisutaclasses@gmail.com" },
          { _id: "000000000000000000000004", name: "Spiritual Yatras", email: "spiritualyatras6@gmail.com" },
          { _id: "000000000000000000000005", name: "Seema F", email: "seemaf1504@gmail.com" },
          { _id: "000000000000000000000006", name: "Krish Spider", email: "krishspider@gmail.com", role: "admin" }
        ]);
      }
      // Set default stats if API fails
      setStats({
        totalProjects: 0,
        open: 0,
        inProgress: 0,
        completed: 0,
        totalUsers: AUTHORIZED_USER_EMAILS.length, // 6 employees (excluding admin)
        userWorkStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProject = async () => {
    if (!selectedProject || selectedUsers.length === 0) return;
    
    try {
      await api.post(`/admin/projects/${selectedProject}/assign`, { userIds: selectedUsers });
      alert(`Project assigned successfully to ${selectedUsers.length} user(s)!`);
      setShowAssignmentModal(false);
      setSelectedProject("");
      setSelectedUsers([]);
      setProjectSearch("");
      setUserSearch("");
      loadDashboardData(); // Refresh data
    } catch (error) {
      alert("Error assigning project: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredProjects = assignableProjects.filter(project =>
    project.projectName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredUsers = assignableUsers.filter(user => {
    // Only show authorized users (exclude dummy data)
    const isAuthorized = ALL_AUTHORIZED_EMAILS.includes(user.email);
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    
    return isAuthorized && matchesSearch;
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const handleScheduleMeeting = () => {
    setShowMeetingModal(true);
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.date || !newMeeting.time) {
      alert("Please fill in all required fields");
      return;
    }

    // Add the new meeting to the meetings array
    const meetingToAdd = {
      ...newMeeting,
      id: Date.now(), // Simple ID generation
      attendees: newMeeting.attendees.length > 0 ? newMeeting.attendees : ["All Team"]
    };
    
    setMeetings(prev => [...prev, meetingToAdd]);
    alert(`Meeting "${newMeeting.title}" scheduled for ${newMeeting.date} at ${newMeeting.time}`);
    
    // Reset form
    setNewMeeting({
      title: "",
      date: "",
      time: "",
      attendees: []
    });
    setShowMeetingModal(false);
  };

  const handleJoinMeeting = (meetingTitle) => {
    // Here you would typically integrate with a meeting service like Zoom, Teams, etc.
    alert(`Joining meeting: ${meetingTitle}`);
  };

  const handleViewMeetingDetails = (meetingTitle) => {
    alert(`Viewing details for: ${meetingTitle}`);
  };

  async function createProject() {
    if (!newProject.projectName.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      const response = await api.post("/projects", newProject);
      console.log("Project created:", response.data);
      
      // If users are selected, assign the project to them
      if (selectedUsers.length > 0) {
        try {
          await api.post(`/admin/projects/${response.data._id}/assign`, { userIds: selectedUsers });
          console.log("Project assigned to users successfully");
        } catch (assignError) {
          console.error("Error assigning project:", assignError);
          alert("Project created but failed to assign to users: " + (assignError.response?.data?.message || "Unknown error"));
        }
      }
      
      // Reset form
      setNewProject({
        projectName: "",
        projectDescription: "",
        projectDeadline: "",
        revenue: 0
      });
      setShowCreateProject(false);
      setSelectedUsers([]);
      
      // Refresh data
      loadDashboardData();
      
      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project: " + (error.response?.data?.message || "Unknown error"));
    }
  }

  const renderUserWorkChart = () => {
    if (!stats?.userWorkStats || stats.userWorkStats.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">User Work Analytics</h3>
          <p className="text-gray-500">No work assignments found</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">User Work Analytics</h3>
        <div className="space-y-4">
          {stats.userWorkStats.map((user, index) => (
            <div key={user.userId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{USER_NAMES[user.userId] || user.userName}</h4>
                    {user.userId === "507f1f77bcf86cd799439007" && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{USER_EMAILS[user.userId] || user.userEmail}</p>
                  <p className="text-xs text-blue-600 font-mono">ID: {user.userId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{user.completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion Rate</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${user.completionRate}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{user.totalProjects}</div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{user.completedProjects}</div>
                  <div className="text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{user.inProgressProjects}</div>
                  <div className="text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600">{user.openProjects}</div>
                  <div className="text-gray-500">Open</div>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Total Revenue: ₹{user.totalRevenue?.toLocaleString() || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚙️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">System Administration • Logged in as: {user?.email || 'Loading...'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>👥</span>
              <span>Assign Work</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Manager Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Employees</div>
                <div className="text-3xl font-bold text-gray-900">{AUTHORIZED_USER_EMAILS.length}</div>
                <div className="text-xs text-green-600">{AUTHORIZED_USER_EMAILS.length} online</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Active Projects</div>
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-xs text-blue-600">Across all teams</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Completed Tasks</div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-gray-500">This week</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Pending Tasks</div>
                <div className="text-3xl font-bold text-yellow-600">0</div>
                <div className="text-xs text-gray-500">Needs attention</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Overview Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📊 Employee Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
                {AUTHORIZED_USER_EMAILS.length} Online
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-gray-400 rounded-full inline-block mr-2"></span>
                0 Offline
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee List with Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="space-y-3">
                {assignableUsers.filter(employee => {
                  // Only show authorized users (exclude admin and any dummy data)
                  return AUTHORIZED_USER_EMAILS.includes(employee.email);
                }).map((employee, index) => (
                  <div key={employee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {USER_NAMES[employee._id]?.charAt(0) || employee.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{USER_NAMES[employee._id] || employee.name}</h4>
                        <p className="text-sm text-gray-500">{USER_EMAILS[employee._id] || employee.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">0%</div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Completion Rate</span>
                  <span className="font-semibold text-green-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Completed Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <div className="text-sm text-gray-600">Pending Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check Updates Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📝 Check Updates</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View All Reports
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Daily Reports */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Daily Progress Reports</h3>
              <div className="space-y-3">
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-lg font-medium mb-1">No Progress Reports Yet</p>
                  <p className="text-sm">Daily progress reports will appear here once employees start updating their work status.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Schedule Meetings Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📅 Schedule Meetings</h2>
            <button 
              onClick={handleScheduleMeeting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Schedule New Meeting
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📅</div>
                    <p className="text-gray-500 text-sm">No meetings scheduled yet</p>
                    <p className="text-gray-400 text-xs mt-1">Schedule your first meeting to get started</p>
                  </div>
                ) : (
                  meetings.map((meeting, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                        <span className="text-xs text-gray-500">{meeting.date} at {meeting.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{meeting.attendees.join(", ")}</p>
                      <button 
                        onClick={() => handleJoinMeeting(meeting.title)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Join Meeting
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Meeting Scheduler */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                  <input 
                    type="text" 
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter meeting title" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                  <select 
                    multiple 
                    value={newMeeting.attendees}
                    onChange={(e) => setNewMeeting({...newMeeting, attendees: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kavita Sarapali">Kavita Sarapali</option>
                    <option value="Shruthi RPM">Shruthi RPM</option>
                    <option value="Sanath Nayak">Sanath Nayak</option>
                    <option value="Saraswathi Suta">Saraswathi Suta</option>
                    <option value="Spiritual Yatras">Spiritual Yatras</option>
                    <option value="Seema F">Seema F</option>
                    <option value="All Team">All Team</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreateMeeting}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Meetings Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📋 Recent Meetings</h2>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Meeting History</h3>
            <div className="space-y-3">
              {recentMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📝</div>
                  <p className="text-gray-500 text-sm">No recent meetings found</p>
                  <p className="text-gray-400 text-xs mt-1">Completed meetings will appear here</p>
                </div>
              ) : (
                recentMeetings.map((meeting, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      <span className="text-xs text-gray-500">{meeting.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Duration: {meeting.duration}</p>
                    <p className="text-sm text-gray-600 mb-2">Attendees: {meeting.attendees.join(", ")}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Completed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications & Reminders Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔔 Notifications & Reminders</h2>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Send Reminder
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">🔔</div>
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                    <p className="text-gray-400 text-xs mt-1">System notifications will appear here</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      notification.type === 'deadline' ? 'bg-blue-50 border-blue-200' :
                      notification.type === 'completed' ? 'bg-green-50 border-green-200' :
                      notification.type === 'meeting' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${
                          notification.type === 'deadline' ? 'text-blue-900' :
                          notification.type === 'completed' ? 'text-green-900' :
                          notification.type === 'meeting' ? 'text-yellow-900' :
                          'text-gray-900'
                        }`}>{notification.title}</h4>
                        <span className={`text-xs ${
                          notification.type === 'deadline' ? 'text-blue-600' :
                          notification.type === 'completed' ? 'text-green-600' :
                          notification.type === 'meeting' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>{notification.time}</span>
                      </div>
                      <p className={`text-sm ${
                        notification.type === 'deadline' ? 'text-blue-700' :
                        notification.type === 'completed' ? 'text-green-700' :
                        notification.type === 'meeting' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Send Reminders */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Send Reminders</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                  <select multiple className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Team Members</option>
                    <option>Krish Spider</option>
                    <option>Kavita Sarapali</option>
                    <option>Sanath Nayak</option>
                    <option>Saraswathi Suta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Task Deadline Reminder</option>
                    <option>Meeting Reminder</option>
                    <option>Progress Update Request</option>
                    <option>Custom Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" 
                    placeholder="Enter your message..."
                  ></textarea>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Send Now
                  </button>
                  <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors">
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Work Analytics */}
          <div className="lg:col-span-3">
            {renderUserWorkChart()}
          </div>
        </div>

        {/* Enhanced Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Assign Project to Users</h3>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedProject("");
                    setSelectedUsers([]);
                    setProjectSearch("");
                    setUserSearch("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Project
                    </label>
                    <button
                      onClick={() => setShowCreateProject(!showCreateProject)}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      {showCreateProject ? 'Cancel' : '+ New Project'}
                    </button>
                  </div>
                  
                  {showCreateProject ? (
                    // Create New Project Form
                    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-900">Create New Project</h4>
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={newProject.projectName}
                        onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Project Description"
                        value={newProject.projectDescription}
                        onChange={(e) => setNewProject({...newProject, projectDescription: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={newProject.projectDeadline}
                          onChange={(e) => setNewProject({...newProject, projectDeadline: e.target.value})}
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Revenue"
                          value={newProject.revenue}
                          onChange={(e) => setNewProject({...newProject, revenue: e.target.value})}
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={createProject}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
                      >
                        Create & Assign
                      </button>
                    </div>
                  ) : (
                    // Project Selection
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredProjects.length === 0 ? (
                          <div className="p-3 text-gray-500 text-center">No projects found</div>
                        ) : (
                          filteredProjects.map(project => (
                            <div
                              key={project._id}
                              onClick={() => setSelectedProject(project._id)}
                              className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                                selectedProject === project._id ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                            >
                              <div className="font-medium text-gray-900">{project.projectName}</div>
                              <div className="text-sm text-gray-500">
                                Status: <span className="capitalize">{project.status}</span>
                              </div>
                              {project.client && (
                                <div className="text-xs text-gray-400">
                                  Client: {project.client.name || project.client.email}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users (Multiple Selection)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-gray-500 text-center">No users found</div>
                      ) : (
                        filteredUsers.map(user => (
                          <div
                            key={user._id}
                            onClick={() => toggleUserSelection(user._id)}
                            className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                              selectedUsers.includes(user._id) ? 'bg-green-50 border-green-200' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="font-medium text-gray-900">{USER_NAMES[user._id] || user.name}</div>
                                  {user._id === "507f1f77bcf86cd799439007" && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{USER_EMAILS[user._id] || user.email}</div>
                                <div className="text-xs text-blue-600 font-mono">ID: {user._id}</div>
                              </div>
                              {selectedUsers.includes(user._id) && (
                                <div className="text-green-600 text-xl">✓</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Summary */}
              {selectedProject && selectedUsers.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Assignment Summary:</h4>
                  <p className="text-sm text-blue-700">
                    Project: <span className="font-medium">{assignableProjects.find(p => p._id === selectedProject)?.projectName}</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Users: <span className="font-medium">{selectedUsers.length} selected</span>
                  </p>
                  <div className="mt-2">
                    {selectedUsers.map(userId => {
                      const user = assignableUsers.find(u => u._id === userId);
                      const displayName = USER_NAMES[userId] || user?.name || 'Unknown';
                      return (
                        <span key={userId} className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {displayName} ({userId})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAssignProject}
                  disabled={!selectedProject || selectedUsers.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedProject("");
                    setSelectedUsers([]);
                    setProjectSearch("");
                    setUserSearch("");
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Schedule New Meeting</h3>
                <button
                  onClick={() => {
                    setShowMeetingModal(false);
                    setNewMeeting({
                      title: "",
                      date: "",
                      time: "",
                      attendees: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                  <input 
                    type="text" 
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter meeting title" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                  <select 
                    multiple 
                    value={newMeeting.attendees}
                    onChange={(e) => setNewMeeting({...newMeeting, attendees: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  >
                    <option value="Kavita Sarapali">Kavita Sarapali</option>
                    <option value="Shruthi RPM">Shruthi RPM</option>
                    <option value="Sanath Nayak">Sanath Nayak</option>
                    <option value="Saraswathi Suta">Saraswathi Suta</option>
                    <option value="Spiritual Yatras">Spiritual Yatras</option>
                    <option value="Seema F">Seema F</option>
                    <option value="All Team">All Team</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple attendees</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateMeeting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Schedule Meeting
                </button>
                <button
                  onClick={() => {
                    setShowMeetingModal(false);
                    setNewMeeting({
                      title: "",
                      date: "",
                      time: "",
                      attendees: []
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
