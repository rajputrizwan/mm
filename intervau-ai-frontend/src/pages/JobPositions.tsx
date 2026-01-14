import { useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { ROUTES } from "../router";

export default function JobPositions() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "active",
      posted: "2 weeks ago",
      applicants: 24,
      qualified: 8,
      salary: "$150k - $200k",
      description: "Build scalable web applications with React and Node.js",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      status: "active",
      posted: "1 week ago",
      applicants: 18,
      qualified: 5,
      salary: "$140k - $180k",
      description: "Lead product strategy and roadmap development",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      status: "active",
      posted: "3 days ago",
      applicants: 12,
      qualified: 4,
      salary: "$130k - $170k",
      description: "Manage cloud infrastructure and deployment pipelines",
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "active",
      posted: "5 days ago",
      applicants: 15,
      qualified: 3,
      salary: "$110k - $150k",
      description: "Design beautiful and intuitive user interfaces",
    },
    {
      id: 5,
      title: "Operations Specialist",
      department: "Operations",
      location: "Remote",
      type: "Full-time",
      status: "paused",
      posted: "1 month ago",
      applicants: 31,
      qualified: 7,
      salary: "$80k - $110k",
      description: "Optimize business processes and workflows",
    },
    {
      id: 6,
      title: "Frontend Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "active",
      posted: "1 week ago",
      applicants: 22,
      qualified: 9,
      salary: "$120k - $160k",
      description: "Build responsive web applications with modern frameworks",
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || job.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  const departments = ["all", ...new Set(jobs.map((j) => j.department))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Positions
            </h1>
            <p className="text-gray-600">Manage and review open positions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span>Create Position</span>
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <div className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {job.description}
                    </p>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Posted {job.posted}</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="font-medium text-gray-700">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3 ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status === "active" ? "Active" : "Paused"}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {job.applicants}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total Applicants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {job.qualified}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Qualified</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {job.department}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Department</p>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    Edit
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create New Position
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Developer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>Design</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
