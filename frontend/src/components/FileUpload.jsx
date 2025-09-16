import React, { useState } from "react";
import api from "../api/axiosInstance";

export default function FileUpload({ projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setErr("Please select a file to upload");
    setErr(null);
    setLoading(true);
    
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      console.log("Uploading file:", file.name, "to project:", projectId);
      const res = await api.post(`/projects/${projectId}/attachment`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Upload successful:", res.data);
      setFile(null);
      setSuccess("File uploaded successfully!");
      onUploaded && onUploaded(res.data.attachment);
      
      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error("Upload error:", error);
      setErr(error.response?.data?.message || error.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          ❌ {err}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
      
      <div className="space-y-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        />
        
        <div className="flex items-center space-x-3">
          <button 
            type="submit" 
            disabled={loading || !file} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Upload</span>
              </>
            )}
          </button>
          
          {file && (
            <span className="text-sm text-gray-600">
              Selected: {file.name}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
