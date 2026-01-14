// import { useState, useEffect } from "react";
// import {
//   User,
//   Mail,
//   Briefcase,
//   Bell,
//   Moon,
//   LogOut,
//   Save,
//   Camera,
//   Lock,
//   Globe,
//   AlertCircle,
//   CheckCircle,
//   Loader,
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useApp } from "@/contexts/AppContext";
// import { useNavigate } from "react-router-dom";
// import api from "@/services/api";

// interface UserProfile {
//   _id?: string;
//   name: string;
//   email: string;
//   role: "candidate" | "hr";
//   avatar?: string;
//   phone?: string;
//   bio?: string;
//   createdAt?: string;
// }

// interface NotificationSettings {
//   emailNotifications: boolean;
//   interviewReminders: boolean;
//   weeklyReports: boolean;
//   communityUpdates: boolean;
// }

// interface SecuritySettings {
//   twoFactorEnabled: boolean;
//   activeSessions: Array<{
//     id: string;
//     device: string;
//     lastActive: string;
//     current: boolean;
//   }>;
// }

// export default function ProfileSettings() {
//   const { user, logout } = useAuth();
//   const { theme, toggleTheme } = useApp();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState<
//     "profile" | "preferences" | "security"
//   >("profile");
//   const [profile, setProfile] = useState<UserProfile>({
//     name: "",
//     email: "",
//     role: "candidate",
//     avatar: "",
//     phone: "",
//     bio: "",
//   });

//   const [notifications, setNotifications] = useState<NotificationSettings>({
//     emailNotifications: true,
//     interviewReminders: true,
//     weeklyReports: true,
//     communityUpdates: false,
//   });

//   const [security, setSecurity] = useState<SecuritySettings>({
//     twoFactorEnabled: false,
//     activeSessions: [
//       {
//         id: "1",
//         device: "Chrome on macOS",
//         lastActive: "Today at 2:30 PM",
//         current: true,
//       },
//     ],
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
//   const [loading, setLoading] = useState(false);
//   const [imageLoading, setImageLoading] = useState(false);
//   const [message, setMessage] = useState<{
//     type: "success" | "error";
//     text: string;
//   } | null>(null);
//   const [passwordForm, setPasswordForm] = useState({
//     current: "",
//     new: "",
//     confirm: "",
//   });
//   const [showPasswordForm, setShowPasswordForm] = useState(false);

//   // Load user profile on mount
//   useEffect(() => {
//     if (user) {
//       setProfile({
//         _id: user._id || user.id,
//         name: user.name || "",
//         email: user.email || "",
//         role: user.role || "candidate",
//         avatar: user.avatar || "",
//         phone: user.phone || "",
//         bio: user.bio || "",
//         createdAt: user.createdAt || new Date().toISOString(),
//       });
//       setEditedProfile({
//         _id: user._id || user.id,
//         name: user.name || "",
//         email: user.email || "",
//         role: user.role || "candidate",
//         avatar: user.avatar || "",
//         phone: user.phone || "",
//         bio: user.bio || "",
//       });
//     }
//   }, [user]);

//   // Handle image upload to Cloudinary
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setImageLoading(true);
//     setMessage(null);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append(
//         "upload_preset",
//         import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "intervau_ai"
//       );

//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${
//           import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
//         }/image/upload`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!response.ok) throw new Error("Upload failed");

//       const data = await response.json();
//       const imageUrl = data.secure_url;

//       // Update profile with new image
//       const updateResponse = await api.updateProfile({
//         ...editedProfile,
//         avatar: imageUrl,
//       });

//       if (updateResponse.success) {
//         setProfile((prev) => ({ ...prev, avatar: imageUrl }));
//         setEditedProfile((prev) => ({ ...prev, avatar: imageUrl }));
//         setMessage({
//           type: "success",
//           text: "Profile picture updated successfully!",
//         });
//         setTimeout(() => setMessage(null), 3000);
//       } else {
//         throw new Error(updateResponse.error || "Failed to update profile");
//       }
//     } catch (error) {
//       console.error("Image upload error:", error);
//       setMessage({
//         type: "error",
//         text:
//           error instanceof Error
//             ? error.message
//             : "Failed to upload image. Please try again.",
//       });
//     } finally {
//       setImageLoading(false);
//     }
//   };

//   // Handle profile update
//   const handleSaveProfile = async () => {
//     setLoading(true);
//     setMessage(null);

//     try {
//       const updateResponse = await api.updateProfile(editedProfile);

