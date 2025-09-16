import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import FileUpload from "../components/FileUpload";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  function onUploaded(att) {
    setProject((p) => ({ ...p, attachments: [...(p.attachments || []), att] }));
  }

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading...</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
        {err && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {err}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {project.projectName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Status:{" "}
                <span className="font-medium text-gray-700 capitalize">
                  {project.status}
                </span>
              </p>
              {project.remark && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {project.remark}
                </p>
              )}
            </div>
            <div>
              <Link
                to={`/projects/${id}/edit`}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg shadow transition"
              >
                Edit
              </Link>
            </div>
          </div>

          {/* Meeting link */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Meeting Link</h3>
            {project.meetingLink ? (
              <a
                className="text-blue-600 hover:underline break-words"
                href={project.meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                {project.meetingLink}
              </a>
            ) : (
              <p className="text-gray-500 italic">None</p>
            )}
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Attachments</h3>
            <div className="mt-3 space-y-2">
              {project.attachments && project.attachments.length > 0 ? (
                project.attachments.map((a, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  >
                    <div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {a.originalname || a.filename}
                      </a>
                      <div className="text-xs text-gray-500">
                        {a.mimetype} • {(a.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No attachments</p>
              )}
            </div>

            <div className="mt-4">
              <FileUpload projectId={id} onUploaded={onUploaded} />
            </div>
          </div>

          {/* Client */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Client</h3>
            {project.client ? (
              <ul className="mt-2 space-y-1 text-gray-700">
                <li>
                  <span className="font-medium">Name:</span>{" "}
                  {project.client.name}
                </li>
                <li>
                  <span className="font-medium">Company:</span>{" "}
                  {project.client.company}
                </li>
                <li>
                  <span className="font-medium">Email:</span>{" "}
                  {project.client.email}
                </li>
                <li>
                  <span className="font-medium">Requirement:</span>{" "}
                  {project.client.requirement}
                </li>
              </ul>
            ) : (
              <p className="text-gray-500 italic">No client attached</p>
            )}
          </div>
        </div>
    </div>
  );
}
