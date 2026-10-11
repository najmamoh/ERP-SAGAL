import { Link, useLocation } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineShieldCheck } from 'react-icons/hi2';
import MainUsersData from '@/components/ui/MainUsersData';

function MainUsers() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-500/20 px-6 py-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200/60">
              <HiOutlineShieldCheck className="text-2xl text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Main Users</h1>
              <p className="text-sm text-slate-600 mt-0.5">Manage system administrators and main users with full access control.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`${basePath}/MainUser/Create`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-white hover:bg-slate-50 border border-purple-200/80 shadow-sm transition-all"
              >
                Create Main User
              </Link>
              <Link
                to={`${basePath}/User`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200/80 shadow-sm transition-all"
              >
                Company Users
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <HiOutlineShieldCheck className="text-lg text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Super Admin</p>
                <p className="text-xs text-slate-500">Full system access</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiOutlineUserGroup className="text-lg text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Admin</p>
                <p className="text-xs text-slate-500">Administrative access</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <HiOutlineUserGroup className="text-lg text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Custom Roles</p>
                <p className="text-xs text-slate-500">Permission-based access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800">All Main Users</h2>
              <p className="text-sm text-slate-600 mt-1">System administrators and main users with elevated permissions</p>
            </div>
            <MainUsersData />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainUsers;
