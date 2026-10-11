import { Link, useLocation } from 'react-router-dom';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import AdminUsersData from '@/components/ui/AdminUsersData';

function ALLCompanyUSers() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="rounded-2xl bg-blue-50 border border-indigo-500/20 px-6 py-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200/60">
              <HiOutlineUserGroup className="text-2xl text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Company Users</h1>
              <p className="text-sm text-slate-600 mt-0.5">Manage company users and assign permissions.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`${basePath}/User/Create`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200/80 shadow-sm transition-all"
              >
                Create User
              </Link>
              {isAdminDashboard && (
                <Link
                  to="/AdminDashboard/Companies"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200/80 shadow-sm transition-all"
                >
                  Go to Companies
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6">
            <AdminUsersData />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ALLCompanyUSers;
