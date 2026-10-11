import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import DhashSide from './Dhashside'
import Nav from '@/components/Nav'
import { ProtectedRoute } from '@/components/protectedRoute'
import SideParsm from '@/components/SideParsm'
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { fetchCurrentUser } from '@/Redux/Slice/whoami';
import { useSelector } from 'react-redux';
import { getCookie } from '@/lib/cookies';

function DhashRoute() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const whoamiState = useSelector((state: RootState) => state.whoami);
  const theme = localStorage.getItem('theme') || 'light';

  // If user has main (admin) token, do not allow company dashboard — redirect to admin
  const userInfoRaw = localStorage.getItem('userInfo') || getCookie('userInfo');
  const userInfo = userInfoRaw ? (() => { try { return JSON.parse(userInfoRaw); } catch { return {}; } })() : {};
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const hasMainToken = Boolean(userInfo.mainAccessToken);
  const isAdminRole = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
  if (hasMainToken && isAdminRole) {
    return <Navigate to="/AdminDashboard/Home" replace />;
  }

  // Fetch user data on component mount (runs in background)
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Only block with full-screen loading when we have no stored auth and whoami is still loading.
  // If we have userInfo (e.g. after login or refresh), render layout so child pages can mount and fetch;
  // this fixes "refresh on Sales shows nothing until click back".
  const hasStoredAuth = Boolean(
    (userInfo as any)?.accessToken ?? (userInfo as any)?.user?.accessToken ?? (userInfo as any)?.token
  );
  if (!hasStoredAuth && whoamiState.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to home/login if not authenticated
  // if (whoamiState.isError) {
  //   // Clear any invalid tokens/cookies
  //   document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //   document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
  //   return <Navigate to="/" replace />;
  // }

  // User is authenticated, render dashboard
  return (
    <div className='flex w-[100%] '>
      <div className="hidden lg:block fixed z-20 w-[250px] left-0 top-0 h-screen overflow-y-auto">
        <DhashSide/>
      </div>
      
      <div className={`bg-[#EEF0F4] mainVew lg:ml-[230px] w-full min-h-[100%] min-w-0 pr-0 px-4 sm:px-6 lg:px-8 py-0 overflow-x-hidden ${
        theme === 'dark' ? 'DarkTheme' : ''
      }`}>
        <div className="sticky top-0 z-10 bg-[#EEF0F4] dark:bg-slate-900 py-2 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between min-w-0">
          <h1 className="lg:hidden shrink-0"><SideParsm /></h1>
          <div className="flex justify-end w-full min-w-0"><Nav /></div>
        </div>
        <ProtectedRoute>
          <Outlet key={location.pathname} />
        </ProtectedRoute>
      </div>
    </div>
  )
}

export default DhashRoute