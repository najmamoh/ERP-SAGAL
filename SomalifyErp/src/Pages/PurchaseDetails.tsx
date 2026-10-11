import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Url } from '@/Interfaces';

type CostEntry = {
  id: number;
  amount: string | number;
  description: string | null;
  created_at: string;
};

type PaymentEntry = {
  id: number;
  amount: string | number;
  discount: string | number;
  description: string | null;
  created_at: string;
};

type PurchaseDetailsData = {
  purchase_id: number;
  purchase_qty: string | number;
  item_cost: string | number;
  extra_cost: string | number;
  paid_amount: string | number;
  purchase_debt: string | number;
  purchase_discount: string | number;
  container_number: string | null;
  created_at: string | null;
  products?: { product_name?: string; product_code?: string; product_price?: string | number };
  vendors?: { vendor_name?: string };
  cost_entries?: CostEntry[];
  payment_entries?: PaymentEntry[];
  same_container?: Array<{
    purchase_id: number;
    purchase_qty: string | number;
    item_cost: string | number;
    paid_amount: string | number;
    purchase_debt: string | number;
    products?: { product_name?: string; product_code?: string };
    payment_entries?: PaymentEntry[];
  }>;
};

type TabId = 'costs' | 'price' | 'container';

const field =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200/80 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-500';
const btnSoft =
  'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors';
const panel =
  'mt-5 rounded-xl border border-slate-200/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/40 overflow-hidden';

