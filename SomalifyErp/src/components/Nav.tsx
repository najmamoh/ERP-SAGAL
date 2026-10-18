import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AppDispatch, RootState } from '@/Redux/Store';
import { BiSolidDoorOpen } from 'react-icons/bi';
import { performLogout } from '@/lib/authLogout';
import { logout } from '@/Redux/Slice/userinfo';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser } from 'react-icons/fi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { Url } from '@/Interfaces';

type SearchHit = {
  table: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

function Nav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state: RootState) => state.userInfo);

  // Resolve the current user's ID and build the profile path
  const myUserId = userInfo?.user?.user_id ?? userInfo?.user?.id ?? userInfo?.id ?? userInfo?.user_id;
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const profilePath = myUserId
    ? `${isAdminDashboard ? '/AdminDashboard' : '/Dashboard'}/User/Update/${myUserId}`
    : null;
  const logoutHandler = async () => {
    await performLogout();
    dispatch(logout());
    // Single logout landing route for all sessions
    window.location.replace('/');
  };

  const getUserInitial = () => {
    if (!userInfo?.user?.full_name && !userInfo?.full_name) return 'A';
    const name = userInfo?.user?.full_name || userInfo?.full_name || '';
    return name.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (!userInfo?.user?.full_name && !userInfo?.full_name) return 'Admin';
    const name = userInfo?.user?.full_name || userInfo?.full_name || '';
    return capitalizeFirstLetter(name);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 1) {
      setSearchHits([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${Url}/search`, {
          params: { q },
          withCredentials: true,
        });
        setSearchHits(Array.isArray(res.data?.results) ? res.data.results : []);
        setSearchOpen(true);
      } catch {
        setSearchHits([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className="w-full min-w-0 max-w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 w-full min-w-0 max-w-full">
        {/* Search Bar */}
        <div className="flex-1 hidden lg:block mr-4 max-w-md">
          <div className="relative left-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => searchHits.length > 0 && setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {searchOpen && searchQuery.trim().length > 0 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50">
                  {searchLoading ? (
                    <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
                  ) : searchHits.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-gray-500">No results</p>
                  ) : (
                    searchHits.map((hit) => (
                      <button
                        key={`${hit.table}-${hit.id}`}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate(`${isAdminDashboard ? '/AdminDashboard' : '/Dashboard'}/${hit.href}`);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <p className="text-[10px] uppercase tracking-wide text-indigo-500">{hit.table}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{hit.title}</p>
                        {hit.subtitle ? (
                          <p className="text-xs text-gray-500 truncate">{hit.subtitle}</p>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoMdNotificationsOutline className="text-xl" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
          </button>

          {userInfo && (
            <>
              {/* User Profile */}
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 py-1.5 transition-colors"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="font-medium text-white text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {getFullName()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(() => {
                      const roles = userInfo?.user?.roles || userInfo?.roles || [];
                      if (roles.includes('super_admin') || roles.includes('superAdmin')) return 'Super Admin';
                      if (roles.includes('admin')) return 'Admin';
                      return 'User';
                    })()}
                  </span>
                </div>
                <BsThreeDotsVertical className="hidden md:block text-gray-400 text-sm" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-6 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
                >
                  ×
                </button>
              </div>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <IoMdNotificationsOutline className="text-2xl text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No new notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Menu Dropdown */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-6 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50"
            >
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{getFullName()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo?.user?.email || userInfo?.email || ''}</p>
              </div>
              {profilePath && (
                <button
                  onClick={() => { setShowUserMenu(false); navigate(profilePath); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiUser className="text-indigo-500" />
                  <span>My Profile</span>
                </button>
              )}
              <button
                onClick={logoutHandler}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <BiSolidDoorOpen />
                <span>Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Nav;