//       if (updateResponse.success) {
//         setProfile(editedProfile);
//         setIsEditing(false);
//         setMessage({ type: "success", text: "Profile updated successfully!" });
//         setTimeout(() => setMessage(null), 3000);
//       } else {
//         setMessage({
//           type: "error",
//           text: updateResponse.error || "Failed to update profile",
//         });
//       }
//     } catch (error) {
//       console.error("Profile update error:", error);
//       setMessage({
//         type: "error",
//         text: "Failed to update profile. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle password change
//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     if (passwordForm.new !== passwordForm.confirm) {
//       setMessage({ type: "error", text: "Passwords do not match" });
//       setLoading(false);
//       return;
//     }

//     if (passwordForm.new.length < 6) {
//       setMessage({
//         type: "error",
//         text: "Password must be at least 6 characters",
//       });
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.changePassword({
//         currentPassword: passwordForm.current,
//         newPassword: passwordForm.new,
//         confirmPassword: passwordForm.confirm,
//       });

//       if (response.success) {
//         setMessage({ type: "success", text: "Password changed successfully!" });
//         setPasswordForm({ current: "", new: "", confirm: "" });
//         setShowPasswordForm(false);
//         setTimeout(() => setMessage(null), 3000);
//       } else {
//         setMessage({
//           type: "error",
//           text: response.error || "Failed to change password",
//         });
//       }
//     } catch (error) {
//       console.error("Password change error:", error);
//       setMessage({
//         type: "error",
//         text: "Failed to change password. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle logout
//   const handleLogout = async () => {
//     if (!window.confirm("Are you sure you want to sign out?")) return;

//     setLoading(true);
//     try {
//       await logout();
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       setMessage({ type: "error", text: "Failed to sign out" });
//       setLoading(false);
//     }
//   };

//   // Handle account deletion
//   const handleDeleteAccount = async () => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete your account? This action cannot be undone."
//       )
//     )
//       return;

//     const password = window.prompt(
//       "Enter your password to confirm account deletion:"
//     );
//     if (!password) return;

//     setLoading(true);
//     setMessage(null);

//     try {
//       const response = await api.deleteAccount(password);

//       if (response.success) {
//         setMessage({
//           type: "success",
//           text: "Account deleted. Redirecting...",
//         });
//         setTimeout(() => {
//           logout();
//           navigate("/");
//         }, 2000);
//       } else {
//         setMessage({
//           type: "error",
//           text: response.error || "Failed to delete account",
//         });
//       }
//     } catch (error) {
//       console.error("Account deletion error:", error);
//       setMessage({
//         type: "error",
//         text: "Failed to delete account. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (field: keyof UserProfile, value: string) => {
//     setEditedProfile({ ...editedProfile, [field]: value });
//   };

//   // Handle notification change
//   const handleNotificationChange = (field: keyof NotificationSettings) => {
//     setNotifications({ ...notifications, [field]: !notifications[field] });
//   };

//   // Format date
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "Unknown";
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });
//     } catch {
//       return "Unknown";
//     }
//   };

//   const getAvatarInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
//             Settings & Profile
//           </h1>
//           <p className="text-lg text-gray-600 dark:text-gray-400">
//             Manage your account and preferences
//           </p>
//         </div>

//         {/* Message Alert */}
//         {message && (
//           <div
//             className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
//               message.type === "success"
//                 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
//                 : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
//             }`}
//           >
//             {message.type === "success" ? (
//               <CheckCircle className="w-5 h-5 flex-shrink-0" />
//             ) : (
//               <AlertCircle className="w-5 h-5 flex-shrink-0" />
//             )}
//             <span>{message.text}</span>
//           </div>
//         )}

