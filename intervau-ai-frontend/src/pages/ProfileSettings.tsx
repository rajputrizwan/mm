import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Bell, Moon, LogOut, Save, Camera, Lock, Globe, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  role: 'candidate' | 'hr';
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: 'candidate',
    avatar: '',
    phone: '',
    bio: '',
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
        id: '1',
        device: 'Chrome on macOS',
        lastActive: 'Today at 2:30 PM',
        current: true,
      },
    ],
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      setProfile({
        _id: user._id || user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'candidate',
        avatar: user.avatar || '',
        phone: user.phone || '',
        bio: user.bio || '',
        createdAt: user.createdAt || new Date().toISOString(),
      });
      setEditedProfile({
        _id: user._id || user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'candidate',
        avatar: user.avatar || '',
        phone: user.phone || '',
        bio: user.bio || '',
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
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'intervau_ai');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');

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
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(updateResponse.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: updateResponse.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
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
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
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
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ current: '', new: '', confirm: '' });
        setShowPasswordForm(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;

    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setMessage({ type: 'error', text: 'Failed to sign out' });
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    const password = window.prompt('Enter your password to confirm account deletion:');
    if (!password) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.deleteAccount(password);

      if (response.success) {
        setMessage({ type: 'success', text: 'Account deleted. Redirecting...' });
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
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
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings & Profile</h1>
          <p className="text-lg text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Settings Menu</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'preferences'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Preferences</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'security'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
            </div>
            <div className="border-t border-gray-200 mt-6 pt-6">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center space-x-3 text-red-600 hover:text-red-700 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h2>

                <div className="space-y-8">
                  {/* Profile Picture */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Picture</h3>
                      <p className="text-gray-600">Upload a profile photo for your account</p>
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
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                        <div className="bg-white border-2 border-blue-600 text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={editedProfile.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Tell us about yourself"
                        />
                      </div>

                      <div className="flex items-center space-x-3 pt-6">
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditedProfile(profile);
                            setIsEditing(false);
                          }}
                          disabled={loading}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* View Mode */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Full Name</span>
                          </div>
                          <span className="font-semibold text-gray-900">{profile.name || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Email Address</span>
                          </div>
                          <span className="font-semibold text-gray-900">{profile.email}</span>
                        </div>
                      </div>

                      {profile.phone && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Phone Number</span>
                            <span className="font-semibold text-gray-900">{profile.phone}</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Role</span>
                          </div>
                          <span className="font-semibold text-gray-900 capitalize">{profile.role}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Member Since</span>
                          <span className="font-semibold text-gray-900">{formatDate(profile.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Preferences</h2>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Theme</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Moon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Dark Mode</span>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('emailNotifications')}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.emailNotifications ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Interview Reminders</p>
                          <p className="text-sm text-gray-600">Get notified before interviews</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('interviewReminders')}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.interviewReminders ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.interviewReminders ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Weekly Reports</p>
                          <p className="text-sm text-gray-600">Summary of your activity each week</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('weeklyReports')}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.weeklyReports ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.weeklyReports ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Community Updates</p>
                          <p className="text-sm text-gray-600">News and updates from our community</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('communityUpdates')}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications.communityUpdates ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications.communityUpdates ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Language & Region */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Region</h3>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <select className="flex-1 bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer">
                        <option>English (US)</option>
                        <option>Spanish (ES)</option>
                        <option>French (FR)</option>
                        <option>German (DE)</option>
                        <option>Portuguese (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h2>

                <div className="space-y-6">
                  {/* Security Alert */}
                  <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-orange-900 mb-1">Password Security</h3>
                        <p className="text-sm text-orange-800">
                          Keep your account secure by using a strong, unique password
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="font-medium text-gray-900">Change Password</span>
                      <span className="text-gray-400 group-hover:text-gray-600">→</span>
                    </button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                            required
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Password must be at least 6 characters with uppercase, lowercase, and numbers
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ current: '', new: '', confirm: '' });
                            }}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">2FA Status</p>
                          <p className="text-sm text-gray-600">
                            {security.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {security.activeSessions.map((session) => (
                        <div key={session.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">{session.device}</p>
                            {session.current ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Current
                              </span>
                            ) : (
                              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                Sign out
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Last active: {session.lastActive}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200 disabled:opacity-50"
                    >
                      Delete Account
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
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
