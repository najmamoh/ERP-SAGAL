import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLinks } from '@/components/ui/AdminLinks';
import { useStateContext } from '@/components/ui/ContextProvider';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { Crown, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';

function hasPermission(permissions: string[] | undefined, perm: string): boolean {
  if (!permissions?.length) return true; // No perms from API = show (legacy users)
  return permissions.includes(perm);
}

const AdminDhashSide = () => {
  const { activeMenu, setActiveMenu, screenSize } = useStateContext();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const adminUser = useSelector((state: RootState) => state.adminWhoami.userData);
  const isSuperAdmin = adminUser?.roles?.includes('superAdmin') || adminUser?.roles?.includes('super_admin');
  const permissions = adminUser?.permissions || [];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Admin Dashboard");
  // const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Only fetch company for normal users, not admin users
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // Check roles array (new RBAC) or fallback to role field (backward compatibility)
    const roles = adminUser?.roles || userInfo.user?.roles || userInfo.roles || [];
    const isMainAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
    const userCompanyId = userInfo.user?.company_id || userInfo.company_id;
    
    // Only fetch company if user has company_id (normal users)
    if (!isMainAdmin && userCompanyId) {
      dispatch(getOneCompanayFN(userCompanyId));
    }
  }, [dispatch, adminUser]);

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem('theme') || 'light';
  //   setTheme(savedTheme);
  //   document.body.classList.toggle('DarkSide', savedTheme === 'dark');
  // }, []);

  // const toggleTheme = () => {
  //   const newTheme = theme === 'light' ? 'dark' : 'light';
  //   setTheme(newTheme);
  //   document.body.classList.remove(theme);
  //   document.body.classList.add(newTheme);
  //   localStorage.setItem('theme', newTheme);
  //   window.location.reload();
  // };

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize! <= 1020) {
      setActiveMenu(false);
    }
    setSidebarOpen(false);
  };


  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            setActiveMenu(!sidebarOpen);
          }}
          className="p-2.5 rounded-xl text-white bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-xl"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 w-64 h-screen
          bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950
          border-r border-indigo-800/30
          shadow-2xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-indigo-600/30">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-600 p-2 rounded-[5px] shadow-xl border border-white/20">
                <Crown className="w-4 h-4 text-yellow-300" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold tracking-tight text-white mb-0.5">
                  Sagal Trading
                </h1>
                <p className="text-[10px] text-indigo-200/90 font-medium">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-5 space-y-6">
            {adminLinks.map((section) => (
              <div key={section.title}>
                <SectionHeader title={section.title} />
                <nav className="space-y-1.5 mt-2">
                  {section.links
                    .filter((link) => {
                      const perm = (link as { permission?: string }).permission;
                      if (!perm) return true;
                      return isSuperAdmin || hasPermission(permissions, perm);
                    })
                    .map((link) => (
                      <SidebarButton
                        key={link.name}
                        name={(link as { label?: string }).label || link.name}
                        icon={link.icon}
                        path={`/AdminDashboard/${link.name}`}
                        activeNav={activeNav}
                        setActiveNav={setActiveNav}
                        location={location}
                        onClick={handleCloseSideBar}
                      />
                    ))}
                </nav>
              </div>
            ))}
          </div>

         
        </div>
      </aside>
    </>
  );
};

/* ---------- Helpers ---------- */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-[0.15em] px-2 mb-1">
      {title}
    </div>
  );
}

function SidebarButton({
  name,
  icon,
  path,
  activeNav,
  setActiveNav,
  location,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  path: string;
  activeNav: string;
  setActiveNav: (name: string) => void;
  location: ReturnType<typeof useLocation>;
  onClick?: () => void;
}) {
  const isActive = location?.pathname === path || activeNav === name;

  const content = (
    <div
      onClick={() => {
        setActiveNav(name);
        onClick?.();
      }}
      className={`
        group relative flex items-center gap-2.5 px-3 py-2 rounded
        cursor-pointer transition-all
        ${
          isActive
            ? "bg-indigo-600/50 text-white border border-white/20"
            : "text-indigo-100/90 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
        }
      `}
    >
      <div className={`
        flex items-center justify-center
        ${isActive 
          ? "text-white" 
          : "text-indigo-200/70 group-hover:text-indigo-100"
        }
      `}>
        {icon}
      </div>
      
      <span className={`flex-1 ${isActive ? "text-sm font-semibold" : "text-sm font-medium"}`}>
        {name}
      </span>
    </div>
  );

  return <Link to={path}>{content}</Link>;
}

export default AdminDhashSide;