//         <div className="grid lg:grid-cols-4 gap-6">
//           {/* Sidebar Menu */}
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 h-fit">
//             <h3 className="font-bold text-gray-900 dark:text-white mb-4">
//               Settings Menu
//             </h3>
//             <div className="space-y-2">
//               <button
//                 onClick={() => setActiveTab("profile")}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
//                   activeTab === "profile"
//                     ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
//                     : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                 }`}
//               >
//                 <User className="w-5 h-5" />
//                 <span className="font-medium">Profile</span>
//               </button>
//               <button
//                 onClick={() => setActiveTab("preferences")}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
//                   activeTab === "preferences"
//                     ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
//                     : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                 }`}
//               >
//                 <Bell className="w-5 h-5" />
//                 <span className="font-medium">Preferences</span>
//               </button>
//               <button
//                 onClick={() => setActiveTab("security")}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
//                   activeTab === "security"
//                     ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
//                     : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                 }`}
//               >
//                 <Lock className="w-5 h-5" />
//                 <span className="font-medium">Security</span>
//               </button>
//             </div>
//             <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
//               <button
//                 onClick={handleLogout}
//                 disabled={loading}
//                 className="w-full flex items-center space-x-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
//               >
//                 {loading ? (
//                   <Loader className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <LogOut className="w-5 h-5" />
//                 )}
//                 <span className="font-medium">Sign Out</span>
//               </button>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {/* Profile Tab */}
//             {activeTab === "profile" && (
//               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
//                   Profile Information
//                 </h2>

//                 <div className="space-y-8">
//                   {/* Profile Picture */}
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
//                         Profile Picture
//                       </h3>
//                       <p className="text-gray-600 dark:text-gray-400">
//                         Upload a profile photo for your account
//                       </p>
//                     </div>
//                     <div className="relative">
//                       <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
//                         {editedProfile.avatar ? (
//                           <img
//                             src={editedProfile.avatar}
//                             alt="Profile"
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           getAvatarInitials(editedProfile.name)
//                         )}
//                       </div>
//                       <label
//                         htmlFor="avatar-upload"
//                         className="absolute bottom-0 right-0 cursor-pointer"
//                       >
//                         <div className="bg-white border-2 border-blue-600 text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
//                           {imageLoading ? (
//                             <Loader className="w-4 h-4 animate-spin" />
//                           ) : (
//                             <Camera className="w-4 h-4" />
//                           )}
//                         </div>
//                       </label>
//                       <input
//                         id="avatar-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         disabled={imageLoading}
//                         className="hidden"
//                       />
//                     </div>
//                   </div>

//                   {isEditing ? (
//                     <>
//                       {/* Edit Mode */}
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Full Name
//                         </label>
//                         <input
//                           type="text"
//                           value={editedProfile.name}
//                           onChange={(e) =>
//                             handleInputChange("name", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter your full name"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Email Address
//                         </label>
//                         <input
//                           type="email"
//                           value={editedProfile.email}
//                           onChange={(e) =>
//                             handleInputChange("email", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter your email"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Phone Number
//                         </label>
//                         <input
//                           type="tel"
//                           value={editedProfile.phone || ""}
//                           onChange={(e) =>
//                             handleInputChange("phone", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter your phone number"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Bio
//                         </label>
//                         <textarea
//                           value={editedProfile.bio || ""}
//                           onChange={(e) =>
//                             handleInputChange("bio", e.target.value)
//                           }
//                           rows={4}
//                           className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                           placeholder="Tell us about yourself"
//                         />
//                       </div>

//                       <div className="flex items-center space-x-3 pt-6">
//                         <button
//                           onClick={handleSaveProfile}
//                           disabled={loading}
//                           className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           {loading ? (
//                             <Loader className="w-4 h-4 animate-spin" />
//                           ) : (
//                             <Save className="w-4 h-4" />
//                           )}
//                           <span>Save Changes</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             setEditedProfile(profile);
//                             setIsEditing(false);
//                           }}
//                           disabled={loading}
//                           className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       {/* View Mode */}
//                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               Full Name
//                             </span>
//                           </div>
//                           <span className="font-semibold text-gray-900 dark:text-white">
//                             {profile.name || "Not provided"}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               Email Address
//                             </span>
//                           </div>
//                           <span className="font-semibold text-gray-900 dark:text-white">
//                             {profile.email}
//                           </span>
//                         </div>
//                       </div>