export default function PurchaseDetails() {
  const { purchase_id } = useParams();
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/AdminDashboard')
    ? '/AdminDashboard'
    : '/Dashboard';
  const [purchase, setPurchase] = useState<PurchaseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [tab, setTab] = useState<TabId>('costs');

  const load = async () => {
    if (!purchase_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${Url}/purchases/${purchase_id}`, {
        withCredentials: true,
      });
      setPurchase(res.data);
      const currentPrice = res.data?.products?.product_price;
      if (currentPrice != null && currentPrice !== '') {
        setSellingPrice(String(Number(currentPrice)));
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not load purchase'
        : 'Could not load purchase';
      toast.error(String(message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [purchase_id]);

  const qty = Number(purchase?.purchase_qty || 0);
  const goodsCost = qty * Number(purchase?.item_cost || 0);
  const entries = purchase?.cost_entries ?? [];
  const filteredExtraCost = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const filteredCostTotal = goodsCost + filteredExtraCost;
  const costPerUnit = qty > 0 ? filteredCostTotal / qty : 0;
  const paid = Number(purchase?.paid_amount || 0);
  const debt = Number(purchase?.purchase_debt || 0);
  const sameContainer = purchase?.same_container ?? [];
  const showContainerTab = Boolean(purchase?.container_number && sameContainer.length > 0);

  const handleAddCost = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(String(amount).replace(',', '.'));
    if (!purchase_id || !Number.isFinite(value) || value <= 0) {
      toast.error('Enter a cost greater than 0');
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${Url}/purchases/${purchase_id}/costs`,
        { amount: value, description: description.trim() },
        { withCredentials: true }
      );
      toast.success('Cost added to this purchase');
      setAmount('');
      setDescription('');
      await load();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not add cost'
        : 'Could not add cost';
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  const handleSetSellingPrice = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(String(sellingPrice).replace(',', '.'));
    if (!purchase_id || !Number.isFinite(value) || value < 0) {
      toast.error('Enter a selling price of 0 or greater');
      return;
    }
    setSavingPrice(true);
    try {
      await axios.post(
        `${Url}/purchases/${purchase_id}/selling-price`,
        { selling_price: value },
        { withCredentials: true }
      );
      toast.success('Selling price saved');
      await load();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not save selling price'
        : 'Could not save selling price';
      toast.error(String(message));
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading && !purchase) {
    return <div className="p-8 text-sm text-slate-500">Loading purchase...</div>;
  }

  if (!purchase) {
    return <div className="p-8 text-sm text-slate-500">Purchase not found.</div>;
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'costs', label: 'Costs' },
    { id: 'price', label: 'Price' },
    ...(showContainerTab ? [{ id: 'container' as TabId, label: 'Container' }] : []),
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/80 dark:bg-slate-950 px-4 md:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
        >
          ← Back
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          Purchase Details
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {purchase.products?.product_name || 'Product'} · #{purchase.purchase_id}
          {purchase.container_number ? ` · ${purchase.container_number}` : ''}
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <Info label="Container" value={purchase.container_number || '—'} />
          <Info label="Qty" value={String(qty)} />
          <Info label="Unit" value={Number(purchase.item_cost).toFixed(2)} />
          <Info label="Total" value={filteredCostTotal.toFixed(2)} />
          <Info label="Cost/unit" value={costPerUnit.toFixed(2)} />
          <Info label="Paid" value={paid.toFixed(2)} />
          <Info label="Debt" value={debt.toFixed(2)} />
        </div>

        {/* Tabs — one section at a time */}
        <div className={`${panel} !mt-5`}>
          <div className="flex flex-wrap gap-1 border-b border-slate-100 dark:border-slate-700/60 px-2 pt-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  tab === t.id
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-b-0 border-slate-200 dark:border-slate-600'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'costs' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Add extra costs, then open Price to set selling price.</p>
                <form onSubmit={handleAddCost} className="flex flex-col md:flex-row gap-3">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Extra cost"
                    className={`${field} flex-1`}
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this cost?"
                    className={`${field} flex-[2]`}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className={`${btnSoft} bg-indigo-500/90 text-white hover:bg-indigo-600 disabled:opacity-50`}
                  >
                    {saving ? 'Saving...' : 'Add cost'}
                  </button>
                </form>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                      <th className="py-2.5 pr-2 font-medium">When</th>
                      <th className="py-2.5 pr-2 font-medium">Description</th>
                      <th className="py-2.5 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50 dark:border-slate-800">
                      <td className="py-2.5 pr-2 text-slate-500">
                        {purchase.created_at ? format(new Date(purchase.created_at), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-200">Purchase cost</td>
                      <td className="py-2.5 text-right text-slate-700 dark:text-slate-200">{goodsCost.toFixed(2)}</td>
                    </tr>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-50 dark:border-slate-800">
                        <td className="py-2.5 pr-2 text-slate-500">
                          {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-200">
                          {entry.description || 'Extra cost'}
                        </td>
                        <td className="py-2.5 text-right text-slate-700 dark:text-slate-200">
                          {Number(entry.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3" />
                      <td className="pt-3 text-slate-600 dark:text-slate-300 font-medium">Total</td>
                      <td className="pt-3 text-right text-slate-800 dark:text-slate-100 font-medium">
                        {filteredCostTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'price' && (
              <form onSubmit={handleSetSellingPrice} className="space-y-3 max-w-md">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Set selling price</p>
                <p className="text-xs text-slate-500">
                  After all costs are done. Total: {filteredCostTotal.toFixed(2)} · Cost/unit: {costPerUnit.toFixed(2)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="Selling price"
                    className={`${field} flex-1`}
                  />
                  <button
                    type="submit"
                    disabled={savingPrice}
                    className={`${btnSoft} bg-emerald-600/90 text-white hover:bg-emerald-700 disabled:opacity-50`}
                  >
                    {savingPrice ? 'Saving...' : 'Save price'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'container' && showContainerTab && (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  Other purchases in {purchase.container_number}
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                      <th className="py-2.5 pr-2 font-medium">Purchase</th>
                      <th className="py-2.5 pr-2 font-medium">Product</th>
                      <th className="py-2.5 pr-2 font-medium text-right">Paid</th>
                      <th className="py-2.5 pr-2 font-medium text-right">Debt</th>
                      <th className="py-2.5 font-medium text-right">Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sameContainer.map((row) => (
                      <tr key={row.purchase_id} className="border-b border-slate-50 dark:border-slate-800">
                        <td className="py-2.5 pr-2">
                          <Link
                            to={`${basePath}/Purchases/Details/${row.purchase_id}`}
                            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 underline-offset-2 hover:underline"
                          >
                            #{row.purchase_id}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-200">
                          {row.products?.product_name || '—'}
                        </td>
                        <td className="py-2.5 pr-2 text-right text-slate-600">
                          {Number(row.paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-2 text-right text-slate-600">
                          {Number(row.purchase_debt || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-slate-600">
                          {row.payment_entries?.length ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/70 bg-white/60 dark:bg-slate-800/30 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-base font-medium text-slate-700 dark:text-slate-100 mt-0.5 truncate">{value}</p>
    </div>
  );
}
