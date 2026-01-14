import { useState } from 'react';
import { User, Mail, Briefcase, Bell, Moon, LogOut, Save, Camera, Lock, Globe } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: 'candidate' | 'hr';
  joinDate: string;
  avatar: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  interviewReminders: boolean;
  weeklyReports: boolean;
  communityUpdates: boolean;
}

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Martinez',
    email: 'alex.martinez@example.com',
    role: 'candidate',
    joinDate: 'January 15, 2024',
    avatar: 'AM'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    interviewReminders: true,
    weeklyReports: true,
    communityUpdates: false
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleNotificationChange = (field: keyof NotificationSettings) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings & Profile</h1>
          <p className="text-lg text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
              <button className="w-full flex items-center space-x-3 text-red-600 hover:text-red-700 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h2>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Picture</h3>
                      <p className="text-gray-600">Upload a profile photo for your account</p>
                    </div>
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {profile.avatar}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white border-2 border-blue-600 text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                        <select
                          value={editedProfile.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="candidate">Candidate</option>
                          <option value="hr">HR Professional</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3 pt-6">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditedProfile(profile);
                            setIsEditing(false);
                          }}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Full Name</span>
                          </div>
                          <span className="font-semibold text-gray-900">{profile.name}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Email Address</span>
                          </div>
                          <span className="font-semibold text-gray-900">{profile.email}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Role</span>
                          </div>
                          <span className="font-semibold text-gray-900 capitalize">{profile.role}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">Member Since</span>
                          <span className="font-semibold text-gray-900">{profile.joinDate}</span>
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

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Preferences</h2>

                <div className="space-y-6">
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

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Region</h3>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <select className="flex-1 bg-transparent font-medium text-gray-900 focus:outline-none">
                        <option>English (US)</option>
                        <option>Spanish (ES)</option>
                        <option>French (FR)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h2>

                <div className="space-y-6">
                  <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-orange-900 mb-1">Password Security</h3>
                        <p className="text-sm text-orange-800">Keep your account secure by using a strong, unique password</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group">
                    <span className="font-medium text-gray-900">Change Password</span>
                    <span className="text-gray-400 group-hover:text-gray-600">→</span>
                  </button>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">2FA Status</p>
                          <p className="text-sm text-gray-600">Not enabled</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">Chrome on macOS</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
                        </div>
                        <p className="text-sm text-gray-600">Last active: Today at 2:30 PM</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">Safari on iPhone</p>
                          <button className="text-sm text-red-600 hover:text-red-700 font-medium">Sign out</button>
                        </div>
                        <p className="text-sm text-gray-600">Last active: 3 days ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                    <button className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200">
                      Delete Account
                    </button>
                    <p className="text-xs text-gray-600 mt-2">This action cannot be undone. Please be certain.</p>
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
