import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useJobPositions } from "../hooks/useJobPositions";
import { CreatePositionData } from "../types/position";
import { formatTimeAgo } from "../utils/dateFormatter";
import toast from "react-hot-toast";

export default function JobPositions() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [editingPosition, setEditingPosition] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePositionData>({
    title: "",
    description: "",
    department: "",
    location: "",
    salary_range: "",
    requiredSkills: [],
    experience: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    positions,
    loading,
    error,
    updateFilters,
    createPosition,
    toggleStatus,
    updatePosition,
  } = useJobPositions();

  // Update filters when search or department changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({
        search: searchTerm || undefined,
        department: filterDept !== "all" ? filterDept : undefined,
      });
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, filterDept]);

  // Get unique departments from positions
  const departments = [
    "all",
    ...Array.from(new Set(positions.map((p) => p.department))),
  ];

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleStatus(id);
    if (result.success) {
      toast.success("Position status updated successfully");
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }
    if (!formData.department) {
      errors.department = "Department is required";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    if (!formData.salary_range.trim()) {
      errors.salary_range = "Salary range is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPosition) {
        // Update existing position
        const result = await updatePosition(editingPosition._id, formData);
        if (result.success) {
          toast.success("Position updated successfully");
          closeModal();
        } else {
          toast.error(result.error || "Failed to update position");
        }
      } else {
        // Create new position
        const result = await createPosition(formData);
        if (result.success) {
          toast.success("Position created successfully");
          closeModal();
        } else {
          toast.error(result.error || "Failed to create position");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setEditingPosition(null);
    resetForm();
  };

  const openEditModal = (position: any) => {
    setEditingPosition(position);
    setFormData({
      title: position.title,
      description: position.description,
      department: position.department,
      location: position.location,
      salary_range: position.salary_range || position.salary || "",
      requiredSkills: position.requiredSkills || [],
      experience: position.experience || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPosition(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      department: "",
      location: "",
      salary_range: "",
      requiredSkills: [],
      experience: "",
    });
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job Positions
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and review open positions
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span>Create Position</span>
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <div className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-transparent font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading positions...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error loading positions
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Positions List */}
        {!loading && !error && (
          <div className="space-y-4">
            {positions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No positions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first job position
                </p>
                <button
                  onClick={openModal}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  Create Position
                </button>
              </div>
            ) : (
              positions.map((job) => (
                <div
                  key={job._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 p-3 rounded-lg">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {job.description}
                        </p>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Posted {formatTimeAgo(job.posted_at)}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-600">
                            •
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {job.salary_range || job.salary || "Salary not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleToggleStatus(job._id)}
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3 transition-colors hover:opacity-80 ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status === "active" ? "Active" : "Paused"}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {job.total_applicants}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Total Applicants
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {job.qualified_count}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Qualified
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {job.department}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Department
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create/Edit Position Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPosition ? "Edit Position" : "Create New Position"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${formErrors.title
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${formErrors.department
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                  </select>
                  {formErrors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${formErrors.location
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $100k - $150k"
                    value={formData.salary_range}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_range: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${formErrors.salary_range
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.salary_range && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.salary_range}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe the role and responsibilities..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className={`w-full px-4 py-2 border ${formErrors.description
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 3-5 years"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {editingPosition ? "Updating..." : "Creating..."}
                      </>
                    ) : editingPosition ? (
                      "Update Position"
                    ) : (
                      "Create Position"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