//                       {profile.phone && (
//                         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               Phone Number
//                             </span>
//                             <span className="font-semibold text-gray-900 dark:text-white">
//                               {profile.phone}
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               Role
//                             </span>
//                           </div>
//                           <span className="font-semibold text-gray-900 dark:text-white capitalize">
//                             {profile.role}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm text-gray-600 dark:text-gray-300">
//                             Member Since
//                           </span>
//                           <span className="font-semibold text-gray-900 dark:text-white">
//                             {formatDate(profile.createdAt)}
//                           </span>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => setIsEditing(true)}
//                         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium"
//                       >
//                         Edit Profile
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Preferences Tab */}
//             {activeTab === "preferences" && (
//               <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
//                   Preferences
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Theme */}
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                       Theme
//                     </h3>
//                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                       <div className="flex items-center space-x-3">
//                         <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                         <span className="font-medium text-gray-900 dark:text-white">
//                           Dark Mode
//                         </span>
//                       </div>
//                       <button
//                         onClick={toggleTheme}
//                         className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
//                           theme === "dark" ? "bg-blue-600" : "bg-gray-300"
//                         }`}
//                       >
//                         <span
//                           className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                             theme === "dark" ? "translate-x-7" : "translate-x-1"
//                           }`}
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Notifications */}
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                       Notifications
//                     </h3>
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             Email Notifications
//                           </p>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             Receive updates via email
//                           </p>
//                         </div>
//                         <button
//                           onClick={() =>
//                             handleNotificationChange("emailNotifications")
//                           }
//                           className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
//                             notifications.emailNotifications
//                               ? "bg-green-600"
//                               : "bg-gray-300"
//                           }`}
//                         >
//                           <span
//                             className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                               notifications.emailNotifications
//                                 ? "translate-x-7"
//                                 : "translate-x-1"
//                             }`}
//                           />
//                         </button>
//                       </div>

//                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             Interview Reminders
//                           </p>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             Get notified before interviews
//                           </p>
//                         </div>
//                         <button
//                           onClick={() =>
//                             handleNotificationChange("interviewReminders")
//                           }
//                           className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
//                             notifications.interviewReminders
//                               ? "bg-green-600"
//                               : "bg-gray-300"
//                           }`}
//                         >
//                           <span
//                             className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                               notifications.interviewReminders
//                                 ? "translate-x-7"
//                                 : "translate-x-1"
//                             }`}
//                           />
//                         </button>
//                       </div>

//                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             Weekly Reports
//                           </p>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             Summary of your activity each week
//                           </p>
//                         </div>
//                         <button
//                           onClick={() =>
//                             handleNotificationChange("weeklyReports")
//                           }
//                           className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
//                             notifications.weeklyReports
//                               ? "bg-green-600"
//                               : "bg-gray-300"
//                           }`}
//                         >
//                           <span
//                             className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                               notifications.weeklyReports
//                                 ? "translate-x-7"
//                                 : "translate-x-1"
//                             }`}
//                           />
//                         </button>
//                       </div>

//                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             Community Updates
//                           </p>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             News and updates from our community
//                           </p>
//                         </div>
//                         <button
//                           onClick={() =>
//                             handleNotificationChange("communityUpdates")
//                           }
//                           className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
//                             notifications.communityUpdates
//                               ? "bg-green-600"
//                               : "bg-gray-300"
//                           }`}
//                         >
//                           <span
//                             className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                               notifications.communityUpdates
//                                 ? "translate-x-7"
//                                 : "translate-x-1"
//                             }`}
//                           />
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Language & Region */}
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                       Language & Region
//                     </h3>
//                     <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                       <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                       <select className="flex-1 bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer">
//                         <option>English (US)</option>
//                         <option>Spanish (ES)</option>
//                         <option>French (FR)</option>
//                         <option>German (DE)</option>
//                         <option>Portuguese (PT)</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Security Tab */}
//             {activeTab === "security" && (
//               <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
//                   Security Settings
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Security Alert */}
//                   <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
//                     <div className="flex items-start space-x-3">
//                       <Lock className="w-6 h-6 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-1">
//                           Password Security
//                         </h3>
//                         <p className="text-sm text-orange-800 dark:text-orange-300">
//                           Keep your account secure by using a strong, unique
//                           password
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Change Password */}
//                   {!showPasswordForm ? (
//                     <button
//                       onClick={() => setShowPasswordForm(true)}
//                       className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
//                     >
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         Change Password
//                       </span>
//                       <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400">
//                         →
//                       </span>
//                     </button>
//                   ) : (
//                     <form
//                       onSubmit={handleChangePassword}
//                       className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
//                     >
//                       <h3 className="font-bold text-gray-900 dark:text-white mb-4">
//                         Change Password
//                       </h3>
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                             Current Password
//                           </label>
//                           <input
//                             type="password"
//                             value={passwordForm.current}
//                             onChange={(e) =>
//                               setPasswordForm({
//                                 ...passwordForm,
//                                 current: e.target.value,
//                               })
//                             }
//                             className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter current password"
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                             New Password
//                           </label>
//                           <input
//                             type="password"
//                             value={passwordForm.new}
//                             onChange={(e) =>
//                               setPasswordForm({
//                                 ...passwordForm,
//                                 new: e.target.value,
//                               })
//                             }
//                             className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter new password"
//                             required
//                           />
//                           <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                             Password must be at least 6 characters with
//                             uppercase, lowercase, and numbers
//                           </p>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                             Confirm Password
//                           </label>
//                           <input
//                             type="password"
//                             value={passwordForm.confirm}
//                             onChange={(e) =>
//                               setPasswordForm({
//                                 ...passwordForm,
//                                 confirm: e.target.value,
//                               })
//                             }
//                             className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Confirm new password"
//                             required
//                           />
//                         </div>

