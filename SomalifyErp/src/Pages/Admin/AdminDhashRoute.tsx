import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AdminDhashSide from './AdminDhashside'
import Nav from '@/components/Nav'
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { fetchAdminUser } from '@/Redux/Slice/adminWhoami';
import { useSelector } from 'react-redux';
// import { getCookie } from '@/lib/cookies';

function AdminDhashRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const adminWhoamiState = useSelector((state: RootState) => state.adminWhoami);
  const theme = localStorage.getItem('theme') || 'light';

  // Fetch admin user data on component mount - this verifies mainAccessToken via backend
  useEffect(() => {
    dispatch(fetchAdminUser());
  }, [dispatch]);

  // Show loading until we have a definitive auth result.
  // This prevents false redirects on the first render before whoami finishes.
  if (adminWhoamiState.isLoading || (!adminWhoamiState.isSuccess && !adminWhoamiState.isError)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // SECURITY CHECK: Only allow access if backend whoami verification succeeds
  // Backend whoami endpoint requires:
  // 1. mainAccessToken cookie (verified by decodeMainToken middleware)
  // 2. User must be a main user (from main_users table)
  // 3. User must have admin/superAdmin/super_admin role (verified by isMainAdmin middleware)
  // 
  // If whoami succeeds, it means all these checks passed on the backend
  let isAuthorized = false;

  // Primary security check: Backend whoami must succeed
  // The backend already verified:
  // - mainAccessToken is valid
  // - User is a main user (not a company user)
  // - User has admin/superAdmin/super_admin role
  if (adminWhoamiState.userData && adminWhoamiState.isSuccess) {
    const roles = adminWhoamiState.userData.roles || [];
    // Double-check roles (backend already verified via isMainAdmin, but extra safety)
    isAuthorized = roles.includes('admin') || 
                   roles.includes('superAdmin') || 
                   roles.includes('super_admin');
  }

  // SECURITY: If whoami failed or user is not authorized, deny access
  // Unified auth-expiry redirect route
  if (adminWhoamiState.isError || !isAuthorized) {
    localStorage.removeItem('userInfo');
    document.cookie = 'mainAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'mainRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    return <Navigate to='/' replace />;
  }

  // User is authenticated and authorized as admin/superAdmin, render admin dashboard
  return (
    <div className='flex w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-slate-50/50 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Sidebar — keep above page content / DataGrid overflow */}
      <div className='hidden lg:block fixed inset-y-0 left-0 z-40 w-64 h-screen'>
        <AdminDhashSide/>
      </div>
      
      {/* Main Content Area */}
      <div className={`lg:ml-64 w-full min-w-0 min-h-screen flex flex-col overflow-x-hidden ${
        theme === 'dark' ? 'DarkTheme' : ''
      }`}>
        {/* Top Navbar — below sidebar so it never covers it */}
        <div className="sticky top-0 z-20 w-full">
          <Nav />
        </div>
        
        {/* Content Outlet */}
        <div className="flex-1 w-full min-w-0 overflow-x-hidden">
          <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default AdminDhashRoute
