import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { useAuth } from "../context/AuthContext";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const user = auth?.user;
  const [form, setForm] = useState({
    projectName: "",
    projectDeadline: "",
    revenue: "",
    remark: "",
    meetingLink: "",
    client: { name: "", company: "", email: "", requirement: "" },
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Calculate form completion percentage
  const getFormCompletion = () => {
    const fields = [
      form.projectName,
      form.projectDeadline,
      form.revenue,
      form.client.name,
      form.client.email,
    ];
    const completedFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((completedFields / fields.length) * 100);
  };

  // Handle file upload
  const handleFileUploaded = (file) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!auth) {
      navigate("/login");
      return;
    }

    if (id && id !== "new") {
      api
        .get(`/projects/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            projectName: p.projectName || "",
            projectDeadline: p.projectDeadline
              ? new Date(p.projectDeadline).toISOString().slice(0, 10)
              : "",
            revenue: p.revenue ?? "",
            remark: p.remark ?? "",
            meetingLink: p.meetingLink ?? "",
            client: {
              name: p.client?.name ?? "",
              company: p.client?.company ?? "",
              email: p.client?.email ?? "",
              requirement: p.client?.requirement ?? "",
            },
          });
        })
        .catch((err) => {
          console.error("Error fetching project:", err);
          if (err.response?.status === 401) {
            navigate("/login");
          }
        });
    } else {
      // Load draft data for new projects
      const draftData = localStorage.getItem('projectDraft');
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          setForm({
            projectName: draft.projectName || "",
            projectDeadline: draft.projectDeadline || "",
            revenue: draft.revenue || "",
            remark: draft.remark || "",
            meetingLink: draft.meetingLink || "",
            client: {
              name: draft.client?.name || "",
              company: draft.client?.company || "",
              email: draft.client?.email || "",
              requirement: draft.client?.requirement || "",
            },
          });
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [id, auth, navigate]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // Validate required fields
      if (!form.projectName.trim()) {
        setErr("Project name is required");
        setLoading(false);
        return;
      }
      
      if (!form.projectDeadline) {
        setErr("Project deadline is required");
        setLoading(false);
        return;
      }

      const payload = {
        projectName: form.projectName.trim(),
        projectDeadline: form.projectDeadline,
        revenue: Number(form.revenue) || 0,
        remark: form.remark || "",
        meetingLink: form.meetingLink || "",
        client: form.client.name || form.client.email ? form.client : null,
      };

      console.log("Submitting payload:", payload); // Debug log
      
      if (!id || id === "new") {
        const response = await api.post("/projects", payload);
        console.log("Project created:", response.data); // Debug log
        setSuccess("Project created successfully!");
        // Clear draft after successful creation
        localStorage.removeItem('projectDraft');
        
        // Show success message and navigate immediately
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        const response = await api.patch(`/projects/${id}`, payload);
        console.log("Project updated:", response.data); // Debug log
        setSuccess("Project updated successfully!");
        
        // Show success message and navigate immediately
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating project:", error); // Debug log
      
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        navigate("/login");
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Save failed";
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-2xl text-white">🚀</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Project
            </h1>
            <p className="text-gray-600">
              Fill in the details to create your project
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Form Completion</span>
              <span className="text-sm font-medium text-blue-600">{getFormCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getFormCompletion()}%` }}
              ></div>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center space-x-2">
              <span>❌</span>
              <span>Save failed</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
              ✅ {success}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-8">
          {/* Project Info Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  🚀 Project Name
                </label>
                <input
                  value={form.projectName}
                  onChange={(e) =>
                    setForm({ ...form, projectName: e.target.value })
                  }
                  placeholder="Enter project name"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {form.projectName && (
                  <p className="text-xs text-green-600 flex items-center space-x-1">
                    <span>✓</span>
                    <span>Project name looks good!</span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📅 Deadline
                </label>
                <div className="relative">
                  <input
                    value={form.projectDeadline}
                    onChange={(e) =>
                      setForm({ ...form, projectDeadline: e.target.value })
                    }
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
                </div>
                {form.projectDeadline && (
                  <p className="text-xs text-green-600 flex items-center space-x-1">
                    <span>✓</span>
                    <span>Deadline set for {new Date(form.projectDeadline).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  💰 Revenue
                </label>
                <input
                  value={form.revenue}
                  onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                  placeholder="Enter revenue amount"
                  type="number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  🔗 Meeting Link
                </label>
                <input
                  value={form.meetingLink}
                  onChange={(e) =>
                    setForm({ ...form, meetingLink: e.target.value })
                  }
                  placeholder="Enter meeting link"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                📝 Remarks
              </label>
              <textarea
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                placeholder="Enter project remarks or notes"
                rows="4"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Document Upload Section - Optional */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📎</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Documents (Optional)</h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📄 Upload Documents <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <p className="text-sm text-gray-600">Upload project-related documents, contracts, or specifications. This step is optional and can be done later.</p>
                {id && id !== "new" ? (
                  <FileUpload projectId={id} onUploaded={handleFileUploaded} />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-gray-500">
                      <p className="text-sm mb-2">📄 Documents are optional</p>
                      <p className="text-xs">You can upload documents after creating the project</p>
                    </div>
                  </div>
                )}
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>📄</span>
                        <span>{file.name || file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    👤 Client Name
                  </label>
                  <input
                    value={form.client.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        client: { ...form.client, name: e.target.value },
                      })
                    }
                    placeholder="Enter client name"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    🏢 Company
                  </label>
                  <input
                    value={form.client.company}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        client: { ...form.client, company: e.target.value },
                      })
                    }
                    placeholder="Enter company name"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📧 Email Address
                </label>
                <input
                  value={form.client.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      client: { ...form.client, email: e.target.value },
                    })
                  }
                  placeholder="Enter client email"
                  type="email"
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {form.client.email && (
                  <p className="text-xs text-green-600">
                    ✓ {form.client.email.includes('@') ? 'Valid email format!' : 'Please enter a valid email'}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📋 Requirements
                </label>
                <textarea
                  value={form.client.requirement}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      client: { ...form.client, requirement: e.target.value },
                    })
                  }
                  placeholder="Enter client requirements and specifications"
                  rows="4"
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    projectName: "",
                    projectDeadline: "",
                    revenue: "",
                    remark: "",
                    meetingLink: "",
                    client: { name: "", company: "", email: "", requirement: "" },
                  });
                  setErr(null);
                  setSuccess(null);
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Clear Form</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Save as draft functionality
                  const draftData = {
                    ...form,
                    revenue: Number(form.revenue) || 0,
                    client: form.client,
                    status: 'draft'
                  };
                  localStorage.setItem('projectDraft', JSON.stringify(draftData));
                  setSuccess("Draft saved successfully!");
                  setTimeout(() => setSuccess(null), 3000);
                }}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Save Draft</span>
              </button>
              
              <button
                type="submit"
                disabled={loading || !form.projectName || !form.projectDeadline}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
