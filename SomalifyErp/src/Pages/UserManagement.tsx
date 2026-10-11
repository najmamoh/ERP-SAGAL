import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { Tabs, Tab, Box } from '@mui/material';
import MainUsersData from '@/components/ui/MainUsersData';
import AdminUsersData from '@/components/ui/AdminUsersData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`,
  };
}

function UserManagement() {
  const [value, setValue] = useState(0);
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // For Dashboard (not AdminDashboard), show only Organizations
  if (!isAdminDashboard) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-500/20 px-6 py-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/60 shadow-lg">
                <HiOutlineUserGroup className="text-2xl text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Organizations</h1>
                <p className="text-sm text-slate-600 mt-0.5">Manage organizations and assign permissions.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`${basePath}/User/Create`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-white hover:bg-slate-50 border border-blue-200/80 shadow-sm transition-all"
                >
                  Create User
                </Link>
              </div>
            </div>
          </div>

          {/* Organizations Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Organizations</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage organization users and assign permissions based on their roles.
                  </p>
                </div>
                <AdminUsersData />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For AdminDashboard, show original tabs with Main Users and Company Users
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-500/20 px-6 py-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/60 shadow-lg">
              <HiOutlineUserGroup className="text-2xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-sm text-slate-600 mt-0.5">Manage main users and company users with role-based access control.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to="/AdminDashboard/MainUser/Create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-white hover:bg-slate-50 border border-purple-200/80 shadow-sm transition-all"
              >
                Create Main User
              </Link>
              <Link
                to="/AdminDashboard/User/Create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-white hover:bg-slate-50 border border-blue-200/80 shadow-sm transition-all"
              >
                Create Company User
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <HiOutlineShieldCheck className="text-lg text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Main Users</p>
                <p className="text-xs text-slate-500">System administrators</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiOutlineUserGroup className="text-lg text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Company Users</p>
                <p className="text-xs text-slate-500">Regular company staff</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <HiOutlineBuildingOffice2 className="text-lg text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Companies</p>
                <p className="text-xs text-slate-500">Organizations</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6">
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="User management tabs">
                  <Tab 
                    icon={<HiOutlineShieldCheck className="w-4 h-4" />} 
                    label="Main Users" 
                    {...a11yProps(0)}
                    sx={{ 
                      '&.Mui-selected': { 
                        color: 'purple.main',
                        backgroundColor: 'rgba(147, 51, 234, 0.1)'
                      } 
                    }}
                  />
                  <Tab 
                    icon={<HiOutlineUserGroup className="w-4 h-4" />} 
                    label="Company Users" 
                    {...a11yProps(1)}
                    sx={{ 
                      '&.Mui-selected': { 
                        color: 'blue.main',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)'
                      } 
                    }}
                  />
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Main Users</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      System administrators with full access control. These users can manage the entire system.
                    </p>
                  </div>
                  <MainUsersData />
                </div>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Company Users</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Regular users belonging to specific companies with limited access based on their roles.
                    </p>
                  </div>
                  <AdminUsersData />
                </div>
              </TabPanel>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
