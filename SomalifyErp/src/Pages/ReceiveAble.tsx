import RecieveTable from '@/components/ui/ReceiveAbleTble';
import { CompanyFilter } from '@/components/ui/CompanyFilter';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCookie } from '@/lib/cookies';
import { GoPlus } from 'react-icons/go';
import { useEffect, useState, useCallback } from 'react';
import { IoIosNotifications } from 'react-icons/io';
import axios from 'axios';
import { Url } from '@/Interfaces';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { RiMoneyDollarCircleLine, RiFileList3Line } from 'react-icons/ri';

function RecieveAble() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalPrice: 0,
    totalReceived: 0,
    totalItems: 0,
    collectionProgress: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const raw = localStorage.getItem('userInfo') || getCookie('userInfo');
      const userInfo = raw ? JSON.parse(raw) : {};
      const token = userInfo.accessToken;
      const company_Id = selectedCompanyId || userInfo.user?.company_id || userInfo.company_id;
      const res = await axios.get(`${Url}/receivables/products`, {
        params: { page: 1, pageSize: 1000, ...(company_Id && { company_id: company_Id }) },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const summary = res.data?.summary;
      const totalCredit = summary != null ? summary.totalDebt : list.reduce((acc: number, item: any) => acc + parseFloat(item.credit || '0'), 0);
      const totalPrice = summary != null ? summary.totalSales : list.reduce((acc: number, item: any) => acc + parseFloat(item.total_price || '0'), 0);
      const totalReceived = summary != null ? summary.totalReceived : list.reduce((acc: number, item: any) => acc + parseFloat(item.received_amount || '0'), 0);
      const totalItems = res.data?.total ?? list.length;
      setStats({
        totalCredit,
        totalPrice,
        totalReceived,
        totalItems,
        collectionProgress: totalPrice > 0 ? (totalReceived / totalPrice) * 100 : 0,
      });
    } catch {
      /* keep last stats */
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo') || getCookie('userInfo');
    if (!userInfo) {
      navigate('/');
    } else if (!(isAdminDashboard && !selectedCompanyId)) {
      loadStats();
    }
  }, [navigate, isAdminDashboard, selectedCompanyId, loadStats]);

  const statCards = [
    {
      title: 'Total Credit (Due)',
      value: `$${stats.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <IoIosNotifications className="w-6 h-6" />,
      valueClass: 'text-amber-700',
      cardClass: 'bg-amber-50 border-amber-200/80',
      iconClass: 'text-amber-600',
    },
    {
      title: 'Total Sales',
      value: `$${stats.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
      valueClass: 'text-indigo-700',
      cardClass: 'bg-indigo-50 border-indigo-200/80',
      iconClass: 'text-indigo-600',
    },
    {
      title: 'Total Received',
      value: `$${stats.totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <RiMoneyDollarCircleLine className="w-6 h-6" />,
      valueClass: 'text-emerald-700',
      cardClass: 'bg-emerald-50 border-emerald-200/80',
      iconClass: 'text-emerald-600',
    },
    {
      title: 'Items',
      value: stats.totalItems.toString(),
      icon: <RiFileList3Line className="w-6 h-6" />,
      valueClass: 'text-violet-700',
      cardClass: 'bg-violet-50 border-violet-200/80',
      iconClass: 'text-violet-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-20">
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-blue-50 border border-indigo-500/20">
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200/60">
                  <RiMoneyDollarCircleLine className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                    Receivable List
                  </h1>
                  <p className="mt-1 text-slate-600 text-sm max-w-md">
                    Track amounts owed by customers. View receivables and record payments.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isAdminDashboard && (
                  <CompanyFilter
                    selectedCompanyId={selectedCompanyId}
                    onCompanyChange={(companyId) => setSelectedCompanyId(companyId)}
                  />
                )}
                <Link
                  to={isAdminDashboard ? '/AdminDashboard/Sales/Create' : '/Dashboard/Sales/Create'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200/80 shadow-sm transition-all"
                >
                  <GoPlus className="text-lg" /> Add New Sale
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border p-4 shadow-sm ${card.cardClass}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <p className={`mt-1 text-lg font-bold tabular-nums ${card.valueClass}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-white/70 ${card.iconClass}`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="p-5 sm:p-6">
            <RecieveTable selectedCompanyId={isAdminDashboard ? selectedCompanyId : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecieveAble;
