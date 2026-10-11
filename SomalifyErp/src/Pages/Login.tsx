
import { LoginFn, reset } from '@/Redux/Slice/LoginSlice'
import { setUser } from '@/Redux/Slice/userinfo'
import { AppDispatch, RootState } from '@/Redux/Store'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import { RiLockPasswordLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {   setCookie } from '@/lib/cookies'
import { motion } from 'framer-motion'
import axios from 'axios'

// Re-export for logout (clear auth cookies)
export { clearAuthCookies } from '@/lib/cookies'

interface UserLoginData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'user'|'superAdmin';
    company_id: string;
  };
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  accessTokenExpiry?: string;
}

function Login() {
  const toastId: string = 'login'
  const [email, setemail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const LogingState = useSelector((state: RootState) => state.LoginStore)

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { email, password };
    dispatch(LoginFn(data));
  };

  // IMPORTANT: Do not auto-redirect based on stale cookies/localStorage.
  // We only redirect after a successful login response.

  useEffect(() => {
    if (LogingState.Isloading) {
      toast.loading('Sign In...', { id: toastId });
    }
    if (LogingState.isSuccess) {
      const loginData = LogingState.data as UserLoginData;
      const userInfo = {
        user: loginData.user,
        accessToken: loginData.accessToken || '',
        refreshToken: loginData.refreshToken,
        refreshTokenExpiry: loginData.refreshTokenExpiry || '',
        accessTokenExpiry: loginData.accessTokenExpiry || '',
        loginTimestamp: new Date().getTime(),
      };
      dispatch(setUser(userInfo));
      setCookie('userInfo', JSON.stringify(userInfo), 1); // Store for 1 day (refresh token expiry)
      
      // Set axios default Authorization header
      if (userInfo.accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.accessToken}`;
      }
      
      toast.success('Success', { id: toastId });
      // Full page reload ensures cookies, localStorage, and axios state are fresh
      // so links work immediately without needing a manual refresh.
      window.location.href = '/Dashboard/Home';
    }
    if (LogingState.isError) {
      toast.error(LogingState.errorMsg, { id: toastId });
    }
    dispatch(reset());
  }, [LogingState.isError, LogingState.isSuccess]);

  return (
    <div className='relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden' style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse' style={{ animationDelay: '1s' }}></div>
        <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-[#605bff]/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2'></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='relative z-10 w-full max-w-5xl mx-auto px-6 py-12'
      >
        <div className='grid lg:grid-cols-2 gap-8 items-center'>
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className='hidden lg:block space-y-8'
          >
            <div className='space-y-6'>
              <div className='flex justify-start'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-[#605bff] to-[#3a3799] rounded-2xl blur-xl opacity-30'></div>
                  <div className='relative bg-white p-4 rounded-xl shadow-lg border border-gray-100'>
                    <img src="/uplogo.png" alt="ERP Logo" className='w-20 h-20 object-contain' />
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h1 className='text-5xl font-bold text-gray-900 leading-tight'>
                  Company
                  <span className='block text-transparent bg-clip-text bg-gradient-to-r from-[#605bff] to-[#3a3799]'>
                    Dashboard
                  </span>
                </h1>
                <p className='text-lg text-gray-600 leading-relaxed'>
                  Welcome back! Sign in to access your company dashboard and manage your business operations.
                </p>
              </div>

              {/* Feature Cards */}
              <div className='grid grid-cols-2 gap-4 mt-8'>
                <div className='bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm'>
                  <div className='w-10 h-10 bg-[#605bff]/10 rounded-full flex items-center justify-center mb-3'>
                    <svg className='w-5 h-5 text-[#605bff]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-[#605bff] text-sm'>Reports</h3>
                  <p className='text-xs text-gray-500 mt-1'>Sales & analytics</p>
                </div>

                <div className='bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm'>
                  <div className='w-10 h-10 bg-[#3a3799]/10 rounded-full flex items-center justify-center mb-3'>
                    <svg className='w-5 h-5 text-[#3a3799]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-[#3a3799] text-sm'>Team</h3>
                  <p className='text-xs text-gray-500 mt-1'>Manage users</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className='w-full'
          >
            <form
              onSubmit={submitHandler}
              className='bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-4'
            >
              {/* Mobile Logo */}
              <div className='lg:hidden flex justify-center mb-4'>
                <img src="/uplogo.png" alt="ERP Logo" className='w-24 h-auto object-contain' />
              </div>

              {/* Header */}
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                  Welcome back
                </h2>
                <p className='text-sm text-gray-500'>
                  Sign in with your email and password
                </p>
              </div>

              {/* Form Fields */}
              <div className='space-y-3'>
                <div>
                  <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-1.5'>
                    Email Address
                  </label>
                  <div className='relative'>
                    <FiUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base' />
                    <input
                      id='email'
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      type='email'
                      placeholder='Enter your email'
                      className='w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#605bff]/30 focus:border-[#605bff] transition-all'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-1.5'>
                    Password
                  </label>
                  <div className='relative'>
                    <RiLockPasswordLine className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base' />
                    <input
                      id='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      className='w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#605bff]/30 focus:border-[#605bff] transition-all'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      {showPassword ? <FiEyeOff className='text-lg' /> : <FiEye className='text-lg' />}
                    </button>
                  </div>
                </div>

                {/* Remember Me and Forgot Password */}
                <div className='flex items-center justify-between text-sm pt-1'>
                  <label className='flex items-center gap-2 cursor-pointer group'>
                    <input
                      type='checkbox'
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className='w-4 h-4 text-[#605bff] border-gray-300 rounded focus:ring-[#605bff] cursor-pointer'
                    />
                    <span className='text-gray-600 group-hover:text-gray-900 transition-colors'>Remember me</span>
                  </label>
                  <a href='#' className='text-[#605bff] hover:text-[#3a3799] font-semibold transition-colors'>
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <motion.button
                  type='submit'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={LogingState.Isloading}
                  className='w-full bg-gradient-to-r from-[#605bff] to-[#3a3799] hover:opacity-90 text-white font-bold py-2.5 px-5 rounded shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4'
                >
                  {LogingState.Isloading ? (
                    <>
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Footer Link */}
              <div className='text-center pt-4 border-t border-gray-200'>
                <p className='text-sm text-gray-600'>
                  Admin user?{' '}
                  <Link
                    to='/AdminSignIn'
                    className='text-[#605bff] hover:text-[#3a3799] font-semibold transition-colors'
                  >
                    Switch to Admin Login
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
