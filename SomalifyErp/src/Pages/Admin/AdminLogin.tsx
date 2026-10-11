
import { AdminLoginFn, reset } from '@/Redux/Slice/LoginSlice'
import { setUser } from '@/Redux/Slice/userinfo'
import { fetchAdminUser } from '@/Redux/Slice/adminWhoami'
import { AppDispatch, RootState } from '@/Redux/Store'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import { RiLockPasswordLine } from 'react-icons/ri'
import { HiOutlineShieldCheck } from 'react-icons/hi2'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function AdminLogin() {
  
   const toastId: string='admin-login'

  const [email,setemail]=useState('')
  const [password,setPassword]=useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  

  const LogingState= useSelector((state:RootState)=> state.LoginStore)
  const adminWhoamiState = useSelector((state:RootState)=> state.adminWhoami)
  const navigate = useNavigate();
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      email,
      password,
    }; 
    dispatch(AdminLoginFn(data));
  };

  useEffect(()=>{
    if(localStorage.getItem('userInfo')){
        const userInfo = JSON.parse(localStorage.getItem('userInfo')!);
        const roles = userInfo.user?.roles || userInfo.roles || [];
        const isAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
        if(isAdmin){
          navigate('/AdminDashboard/Home');
        } else {
          navigate('/');
        }
    }
  },[])

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      const loginTime = parsedUserInfo.loginTimestamp;
      const currentTime = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (currentTime - loginTime <= twentyFourHours) {
        const roles = parsedUserInfo.user?.roles || parsedUserInfo.roles || [];
        const isAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
        if(isAdmin){
          navigate('/AdminDashboard/Home');
        }
      } else {
        localStorage.removeItem('userInfo');
      }
    }
  }, [navigate]);

  // Handle login state
  useEffect(() => {
    if (LogingState.Isloading) {
      toast.loading('sign In...', { id: toastId });
      return; // Don't process anything else while loading
    }
    
    if (LogingState.isSuccess) {
      const loginData = LogingState.data as any;
      
      // SECURITY CHECK: Verify user is admin or superAdmin - check roles array only
      const roles = loginData.user?.roles || [];
      const isAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
      
      if (!isAdmin) {
        toast.error('Access denied. Admin access required.', { id: toastId });
        dispatch(reset());
        // Clear any tokens
        localStorage.removeItem('userInfo');
        return;
      }
      
      // Store tokens securely in localStorage
      const userInfo = {
        user: loginData.user,
        mainAccessToken: loginData.accessToken, // Store access token (15 min expiry)
        refreshToken: loginData.refreshToken, // Store refresh token (1 day expiry)
        refreshTokenExpiry: loginData.refreshTokenExpiry,
        accessTokenExpiry: loginData.accessTokenExpiry,
        loginTimestamp: new Date().getTime(),
      };
  
      dispatch(setUser(userInfo));
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Small delay to ensure cookies are set before making whoami request
      setTimeout(() => {
        // Fetch admin user data using whoami
        dispatch(fetchAdminUser());
      }, 100);
      
      dispatch(reset()); // Reset login state
      return; // Exit early after success
    }
    
    if (LogingState.isError) {
      toast.error(LogingState.errorMsg, { id: toastId });
      dispatch(reset()); // Reset after showing error
      return; // Exit early after error
    }
  }, [LogingState.Isloading, LogingState.isError, LogingState.isSuccess, dispatch]);

  // Handle whoami state after login
  useEffect(() => {
    if (adminWhoamiState.isLoading) {
      return; // Don't show toast if already loading
    }
    
    if (adminWhoamiState.isSuccess && adminWhoamiState.userData) {
      toast.success('Admin Login Success', { id: toastId });
      navigate('/AdminDashboard/Home');
      return;
    }
    
    if (adminWhoamiState.isError) {
      toast.error(adminWhoamiState.errorMsg || 'Failed to verify admin credentials', { id: toastId });
      localStorage.removeItem('userInfo');
      return;
    }
  }, [adminWhoamiState.isLoading, adminWhoamiState.isError, adminWhoamiState.isSuccess, adminWhoamiState.userData, navigate, toastId]);


  return (
    <div className='relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden'>
      <div
        className='absolute inset-0 opacity-30'
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148 163 184 / 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-0 right-0 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='relative z-10 w-full max-w-md mx-auto px-4'
      >
        <form
          onSubmit={submitHandler}
          className='bg-slate-800/95 backdrop-blur border border-slate-600/50 rounded-2xl shadow-2xl p-8 space-y-5'
        >
          <div className='flex justify-center'>
            <span className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-semibold'>
              <HiOutlineShieldCheck className='w-5 h-5' />
              Admin access only
            </span>
          </div>

          <div className='text-center'>
            <h1 className='text-2xl font-bold text-white'>
              Admin sign in
            </h1>
            <p className='text-slate-400 text-sm mt-1'>
              Use your admin email and password
            </p>
          </div>
              {/* Header */}
              <div className='text-center mb-4'>
                <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                  Welcome Back
                </h2>
                <p className='text-sm text-gray-500'>
                  Sign in with your admin email and password
                </p>
              </div>

          <div className='space-y-4'>
            <div>
              <label htmlFor='admin-email' className='block text-sm font-medium text-slate-300 mb-1.5'>
                Email
              </label>
              <div className='relative'>
                <FiUser className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' />
                <input
                  id='admin-email'
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  type='email'
                  placeholder='admin@example.com'
                  className='w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all'
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor='admin-password' className='block text-sm font-medium text-slate-300 mb-1.5'>
                Password
              </label>
              <div className='relative'>
                <RiLockPasswordLine className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' />
                <input
                  id='admin-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  className='w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors'
                >
                  {showPassword ? <FiEyeOff className='text-lg' /> : <FiEye className='text-lg' />}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50'
                />
                <span className='text-slate-400'>Remember me</span>
              </label>
              <a href='#' className='text-amber-400 hover:text-amber-300 font-medium transition-colors'>
                Forgot password?
              </a>
            </div>

            <motion.button
              type='submit'
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={LogingState.Isloading}
              className='w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2.5 px-5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-2'
            >
              {LogingState.Isloading ? (
                <>
                  <div className='w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin' />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Admin</span>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                  </svg>
                </>
              )}
            </motion.button>
          </div>

          <div className='text-center pt-4 border-t border-slate-600/50'>
            <p className='text-sm text-slate-400'>
              Company user?{' '}
              <Link
                to='/SignIn'
                className='text-amber-400 hover:text-amber-300 font-semibold transition-colors'
              >
                Go to Company sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AdminLogin
