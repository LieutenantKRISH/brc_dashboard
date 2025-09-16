import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const isOverdue = new Date(project.projectDeadline) < new Date();
  const isDueSoon = new Date(project.projectDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {project.projectName}
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isOverdue 
            ? 'bg-red-100 text-red-700' 
            : isDueSoon 
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'In Progress'}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        {project.description || 'No description available'}
      </p>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm text-gray-600">0%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>📅</span>
          <span>{new Date(project.projectDeadline).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>👥</span>
          <span>Team members</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Client:</span>
          <span>{project.client || 'Not assigned'}</span>
        </div>
        
        {project.revenue && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Revenue:</span>
            <span className="text-green-600 font-medium">${project.revenue.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <Link
        to={`/projects/${project._id}`}
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <span>View Details</span>
        <span>→</span>
      </Link>
    </div>
  );
}
