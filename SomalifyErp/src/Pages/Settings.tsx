import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { 
  FiSettings, 
  FiUser, 
  FiShield, 
  FiActivity, 
  FiDatabase,
  FiBell,
  FiLock,
  FiMail,
  FiGlobe,
  FiEdit2,
  FiSave,
  FiX
} from 'react-icons/fi';
import { 
  HiOutlineBuildingOffice, 
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCog
} from 'react-icons/hi2';
import { BsShieldCheck, BsGraphUp } from 'react-icons/bs';
import { RiAdminLine } from 'react-icons/ri';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes('AdminDashboard');
  const adminWhoamiState = useSelector((state: RootState) => state.adminWhoami);
  const companyState = useSelector((state: RootState) => state.AllCompanies);
  const userInfo = useSelector((state: RootState) => state.userInfo);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: '',
    phone: '',
    address: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'ReadyKayd',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginNotifications: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    salesAlerts: true,
    lowStockAlerts: true,
    newUserAlerts: true,
    systemUpdates: true
  });

  useEffect(() => {
    if (isAdminDashboard) {
      dispatch(getAllCompaniesFn());
    }
  }, [dispatch, isAdminDashboard]);

  useEffect(() => {
    if (isAdminDashboard && adminWhoamiState.userData) {
      const roles = adminWhoamiState.userData.roles || [];
      setProfileData({
        full_name: adminWhoamiState.userData.full_name || '',
        email: adminWhoamiState.userData.email || '',
        role: roles[0] || '',
        phone: '',
        address: ''
      });
    } else if (!isAdminDashboard && userInfo) {
      const u = userInfo.user ?? userInfo;
      const roles = u.roles || [];
      setProfileData({
        full_name: u.full_name || '',
        email: u.email || '',
        role: roles[0] || '',
        phone: '',
        address: ''
      });
    }
  }, [adminWhoamiState.userData, userInfo, isAdminDashboard]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSystemSettings({
      ...systemSettings,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSecuritySettings({
      ...securitySettings,
      [e.target.name]: value
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const totalCompanies = companyState.total || 0;
  const activeCompanies = companyState.data?.filter((company) => !company.isBanned).length || 0;
  const bannedCompanies = companyState.data?.filter((company) => company.isBanned).length || 0;

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: FiUser },
    { id: 'system' as const, label: 'System', icon: HiOutlineCog },
    { id: 'security' as const, label: 'Security', icon: FiShield },
    { id: 'notifications' as const, label: 'Notifications', icon: FiBell }
  ];

  return (
    <div className='w-full min-h-screen bg-[#EEF0F4] dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              className="relative p-2.5 rounded-lg bg-gradient-to-r from-[#605bff] to-[#3a3799] shadow-xl"
            >
              <FiSettings className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0f1e5e] via-[#605bff] to-[#3a3799] bg-clip-text text-transparent dark:from-[#605bff] dark:via-[#4f46e5] dark:to-[#3a3799] flex items-center gap-2'>
                {isAdminDashboard ? 'Admin Dashboard & Settings' : 'Dashboard Settings'}
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  ⚙️
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                {isAdminDashboard ? 'Manage your admin profile and system configuration' : 'Manage your profile and preferences'}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Cards - Admin only */}
        {isAdminDashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#605bff]/20 to-[#3a3799]/20 dark:from-[#605bff]/30 dark:to-[#3a3799]/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <HiOutlineBuildingOffice className="text-sm" />
                  Total Companies
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    totalCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#605bff] to-[#3a3799] shadow-lg">
                <HiOutlineBuildingOffice className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Link to="/AdminDashboard/Companies" className="text-xs text-[#605bff] dark:text-[#818cf8] hover:underline flex items-center gap-1">
                View all companies →
              </Link>
            </div>
          </motion.div>

          {/* My roles & permissions (from user_roles → role → permissions) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden col-span-full"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiShield className="text-[#605bff] text-xl" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">My roles & permissions</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Loaded from your user_roles. Each action is allowed only if you have the matching permission (or a full-access role).
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Roles:</span>
              {(adminWhoamiState.userData?.roles || []).map((r) => (
                <span key={r} className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-xs font-medium">
                  {r}
                </span>
              ))}
              {(!adminWhoamiState.userData?.roles?.length) && (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Permissions:</span>
              {(adminWhoamiState.userData?.permissions || []).map((p) => (
                <span key={p} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  {p}
                </span>
              ))}
              {(!adminWhoamiState.userData?.permissions?.length) && (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <BsShieldCheck className="text-sm" />
                  Active Companies
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    activeCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <BsShieldCheck className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {((activeCompanies / totalCompanies) * 100 || 0).toFixed(1)}% of total
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <FiShield className="text-sm" />
                  Banned Companies
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    bannedCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 shadow-lg">
                <FiShield className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Requires attention
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <FiActivity className="text-sm" />
                  System Status
                </p>
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                  Operational
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <FiActivity className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                All systems online
              </span>
            </div>
          </motion.div>
        </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link to="/AdminDashboard/Companies">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-[#605bff] to-[#3a3799] rounded-lg p-5 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <HiOutlineBuildingOffice className="text-3xl mb-3" />
              <h3 className="text-lg font-bold mb-1">Manage Companies</h3>
              <p className="text-sm text-white/80">View and edit companies</p>
            </motion.div>
          </Link>

          <Link to="/AdminDashboard/User">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-5 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <HiOutlineUsers className="text-3xl mb-3" />
              <h3 className="text-lg font-bold mb-1">User Management</h3>
              <p className="text-sm text-white/80">Manage all users</p>
            </motion.div>
          </Link>

          <Link to="/AdminDashboard/Reports">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-5 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <HiOutlineChartBar className="text-3xl mb-3" />
              <h3 className="text-lg font-bold mb-1">View Reports</h3>
              <p className="text-sm text-white/80">Analytics & insights</p>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gradient-to-r from-[#4f46e5] to-[#3a3799] rounded-lg p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <RiAdminLine className="text-3xl mb-3" />
            <h3 className="text-lg font-bold mb-1">Admin Tools</h3>
            <p className="text-sm text-white/80">Advanced settings</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#605bff] to-[#3a3799] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUser className="text-[#605bff] dark:text-[#818cf8]" />
                    Admin Profile
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your personal information
                  </p>
                </div>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#605bff] to-[#3a3799] text-white rounded-lg font-medium shadow-lg hover:opacity-90"
                  >
                    <FiEdit2 />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-lg hover:bg-green-700"
                    >
                      <FiSave />
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium shadow-lg hover:bg-gray-700"
                    >
                      <FiX />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={profileData.role}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiOutlineCog className="text-[#605bff] dark:text-[#818cf8]" />
                  System Configuration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure system-wide settings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiGlobe />
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    value={systemSettings.siteName}
                    onChange={handleSystemChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiGlobe />
                    Language
                  </label>
                  <select
                    name="language"
                    value={systemSettings.language}
                    onChange={handleSystemChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiGlobe />
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={systemSettings.timezone}
                    onChange={handleSystemChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="CST">Central Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiDatabase />
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={systemSettings.currency}
                    onChange={handleSystemChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiDatabase />
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    value={systemSettings.dateFormat}
                    onChange={handleSystemChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#605bff] to-[#3a3799] text-white rounded-lg font-medium shadow-lg hover:opacity-90"
                >
                  <FiSave />
                  Save System Settings
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiShield className="text-[#605bff] dark:text-[#818cf8]" />
                  Security Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage security and authentication settings
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FiLock />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onChange={handleSecurityChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiLock />
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      name="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiLock />
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      name="passwordExpiry"
                      value={securitySettings.passwordExpiry}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#605bff] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FiBell />
                      Login Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Receive alerts for new login attempts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="loginNotifications"
                      checked={securitySettings.loginNotifications}
                      onChange={handleSecurityChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#605bff] to-[#3a3799] text-white rounded-lg font-medium shadow-lg hover:opacity-90"
                >
                  <FiSave />
                  Save Security Settings
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiBell className="text-[#605bff] dark:text-[#818cf8]" />
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose what notifications you want to receive
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FiMail />
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Receive general email notifications
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <BsGraphUp />
                      Sales Alerts
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Get notified about new sales
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="salesAlerts"
                      checked={notificationSettings.salesAlerts}
                      onChange={handleNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FiDatabase />
                      Low Stock Alerts
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Alert when inventory is running low
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="lowStockAlerts"
                      checked={notificationSettings.lowStockAlerts}
                      onChange={handleNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <HiOutlineUsers />
                      New User Alerts
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Notify when new users register
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="newUserAlerts"
                      checked={notificationSettings.newUserAlerts}
                      onChange={handleNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FiActivity />
                      System Updates
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Get notified about system updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#605bff]/40 dark:peer-focus:ring-[#605bff]/60 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#605bff]"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#605bff] to-[#3a3799] text-white rounded-lg font-medium shadow-lg hover:opacity-90"
                >
                  <FiSave />
                  Save Notification Settings
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
}

export default Settings;
