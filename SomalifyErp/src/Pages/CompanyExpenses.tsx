import CompanyExpensesData from '@/components/ui/CompanyExpensesData';
import { GoPlus } from 'react-icons/go';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCookie } from '@/lib/cookies';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import axios from 'axios';
import { Url } from '@/Interfaces';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from 'react-icons/hi2';

interface ExpenseRow {
  expense_id: number;
  item_name: string;
  item_qty: number;
  item_cost: string;
  paid_amount: string;
  date: string;
}

const PERIODS = [
  { key: '6M', months: 6 },
  { key: '12M', months: 12 },
  { key: '2Y', months: 24 },
  { key: '5Y', months: 60 },
  { key: 'Max', months: 120 },
] as const;

const cardBase =
  'rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50';
const btnPrimary =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.4)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.5)] transition-all duration-200';
function CompanyExpenses() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';

  const { data = [], total = 0 } = useSelector((state: RootState) => state.CompanyExpenses) ?? {};

  const [chartPeriod, setChartPeriod] = useState<number>(6);
  const [stats, setStats] = useState<{
    thisMonthTotal: number;
    lastMonthTotal: number;
    unpaidCount: number;
    unpaidAmount: number;
  } | null>(null);
  const [chartData, setChartData] = useState<{ month: string; value: number; full: string }[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const getUserInfo = () => {
    const fromStorage = localStorage.getItem('userInfo');
    const fromCookie = getCookie('userInfo');
    const raw = fromStorage || fromCookie;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      navigate('/');
      setStatsLoading(false);
      return;
    }
    const token = userInfo.accessToken;
    const companyId = userInfo.user?.company_id ?? userInfo.company_id;
    if (!companyId) {
      setStatsLoading(false);
      setStats({ thisMonthTotal: 0, lastMonthTotal: 0, unpaidCount: 0, unpaidAmount: 0 });
      return;
    }

    setStatsLoading(true);
    const now = new Date();
    const thisStart = startOfMonth(now);
    const thisEnd = endOfMonth(now);
    const lastStart = startOfMonth(subMonths(now, 1));
    const lastEnd = endOfMonth(subMonths(now, 1));

    const req = (start: Date, end: Date) =>
      axios.get<{ data?: ExpenseRow[] }>(`${Url}/otherexpenses`, {
        params: {
          page: 1,
          pageSize: 1000,
          company_id: companyId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

    Promise.all([req(thisStart, thisEnd), req(lastStart, lastEnd)])
      .then(([resThis, resLast]) => {
        const thisData = resThis.data?.data ?? [];
        const lastData = resLast.data?.data ?? [];
        const totalCost = (list: ExpenseRow[]) =>
          list.reduce((acc, e) => acc + parseFloat(e.item_cost || '0') * (e.item_qty || 0), 0);
        const thisMonthTotal = totalCost(thisData);
        const lastMonthTotal = totalCost(lastData);
        const unpaid = thisData.filter((e) => {
          const cost = parseFloat(e.item_cost || '0') * (e.item_qty || 0);
          const paid = parseFloat(e.paid_amount || '0');
          return paid < cost - 0.01;
        });
        const unpaidAmount = unpaid.reduce((acc, e) => {
          const cost = parseFloat(e.item_cost || '0') * (e.item_qty || 0);
          const paid = parseFloat(e.paid_amount || '0');
          return acc + Math.max(0, cost - paid);
        }, 0);
        setStats({
          thisMonthTotal,
          lastMonthTotal,
          unpaidCount: unpaid.length,
          unpaidAmount,
        });
      })
      .catch(() =>
        setStats({
          thisMonthTotal: 0,
          lastMonthTotal: 0,
          unpaidCount: 0,
          unpaidAmount: 0,
        })
      )
      .finally(() => setStatsLoading(false));
  }, [navigate]);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      setChartLoading(false);
      setChartData([]);
      return;
    }
    const token = userInfo.accessToken;
    const companyId = userInfo.user?.company_id ?? userInfo.company_id;
    if (!companyId) {
      setChartLoading(false);
      setChartData([]);
      return;
    }

    setChartLoading(true);
    const now = new Date();
    const chartStart = startOfDay(subMonths(now, chartPeriod));
    const chartEnd = endOfDay(now);
    axios
      .get<{ data?: ExpenseRow[] }>(`${Url}/otherexpenses`, {
        params: {
          page: 1,
          pageSize: 2000,
          company_id: companyId,
          startDate: chartStart.toISOString(),
          endDate: chartEnd.toISOString(),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      })
      .then((res) => {
        const chartList = res.data?.data ?? [];
        const byMonth: Record<string, number> = {};
        for (let i = 0; i < chartPeriod; i++) {
          const d = subMonths(now, chartPeriod - 1 - i);
          const key = format(d, 'yyyy-MM');
          byMonth[key] = 0;
        }
        chartList.forEach((e) => {
          const d = new Date(e.date);
          const key = format(d, 'yyyy-MM');
          if (!byMonth[key]) byMonth[key] = 0;
          byMonth[key] += parseFloat(e.item_cost || '0') * (e.item_qty || 0);
        });
        const sorted = Object.entries(byMonth)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, value]) => ({
            month: format(new Date(month + '-01'), 'MMM yyyy'),
            full: month,
            value: Math.round(value * 100) / 100,
          }));
        setChartData(sorted);
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [chartPeriod]);

  const vsLastMonth = useMemo(() => {
    if (!stats || stats.lastMonthTotal === 0) return null;
    const pct = ((stats.thisMonthTotal - stats.lastMonthTotal) / stats.lastMonthTotal) * 100;
    return pct;
  }, [stats]);

  const pageStats = useMemo(() => {
    const totalPaid = data.reduce((acc, e) => acc + parseFloat(e.paid_amount || '0'), 0);
    const totalCost = data.reduce(
      (acc, e) => acc + parseFloat(e.item_cost || '0') * (e.item_qty || 0),
      0
    );
    return { totalPaid, totalCost, totalRecords: total };
  }, [data, total]);

  return (
    <div className="min-h-screen bg-slate-50/80 overflow-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - soft */}
        <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 px-6 py-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/30">
                <HiOutlineCurrencyDollar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Company Expenses
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Track spend and payment due
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to={`${basePath}/Expenses/Create`} className={btnPrimary}>
                <GoPlus className="text-lg" /> Add New
              </Link>
            </div>
          </div>
        </div>

        {/* Stats + Chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className={`${cardBase} p-5 flex flex-col gap-1`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl font-semibold text-slate-800 dark:text-white tabular-nums">
                  {statsLoading
                    ? '...'
                    : `$${(stats?.thisMonthTotal ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
                {vsLastMonth != null && (
                  <span
                    className={`text-sm font-medium shrink-0 ${
                      vsLastMonth >= 0 ? 'text-emerald-500' : 'text-rose-400'
                    }`}
                  >
                    {vsLastMonth >= 0 ? '↑' : '↓'} {Math.abs(vsLastMonth).toFixed(0)}% vs last month
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total spend this month</p>
            </div>

            <div className={`${cardBase} p-5 flex flex-col gap-1`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl font-semibold text-slate-800 dark:text-white tabular-nums">
                  {statsLoading
                    ? '...'
                    : `$${(stats?.unpaidAmount ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
                {(stats?.unpaidCount ?? 0) > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    {stats!.unpaidCount} unpaid
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Payment due this month</p>
            </div>
          </div>

          <div className={`lg:col-span-2 ${cardBase} p-5 flex flex-col`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineChartBar className="text-xl text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xl font-semibold text-slate-800 dark:text-white tabular-nums">
                    {statsLoading
                      ? '...'
                      : `$${(stats?.thisMonthTotal ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">MoM spend</p>
                </div>
              </div>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50">
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setChartPeriod(p.months)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      chartPeriod === p.months
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {p.key}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${Number(value).toFixed(2)}`,
                        'Spend',
                      ]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.month}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      fill="url(#spendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                  {chartLoading ? 'Loading chart...' : 'No spend data for this period'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table card - same style as other forms list cards */}
        <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              All expenses
            </h2>
            {pageStats.totalRecords > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {pageStats.totalRecords} total · Page total: ${pageStats.totalCost.toFixed(2)}
              </span>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <CompanyExpensesData />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyExpenses;
