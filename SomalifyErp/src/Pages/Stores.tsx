import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { GoPlus } from 'react-icons/go';
import { CiImport, CiTrash } from 'react-icons/ci';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllStoresFn, resetAllStores, StoreData } from '@/Redux/Slice/GetAllStoresSlice';
import { getAllProductsFn } from '@/Redux/Slice/getAllProductsSlice';
import { Url } from '@/Interfaces';
import { isFullAccessRole } from '@/lib/permissions';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type StockRow = {
  productName: string;
  productCode: string;
  quantity: number;
  price: string;
};

type ImportStockRow = {
  product_code: string;
  quantity: number;
  product_id?: number;
  product_name?: string;
  price?: number;
  error?: string;
};

type CatalogProduct = { product_id: number; product_name: string; product_code: string };

function normName(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}

function compactName(value: string) {
  return normName(value).replace(/[^a-z0-9]+/g, '');
}

function parseQty(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const match = raw.replace(/\s/g, '').replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

function looksLikeHeader(row: unknown[]) {
  const cells = row.map((cell) => String(cell ?? '').toLowerCase().trim());
  const hasName = cells.some((h) => h === 'product' || h.includes('name') || h.includes('magac'));
  const hasQty = cells.some((h) => h.includes('qty') || h.includes('quantity') || h.includes('tirada'));
  const secondIsNumber = Number.isFinite(parseQty(row[1]));
  return hasName && hasQty && !secondIsNumber;
}

function cleanCell(value: unknown) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/^["']+|["']+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitFlatRow(row: unknown[]): unknown[] {
  if (row.length !== 1) return row;
  const text = String(row[0] ?? '');
  if (text.includes('\t')) return text.split('\t');
  if (text.includes(';')) return text.split(';');
  if (text.includes(',') && /\d/.test(text)) return text.split(',');
  return row;
}

function toCatalogItem(p: { product_id?: number; product_name?: string; product_code?: string }): CatalogProduct | null {
  if (!p?.product_id) return null;
  return {
    product_id: p.product_id,
    product_name: p.product_name || '',
    product_code: p.product_code || '',
  };
}

function currentUserIsAdmin(): boolean {
  try {
    const raw = localStorage.getItem('userInfo');
    const parsed = raw ? JSON.parse(raw) : {};
    const roles: string[] = parsed?.user?.roles ?? parsed?.roles ?? [];
    return isFullAccessRole(roles);
  } catch {
    return false;
  }
}

export default function Stores() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: stores, isLoading, isError, errorMsg } = useSelector((state: RootState) => state.AllStores);
  const [stockStore, setStockStore] = useState<StoreData | null>(null);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');
  const [addStore, setAddStore] = useState<StoreData | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [importRows, setImportRows] = useState<ImportStockRow[]>([]);
  const canAddProducts = currentUserIsAdmin();
  const products = useSelector((state: RootState) => state.AllProduct);
  const catalogRef = useRef<CatalogProduct[]>([]);

  useEffect(() => {
    dispatch(getAllStoresFn());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(errorMsg, { id: 'stores-error' });
      dispatch(resetAllStores());
    }
  }, [isError, errorMsg, dispatch]);

  const list = Array.isArray(stores) ? stores : (stores && typeof stores === 'object' && 'length' in stores ? (stores as unknown[]) : []);

  const handleRefresh = () => {
    dispatch(getAllStoresFn());
  };

  const closeCurrentStock = () => {
    setStockStore(null);
    setStockRows([]);
    setStockError('');
    setStockLoading(false);
  };

  const openCurrentStock = async (store: StoreData) => {
    setStockStore(store);
    setStockRows([]);
    setStockError('');
    setStockLoading(true);
    try {
      const res = await axios.get(`${Url}/stores/${store.store_id}/stock`, {
        withCredentials: true,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setStockRows(items.map((item: {
        quantity?: number | string;
        product?: { product_name?: string; product_code?: string; product_price?: string | number };
      }): StockRow => ({
        productName: item.product?.product_name || 'Unknown product',
        productCode: item.product?.product_code || '-',
        quantity: Number(item.quantity ?? 0),
        price: item.product?.product_price != null ? String(item.product.product_price) : '',
      })));
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not load current stock.'
        : 'Could not load current stock.';
      setStockError(String(message));
    } finally {
      setStockLoading(false);
    }
  };

  const fetchProductCatalog = async (): Promise<CatalogProduct[]> => {
    const catalog: CatalogProduct[] = [];
    const seen = new Set<number>();
    (products.data || []).forEach((p) => {
      const item = toCatalogItem(p);
      if (item && !seen.has(item.product_id)) {
        seen.add(item.product_id);
        catalog.push(item);
      }
    });
    let page = 1;
    const pageSize = 200;
    while (page <= 50) {
      const res = await axios.get(`${Url}/products`, {
        params: { page, pageSize },
        withCredentials: true,
      });
      const raw = res.data?.data ?? res.data;
      const batch = Array.isArray(raw) ? raw : [];
      batch.forEach((p: { product_id?: number; product_name?: string; product_code?: string }) => {
        const item = toCatalogItem(p);
        if (item && !seen.has(item.product_id)) {
          seen.add(item.product_id);
          catalog.push(item);
        }
      });
      const total = Number(res.data?.total);
      if (batch.length < pageSize || (Number.isFinite(total) && catalog.length >= total)) break;
      page += 1;
    }
    catalogRef.current = catalog;
    return catalog;
  };

  const openAddProducts = (store: StoreData) => {
    setAddStore(store);
    setProductSearch('');
    setSelectedProductId('');
    setAddQuantity('');
    setAddPrice('');
    setImportRows([]);
    dispatch(getAllProductsFn({ page: 1, pageSize: 1000, search: '' }));
    void fetchProductCatalog();
  };

  const closeAddProducts = () => {
    setAddStore(null);
    setAddSaving(false);
    setImportRows([]);
  };

  const handleExcelImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buf = e.target?.result;
        if (!(buf instanceof ArrayBuffer)) {
          toast.error('Could not read the Excel file.');
          return;
        }
        const workbook = XLSX.read(new Uint8Array(buf), { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const parsed: ImportStockRow[] = [];
        const objects = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: true });
        const headerKeys = objects[0] ? Object.keys(objects[0]) : [];
        const objectLooksNamed = headerKeys.some((k) => /name|product|magac|qty|quantity|tirada/i.test(k));

        if (objects.length > 0 && objectLooksNamed) {
          objects.forEach((obj) => {
            const entries = Object.entries(obj);
            const nameEntry = entries.find(([k]) => /name|magac/i.test(k) && !/code|qty|quantity|price/i.test(k))
              || entries.find(([k]) => /^product$/i.test(k))
              || entries.find(([, v]) => cleanCell(v) && Number.isNaN(parseQty(v)));
            const qtyEntry = entries.find(([k]) => /qty|quantity|tirada/i.test(k))
              || entries.find(([k, v]) => k !== nameEntry?.[0] && Number.isFinite(parseQty(v)) && parseQty(v) > 0);
            const priceEntry = entries.find(([k]) => /price|qiime|qiimaha/i.test(k));
            const name = cleanCell(nameEntry?.[1]);
            if (!name) return;
            let quantity = parseQty(qtyEntry?.[1]);
            if (!Number.isFinite(quantity) || quantity <= 0) quantity = 1;
            const rawPrice = parseQty(priceEntry?.[1]);
            parsed.push({
              product_code: '',
              product_name: name,
              quantity,
              ...(Number.isFinite(rawPrice) && rawPrice > 0 ? { price: rawPrice } : {}),
            });
          });
        } else {
          const sheet: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });
          const rows = sheet
            .map(splitFlatRow)
            .filter((row) => row.some((cell) => cleanCell(cell) !== ''));
          if (rows.length === 0) {
            toast.error('Excel-ka waa maran. Isticmaal: Product Name | Quantity');
            return;
          }
          let nameIdx = 0;
          let qtyIdx = 1;
          let priceIdx = -1;
          let dataRows = rows;
          if (looksLikeHeader(rows[0])) {
            const header = rows[0].map((cell) => String(cell ?? '').toLowerCase());
            const foundName = header.findIndex((h) => h.includes('name') || h.includes('magac') || h.trim() === 'product');
            const foundQty = header.findIndex((h) => h.includes('qty') || h.includes('quantity') || h.includes('tirada'));
            const foundPrice = header.findIndex((h) => h.includes('price') || h.includes('qiime') || h.includes('qiimaha'));
            if (foundName >= 0) nameIdx = foundName;
            if (foundQty >= 0) qtyIdx = foundQty;
            if (foundPrice >= 0) priceIdx = foundPrice;
            dataRows = rows.slice(1);
          }
          dataRows.forEach((row) => {
            let name = cleanCell(row[nameIdx]);
            let quantity = parseQty(row[qtyIdx]);
            if (!name || Number.isFinite(parseQty(name))) {
              const textCell = row.find((cell) => cleanCell(cell) && Number.isNaN(parseQty(cell)));
              name = cleanCell(textCell);
            }
            if (!Number.isFinite(quantity) || quantity <= 0) {
              const qtyCell = row.find((cell, i) => i !== nameIdx && Number.isFinite(parseQty(cell)) && parseQty(cell) > 0);
              quantity = parseQty(qtyCell);
            }
            if (!name) return;
            if (!Number.isFinite(quantity) || quantity <= 0) quantity = 1;
            const rawPrice = priceIdx >= 0 ? parseQty(row[priceIdx]) : NaN;
            parsed.push({
              product_code: '',
              product_name: name,
              quantity,
              ...(Number.isFinite(rawPrice) && rawPrice > 0 ? { price: rawPrice } : {}),
            });
          });
        }

        if (parsed.length === 0) {
          toast.error('Excel-ka waa maran. Isticmaal: Product Name | Quantity');
          return;
        }

        const catalog = await fetchProductCatalog();
        const byName = new Map<string, CatalogProduct>();
        const byCompact = new Map<string, CatalogProduct>();
        catalog.forEach((p) => {
          const nameKey = normName(p.product_name);
          const compact = compactName(p.product_name);
          if (nameKey && !byName.has(nameKey)) byName.set(nameKey, p);
          if (compact && !byCompact.has(compact)) byCompact.set(compact, p);
        });

        const findProduct = (name: string): CatalogProduct | undefined => {
          const n = normName(name);
          const c = compactName(name);
          if (!n) return undefined;
          return (
            byName.get(n) ||
            byCompact.get(c) ||
            catalog.find((p) => n.length > 2 && (normName(p.product_name).includes(n) || n.includes(normName(p.product_name))))
          );
        };

        const matched: ImportStockRow[] = parsed.map((row) => {
          const found = findProduct(row.product_name || '');
          if (!found) {
            return { ...row, error: `Not found: ${row.product_name}` };
          }
          return {
            ...row,
            quantity: Number.isFinite(row.quantity) && row.quantity > 0 ? row.quantity : 1,
            product_id: found.product_id,
            product_name: found.product_name,
            product_code: found.product_code,
          };
        });

        setImportRows(matched);
        const missing = matched.filter((r) => r.error).length;
        const ready = matched.length - missing;
        if (ready === 0) {
          toast.error(`No matching products. Excel: "${parsed[0]?.product_name ?? ''}"`);
        } else {
          toast.success(
            missing
              ? `${ready} products ready, ${missing} need a fix.`
              : `${matched.length} products imported.`
          );
        }
      } catch {
        toast.error('Could not read the Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (!addStore) return;
    const timer = setTimeout(() => {
      dispatch(getAllProductsFn({ page: 1, pageSize: 50, search: productSearch }));
    }, 300);
    return () => clearTimeout(timer);
  }, [addStore, productSearch, dispatch]);

  const submitAddProduct = async () => {
    if (!addStore) return;
    const validImport = importRows
      .filter((r) => r.product_id)
      .map((r) => ({ ...r, quantity: Number.isFinite(r.quantity) && r.quantity > 0 ? r.quantity : 1 }));

    if (importRows.length > 0 && validImport.length === 0) {
      toast.error('No matching products found. Magaca Excel ha la mid noqdo Products.');
      return;
    }

    if (validImport.length > 0) {
      const sharedPrice = Number(String(addPrice).replace(',', '.'));
      const pricedImport = validImport.map((row) => {
        const rowPrice = Number(row.price);
        const price = Number.isFinite(rowPrice) && rowPrice > 0 ? rowPrice : sharedPrice;
        return { ...row, price };
      });
      if (pricedImport.some((row) => !Number.isFinite(row.price) || row.price <= 0)) {
        toast.error('Enter a price greater than 0. It is saved on every imported product.');
        return;
      }
      setAddSaving(true);
      let ok = 0;
      let fail = 0;
      try {
        for (const row of pricedImport) {
          try {
            await axios.post(
              `${Url}/stores/${addStore.store_id}/stock`,
              { product_id: row.product_id, quantity: row.quantity, price: row.price },
              { withCredentials: true }
            );
            ok++;
          } catch {
            fail++;
          }
        }
        if (ok) toast.success(`${ok} product${ok > 1 ? 's' : ''} added to this store.`);
        if (fail) toast.error(`${fail} product${fail > 1 ? 's' : ''} failed.`);
        const store = addStore;
        closeAddProducts();
        openCurrentStock(store);
      } finally {
        setAddSaving(false);
      }
      return;
    }

    const qty = Number(String(addQuantity).replace(',', '.'));
    const price = Number(String(addPrice).replace(',', '.'));
    if (!selectedProductId || !Number.isFinite(qty) || qty <= 0) {
      toast.error('Select a product and enter a quantity greater than 0.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Enter a price greater than 0.');
      return;
    }
    setAddSaving(true);
    try {
      await axios.post(
        `${Url}/stores/${addStore.store_id}/stock`,
        { product_id: Number(selectedProductId), quantity: qty, price },
        { withCredentials: true }
      );
      toast.success('Product added to this store.');
      const store = addStore;
      closeAddProducts();
      openCurrentStock(store);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not add the product.'
        : 'Could not add the product.';
      toast.error(String(message));
      setAddSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
              >
                <HiOutlineShoppingBag className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400">
                  Stores
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Stores linked to companies for selling purchases
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/AdminDashboard/Stores/Create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <GoPlus className="text-lg" />
              Create Store
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Stores</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stores and their linked companies</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            {isError ? (
              <div className="py-12 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading stores...</div>
            ) : list.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No stores yet. Create a store and link companies to it.
              </div>
            ) : (
              <div className="space-y-4">
                {(list as StoreData[]).map((store) => (
                  <motion.div
                    key={store.store_id}
                    layout
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{store.store_name}</h3>
                        {store.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{store.description}</p>
                        )}
                        {store.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 {store.location}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Created {format(new Date(store.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Linked companies: {store.store_companies?.length ?? 0}
                        </span>
                        {store.store_companies && store.store_companies.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            {store.store_companies.slice(0, 5).map((sc: { company: { company_name: string } }) => (
                              <span
                                key={sc.company.company_name}
                                className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              >
                                {sc.company.company_name}
                              </span>
                            ))}
                            {store.store_companies.length > 5 && (
                              <span className="text-xs text-gray-500">+{store.store_companies.length - 5} more</span>
                            )}
                          </div>
                        )}
                        {canAddProducts && (
                          <button
                            type="button"
                            onClick={() => openAddProducts(store)}
                            className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          >
                            Add products
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openCurrentStock(store)}
                          className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Current Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/AdminDashboard/Stores/Update/${store.store_id}`)}
                          className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {stockStore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCurrentStock}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Stock</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stockStore.store_name}</p>
              </div>
              <button
                type="button"
                onClick={closeCurrentStock}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[65vh]">
              {stockLoading ? (
                <p className="py-8 text-center text-gray-500">Loading current stock...</p>
              ) : stockError ? (
                <p className="py-8 text-center text-red-600 dark:text-red-400">{stockError}</p>
              ) : stockRows.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No products in stock for this store.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="py-2 pr-3">Product</th>
                      <th className="py-2 pr-3 text-right">Quantity</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRows.map((row, index) => (
                      <tr key={`${row.productCode}-${index}`} className="border-b border-gray-100 dark:border-gray-700/60">
                        <td className="py-2.5 pr-3 font-medium text-gray-900 dark:text-white">{row.productName}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-gray-900 dark:text-white">{row.quantity}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-gray-200">
                          {row.price ? Number(row.price).toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {addStore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeAddProducts}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {addStore.store_name}. Only admin can add existing products.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddProducts}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 gap-2 flex items-center text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={() => document.getElementById('excel-import-store-stock')?.click()}
                >
                  <CiImport className="text-lg" />
                  Import Excel
                </button>
                <input
                  id="excel-import-store-stock"
                  type="file"
                  accept=".csv, .xlsx"
                  className="hidden"
                  onChange={handleExcelImport}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Excel columns: Product Name, Quantity, Price. The Price field below is used when a row has no price.
              </p>
              {importRows.length > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-56">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase text-gray-500">
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, index) => (
                        <tr key={`${row.product_name}-${index}`} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3">
                            {row.product_name || '—'}
                            {row.error && <span className="block text-xs text-red-600">{row.error}</span>}
                          </td>
                          <td className="py-2 px-3 text-right">{row.quantity || '—'}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setImportRows((rows) => rows.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <CiTrash className="text-lg inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <input
                type="text"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search existing products..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={selectedProductId}
                onChange={(event) => {
                  const id = event.target.value;
                  setSelectedProductId(id);
                  const product = (products.data || []).find(
                    (item) => String(item.product_id) === id
                  );
                  const current = product ? Number(product.product_price) : NaN;
                  setAddPrice(Number.isFinite(current) && current > 0 ? String(current) : '');
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a product</option>
                {(products.data || []).map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={addPrice}
                onChange={(event) => setAddPrice(event.target.value)}
                placeholder="Price"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                min="0.01"
                step="any"
                value={addQuantity}
                onChange={(event) => setAddQuantity(event.target.value)}
                placeholder="Quantity"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                disabled={addSaving}
                onClick={submitAddProduct}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {addSaving ? 'Saving...' : 'Add to store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
