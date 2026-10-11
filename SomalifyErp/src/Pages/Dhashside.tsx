"use client";
import { useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { links } from "../components/ui/Yumm";
import { useCompanyPermissions } from "@/hooks/useCompanyPermissions";
import { useStateContext } from "../components/ui/ContextProvider";
import { AppDispatch, RootState } from "@/Redux/Store";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";

const DhashSide = () => {
  const { activeMenu, setActiveMenu, screenSize } = useStateContext();
  const { can } = useCompanyPermissions();

  const filteredLinks = useMemo(() => {
    return links.map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        if (!link.permission) return true;
        const [resource, action] = link.permission.split(":");
        return can(resource, action);
      }),
    })).filter((section) => section.links.length > 0);
  }, [can]);

  const dispatch = useDispatch<AppDispatch>();
  const GetOneCompanayState = useSelector(
    (state: RootState) => state.GetOneCompanay
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    document.body.classList.toggle("DarkSide", theme === "dark");
  }, []);

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize! <= 1020) {
      setActiveMenu(false);
    }
  };

  const getUserInitial = () =>
    userInfo?.user?.full_name
      ? userInfo.user.full_name.charAt(0).toUpperCase()
      : "U";

  const getFullName = () =>
    userInfo?.user?.full_name ? userInfo.user.full_name : "User";

  const companyName = GetOneCompanayState.data?.company_name || "Company";

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0D0212 0%, #09000D 40%, #09000D 100%)' }}
    >
      {activeMenu && (
        <>
          {/* ─── Brand header ─── */}
          <div className="shrink-0 px-5 pt-6 pb-4">
            <div className="flex justify-between items-center">
              <Link
                to="/Dashboard/Home"
                onClick={handleCloseSideBar}
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-500 group-hover:scale-105 overflow-hidden p-1.5"
                  style={{ background: 'linear-gradient(135deg, #4A0E6B 0%, #330447 100%)' }}
                >
                  <img src="/uplogo.png" alt="" className="w-full h-full object-contain brightness-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-white tracking-tight leading-tight">
                    {companyName}
                  </span>
                  <span className="text-[10px] font-medium text-white/25 tracking-widest uppercase">
                    Dashboard
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setActiveMenu(!activeMenu)}
                className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/5 active:scale-90 md:hidden transition-all duration-200"
              >
                <MdOutlineCancel className="text-lg" />
              </button>
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* ─── Navigation ─── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-5 pb-28 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            <nav className="space-y-7">
              {filteredLinks.map((item, index) => (
                <div key={`${item.title}-${index}`}>
                  {item.title && (
                    <p className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20">
                      {item.title}
                    </p>
                  )}

                  <div className="space-y-0.5">
                    {item.links.map((link) => (
                      <NavLink
                        to={`/Dashboard/${link.name}`}
                        key={link.name}
                        onClick={handleCloseSideBar}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden
                          ${isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] active:scale-[0.98]"
                          }`
                        }
                        style={({ isActive }) =>
                          isActive
                            ? { background: 'linear-gradient(135deg, #330447 0%, #2A0A3A 60%, #1F0730 100%)' }
                            : {}
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full shadow-md"
                                style={{ background: 'linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)', boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)' }}
                              />
                            )}
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-lg text-[15px] shrink-0 transition-all duration-200
                                ${isActive
                                  ? "text-purple-300"
                                  : "text-white/30 group-hover:text-white/50"
                                }`}
                              style={isActive ? { background: 'rgba(168, 85, 247, 0.12)' } : {}}
                            >
                              {link.icon}
                            </span>
                            <span className="capitalize tracking-wide leading-none">
                              {(link as { label?: string }).label || link.name}
                            </span>
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/60" />
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* ─── User card ─── */}
          {userInfo?.user && (
            <div className="shrink-0 p-3 border-t border-white/5">
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/15"
                  style={{ background: 'linear-gradient(135deg, #4A0E6B 0%, #330447 100%)' }}
                >
                  {getUserInitial()}
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <span className="font-semibold text-white/90 text-[13px] truncate leading-tight">
                    {getFullName()}
                  </span>
                  <span className="text-[10px] text-white/25 font-medium mt-0.5">
                    {GetOneCompanayState.data?.company_email || "User"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DhashSide;