//                         <div className="flex space-x-3 pt-4">
//                           <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
//                           >
//                             {loading ? "Updating..." : "Update Password"}
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setShowPasswordForm(false);
//                               setPasswordForm({
//                                 current: "",
//                                 new: "",
//                                 confirm: "",
//                               });
//                             }}
//                             className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     </form>
//                   )}

//                   {/* Two-Factor Authentication */}
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                       Two-Factor Authentication
//                     </h3>
//                     <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             2FA Status
//                           </p>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             {security.twoFactorEnabled
//                               ? "Enabled"
//                               : "Not enabled"}
//                           </p>
//                         </div>
//                         <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
//                           {security.twoFactorEnabled
//                             ? "Disable 2FA"
//                             : "Enable 2FA"}
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Active Sessions */}
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                       Active Sessions
//                     </h3>
//                     <div className="space-y-3">
//                       {security.activeSessions.map((session) => (
//                         <div
//                           key={session.id}
//                           className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <p className="font-medium text-gray-900 dark:text-white">
//                               {session.device}
//                             </p>
//                             {session.current ? (
//                               <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
//                                 Current
//                               </span>
//                             ) : (
//                               <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
//                                 Sign out
//                               </button>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             Last active: {session.lastActive}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Danger Zone */}
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                     <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
//                       Danger Zone
//                     </h3>
//                     <button
//                       onClick={handleDeleteAccount}
//                       disabled={loading}
//                       className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium border border-red-200 dark:border-red-800 disabled:opacity-50"
//                     >
//                       Delete Account
//                     </button>
//                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
//                       This action cannot be undone. Please be certain.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Briefcase,
  Bell,
  Moon,
  LogOut,
  Save,
  Camera,
  Lock,
  Globe,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  role: "candidate" | "hr";
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  interviewReminders: boolean;
  weeklyReports: boolean;
  communityUpdates: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeSessions: Array<{
    id: string;
    device: string;
    lastActive: string;
    current: boolean;
  }>;
}

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "security"
  >("profile");
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "candidate",
    avatar: "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    interviewReminders: true,
    weeklyReports: true,
    communityUpdates: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    activeSessions: [
      {
        id: "1",
        device: "Chrome on macOS",
        lastActive: "Today at 2:30 PM",
        current: true,
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      setProfile({
        _id: user._id || user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "candidate",
        avatar: user.avatar || "",
        phone: user.phone || "",
        bio: user.bio || "",
        createdAt: user.createdAt || new Date().toISOString(),
      });
      setEditedProfile({
        _id: user._id || user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "candidate",
        avatar: user.avatar || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "intervau_ai"
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update profile with new image
      const updateResponse = await api.updateProfile({
        ...editedProfile,
        avatar: imageUrl,
      });

      if (updateResponse.success) {
        setProfile((prev) => ({ ...prev, avatar: imageUrl }));
        setEditedProfile((prev) => ({ ...prev, avatar: imageUrl }));
        setMessage({
          type: "success",
          text: "Profile picture updated successfully!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(updateResponse.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to upload image. Please try again.",
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const updateResponse = await api.updateProfile(editedProfile);

      if (updateResponse.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: updateResponse.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordForm.new.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
        confirmPassword: passwordForm.confirm,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ current: "", new: "", confirm: "" });
        setShowPasswordForm(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.error || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({
        type: "error",
        text: "Failed to change password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;

    setLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage({ type: "error", text: "Failed to sign out" });
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    const password = window.prompt(
      "Enter your password to confirm account deletion:"
    );
    if (!password) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.deleteAccount(password);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Account deleted. Redirecting...",
        });
        setTimeout(() => {
          logout();
          navigate("/");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: response.error || "Failed to delete account",
        });
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setMessage({
        type: "error",
        text: "Failed to delete account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  // Handle notification change
  const handleNotificationChange = (field: keyof NotificationSettings) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings & Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-fit">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Settings Menu
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "profile"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "preferences"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Preferences</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "security"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center space-x-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Profile Information
                </h2>

                <div className="space-y-8">
                  {/* Profile Picture */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Profile Picture
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Upload a profile photo for your account
                      </p>
                    </div>
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                        {editedProfile.avatar ? (
                          <img
                            src={editedProfile.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getAvatarInitials(editedProfile.name)
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 cursor-pointer"
                      >
                        <div className="bg-white dark:bg-gray-700 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                          {imageLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </div>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageLoading}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      {/* Edit Mode */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editedProfile.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={editedProfile.bio || ""}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Tell us about yourself"
                        />
                      </div>

                      <div className="flex items-center space-x-3 pt-6">
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditedProfile(profile);
                            setIsEditing(false);
                          }}
                          disabled={loading}
                          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* View Mode */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Full Name
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {profile.name || "Not provided"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Email Address
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {profile.email}
                          </span>
                        </div>
                      </div>

                      {profile.phone && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Phone Number
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {profile.phone}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Role
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white capitalize">
                            {profile.role}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Member Since
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(profile.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Preferences
                </h2>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Theme
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          theme === "dark"
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            theme === "dark" ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive updates via email
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleNotificationChange("emailNotifications")
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.emailNotifications
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.emailNotifications
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Interview Reminders
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get notified before interviews
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleNotificationChange("interviewReminders")
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.interviewReminders
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.interviewReminders
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Weekly Reports
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Summary of your activity each week
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleNotificationChange("weeklyReports")
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.weeklyReports
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.weeklyReports
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Community Updates
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            News and updates from our community
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleNotificationChange("communityUpdates")
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.communityUpdates
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.communityUpdates
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  import { useNavigate } from "react-router-dom";
import {
  Video,
  FileText,
  TrendingUp,
  Clock,
  Award,
  Target,
  Play,
  Upload,
} from "lucide-react";
import { ROUTES } from "../router";

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Total Interviews",
      value: "12",
      change: "+3 this week",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Average Score",
      value: "78%",
      change: "+5% from last",
      icon: Award,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Hours Practiced",
      value: "8.5h",
      change: "2.5h this week",
      icon: Clock,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: "Improvement Rate",
      value: "+12%",
      change: "Last 30 days",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const recentInterviews = [
    {
      id: 1,
      position: "Senior Frontend Developer",
      date: "2 days ago",
      score: 85,
      status: "completed",
    },
    {
      id: 2,
      position: "Full Stack Engineer",
      date: "5 days ago",
      score: 78,
      status: "completed",
    },
    {
      id: 3,
      position: "Product Manager",
      date: "1 week ago",
      score: 72,
      status: "completed",
    },
  ];

  const skills = [
    { name: "React", level: 85 },
    { name: "Communication", level: 78 },
    { name: "Problem Solving", level: 82 },
    { name: "Leadership", level: 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your interview performance overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-sm`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Start Mock Interview</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  Practice with AI interviewer
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.RESUME)}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Upload Resume
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Extract skills & insights
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.REPORTS)}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  View Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Detailed performance analytics
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Interviews
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 p-3 rounded-lg shadow-sm">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {interview.position}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {interview.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      <span>{interview.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Top Skills
              </h2>
              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-5">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {skill.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(ROUTES.RESUME)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Update Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Security Alert */}
                  <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-6 h-6 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-1">
                          Password Security
                        </h3>
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          Keep your account secure by using a strong, unique
                          password
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        Change Password
                      </span>
                      <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400">
                        →
                      </span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleChangePassword}
                      className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.current}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                current: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                new: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                            required
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Password must be at least 6 characters with
                            uppercase, lowercase, and numbers
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirm: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
                          >
                            {loading ? "Updating..." : "Update Password"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({
                                current: "",
                                new: "",
                                confirm: "",
                              });
                            }}
                            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            2FA Status
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {security.twoFactorEnabled
                              ? "Enabled"
                              : "Not enabled"}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium">
                          {security.twoFactorEnabled
                            ? "Disable 2FA"
                            : "Enable 2FA"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      {security.activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.device}
                            </p>
                            {session.current ? (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                Current
                              </span>
                            ) : (
                              <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                                Sign out
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last active: {session.lastActive}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium border border-red-200 dark:border-red-800 disabled:opacity-50"
                    >
                      Delete Account
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      This action cannot be undone. Please be certain.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
