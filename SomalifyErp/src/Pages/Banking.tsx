import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { 
  FiDollarSign, 
  FiPlus, 
  FiMinus, 
  FiTrendingUp, 
  FiTrendingDown,
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiFileText,
  FiLink,
  FiExternalLink,
  FiTrash2,
} from 'react-icons/fi';
import { 
  HiOutlineBanknotes,
  HiOutlineCurrencyDollar,
  HiOutlineBuildingOffice
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { 
  getBankingDataFn, 
  addMoneyFn, 
  removeMoneyFn, 
  resetBanking,
  createAccountFn,
  deleteAccountFn,
  setSelectedAccount
} from '@/Redux/Slice/BankingSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { getAllTreasuriesFn, confirmTransferFn, cancelTransferFn } from '@/Redux/Slice/TreasurySlice';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function Banking() {
  const dispatch = useDispatch<AppDispatch>();
  const bankingStateRaw = useSelector((state: RootState) => state.banking);
  const bankingState = bankingStateRaw || {
    accounts: [],
    selectedAccountId: null,
    transactions: [],
    isLoading: false,
    isError: false,
    IsSuccess: false,
    errorMsg: ''
  };
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [lastAction, setLastAction] = useState<'add' | 'remove' | 'create' | null>(null);
  const [addFormData, setAddFormData] = useState({
    account_id: '',
    amount: '',
    description: ''
  });
  const [removeFormData, setRemoveFormData] = useState({
    account_id: '',
    amount: '',
    description: ''
  });
  const [selectedTransferCompanyId, setSelectedTransferCompanyId] = useState('');
  const [transferActionId, setTransferActionId] = useState<string | null>(null);

  const toastId = 'banking-loading';
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(getBankingDataFn());
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  const treasuryState = useSelector((state: RootState) => state.treasury);
  const companyState = useSelector((state: RootState) => state.AllCompanies);
  const treasuries = Array.isArray(treasuryState?.treasuries) ? treasuryState.treasuries : [];
  const pendingBankTransfers = treasuries.filter(
    (t: any) => t.receiver_type === 'BANK' && t.status === 'PENDING'
  );

  useEffect(() => {
    if (selectedTransferCompanyId) {
      dispatch(getAllTreasuriesFn({ company_id: selectedTransferCompanyId }));
    }
  }, [dispatch, selectedTransferCompanyId]);

  useEffect(() => {
    const companies = companyState?.data || [];
    if (companies.length > 0 && !selectedTransferCompanyId) {
      setSelectedTransferCompanyId(companies[0].company_id);
    }
  }, [companyState?.data]);

  const handleConfirmTransfer = async (id: string) => {
    setTransferActionId(id);
    const result = await dispatch(confirmTransferFn(id));
    setTransferActionId(null);
    if (confirmTransferFn.fulfilled.match(result)) {
      toast.success('Transfer confirmed');
      if (selectedTransferCompanyId) {
        dispatch(getAllTreasuriesFn({ company_id: selectedTransferCompanyId }));
      }
    } else {
      toast.error(typeof result.payload === 'string' ? result.payload : 'Failed to confirm');
    }
  };

  const handleCancelTransfer = async (id: string) => {
    setTransferActionId(id);
    const result = await dispatch(cancelTransferFn(id));
    setTransferActionId(null);
    if (cancelTransferFn.fulfilled.match(result)) {
      toast.success('Transfer cancelled');
      if (selectedTransferCompanyId) {
        dispatch(getAllTreasuriesFn({ company_id: selectedTransferCompanyId }));
      }
    } else {
      toast.error(typeof result.payload === 'string' ? result.payload : 'Failed to cancel');
    }
  };

  // Handle loading toast for initial data fetch only
  useEffect(() => {
    // Handle errors only, no loading toasts
    if (isInitialLoad && bankingState?.isError) {
      toast.error(bankingState.errorMsg || 'Failed to load banking data', { id: toastId });
      dispatch(resetBanking());
      setIsInitialLoad(false);
    } else if (isInitialLoad && bankingState?.IsSuccess && !bankingState?.isLoading) {
      // Data loaded successfully
      toast.dismiss(toastId);
      setIsInitialLoad(false);
    }

    // Cleanup: dismiss toast when component unmounts
    return () => {
      toast.dismiss(toastId);
    };
  }, [bankingState?.isLoading, bankingState?.isError, bankingState?.IsSuccess, bankingState?.errorMsg, dispatch, isInitialLoad]);

  // Debug: Log accounts when state changes
  useEffect(() => {
    if (bankingState?.accounts) {
      console.log('📊 Banking accounts updated:', bankingState.accounts);
      console.log('📊 Number of accounts:', bankingState.accounts.length);
    }
  }, [bankingState?.accounts]);

  useEffect(() => {
    if (!bankingState) return;
    
    // Handle success states (for add/remove/create operations)
    if (bankingState.IsSuccess && !bankingState.isLoading) {
      if (lastAction === 'add' || isAddOpen) {
        toast.success('Money added successfully!');
        setIsAddOpen(false);
        setAddFormData({ account_id: '', amount: '', description: '' });
        setLastAction(null);
        dispatch(getBankingDataFn()); // Re-fetch to sync with localStorage
        setTimeout(() => {
          dispatch(resetBanking());
        }, 200);
      } else if (lastAction === 'remove' || isRemoveOpen) {
        toast.success('Money removed successfully!');
        setIsRemoveOpen(false);
        setRemoveFormData({ account_id: '', amount: '', description: '' });
        setLastAction(null);
        dispatch(getBankingDataFn()); // Re-fetch to sync with localStorage
        setTimeout(() => {
          dispatch(resetBanking());
        }, 200);
      } else if (lastAction === 'create' || isCreateAccountOpen) {
        // Only show toast if lastAction is set (meaning button handler didn't already handle it)
        if (lastAction === 'create') {
          // This means the button handler already handled the success, just refresh data
          dispatch(getBankingDataFn());
          setLastAction(null);
        } else {
          // Fallback: show toast if sheet is still open but no lastAction
          toast.success('Account created successfully!');
          setIsCreateAccountOpen(false);
          setNewAccountName('');
          dispatch(getBankingDataFn());
        }
        setTimeout(() => {
          dispatch(resetBanking());
        }, 200);
      } else {
        // General success case - reset after a delay
        setTimeout(() => {
          dispatch(resetBanking());
        }, 200);
      }
    }
    
    // Handle error states
    if (bankingState.isError && !bankingState.isLoading) {
      toast.error(bankingState.errorMsg || 'An error occurred');
      setLastAction(null);
      setTimeout(() => {
        dispatch(resetBanking());
      }, 200);
    }
  }, [bankingState?.IsSuccess, bankingState?.isError, bankingState?.isLoading, dispatch, isAddOpen, isRemoveOpen, isCreateAccountOpen, lastAction]);

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.account_id) {
      toast.error('Please select an account');
      return;
    }
    const amount = parseFloat(addFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!addFormData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    setLastAction('add');
    dispatch(addMoneyFn({
      account_id: addFormData.account_id,
      amount,
      type: 'deposit',
      description: addFormData.description
    }));
  };

  const handleRemoveMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeFormData.account_id) {
      toast.error('Please select an account');
      return;
    }
    const amount = parseFloat(removeFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const selectedAccount = bankingState?.accounts?.find(acc => acc.account_id === removeFormData.account_id);
    if (amount > Number(selectedAccount?.balance ?? 0)) {
      toast.error('Insufficient balance');
      return;
    }
    if (!removeFormData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    setLastAction('remove');
    dispatch(removeMoneyFn({
      account_id: removeFormData.account_id,
      amount,
      type: 'withdrawal',
      description: removeFormData.description
    }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trimmedName = newAccountName.trim();
    if (!trimmedName) {
      toast.error('Please enter an account name');
      return;
    }
    
    if (bankingState?.isLoading) {
      toast.error('Please wait for the current operation to complete');
      return;
    }
    
    console.log('Creating account with name:', trimmedName);
    console.log('Dispatching createAccountFn...');
    
    setLastAction('create');
    
    dispatch(createAccountFn(trimmedName))
      .unwrap()
      .then((result) => {
        console.log('✅ Account created successfully!', result);
        console.log('Updated accounts:', result.accounts);
        console.log('Number of accounts:', result.accounts?.length);
        toast.success('Account created successfully!');
        setIsCreateAccountOpen(false);
        setNewAccountName('');
        setLastAction(null);
        // Refresh to ensure UI shows the new account
        dispatch(getBankingDataFn());
      })
      .catch((error) => {
        console.error('❌ Account creation failed:', error);
        toast.error(error || 'Failed to create account');
        setLastAction(null);
      });
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account? All transactions will be removed.')) {
      dispatch(deleteAccountFn(accountId));
    }
  };

  const handleSelectAccount = (accountId: string) => {
    dispatch(setSelectedAccount(accountId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedAccount = bankingState?.accounts?.find(acc => acc.account_id === bankingState?.selectedAccountId) || bankingState?.accounts?.[0];
  const currentBalance = selectedAccount?.balance || 0;
  
  const recentTransactions = (bankingState?.transactions || []).slice(0, 10);
  const totalDeposits = (bankingState?.transactions || [])
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  const totalWithdrawals = (bankingState?.transactions || [])
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  
  // Set default account in forms
  useEffect(() => {
    if (bankingState?.selectedAccountId && !addFormData.account_id) {
      setAddFormData(prev => ({ ...prev, account_id: bankingState.selectedAccountId || '' }));
    }
    if (bankingState?.selectedAccountId && !removeFormData.account_id) {
      setRemoveFormData(prev => ({ ...prev, account_id: bankingState.selectedAccountId || '' }));
    }
  }, [bankingState?.selectedAccountId]);

  // Get company data for linking (companyState already defined above)
  const totalCompanyDebt = companyState?.data?.reduce((sum, company) => {
    return sum + (parseFloat(company.debt?.toString() || '0'));
  }, 0) || 0;

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              className="relative p-2.5 rounded-lg bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-xl"
            >
              <HiOutlineBanknotes className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 flex items-center gap-2'>
                Banking Management
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  💰
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                Manage your financial transactions and balance
              </p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-lg p-8 shadow-2xl overflow-hidden mb-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">Current Balance</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-green-100 text-xs">
                  {selectedAccount?.account_name || 'No Account Selected'}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <HiOutlineCurrencyDollar className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiOutlineBanknotes className="text-indigo-600 dark:text-indigo-400" />
              Accounts
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateAccountOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-lg hover:bg-indigo-700 transition-all text-sm"
            >
              <FiPlus />
              Create Account
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-3">
            {bankingState?.accounts && Array.isArray(bankingState.accounts) && bankingState.accounts.length > 0 ? (
              bankingState.accounts.map((account) => (
                <motion.button
                  key={account.account_id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectAccount(account.account_id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium shadow-lg transition-all ${
                    bankingState?.selectedAccountId === account.account_id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-indigo-500'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">{account.account_name}</div>
                    <div className={`text-xs ${bankingState?.selectedAccountId === account.account_id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  {bankingState?.accounts && bankingState.accounts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(account.account_id);
                      }}
                      className="ml-2 p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <FiTrash2 className={`text-sm ${bankingState?.selectedAccountId === account.account_id ? 'text-white' : 'text-red-600'}`} />
                    </button>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No accounts yet. Create your first account to get started.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddOpen(true)}
            disabled={!selectedAccount}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="text-xl" />
            <span>Add Money</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRemoveOpen(true)}
            disabled={currentBalance === 0 || !selectedAccount}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiMinus className="text-xl" />
            <span>Remove Money</span>
          </motion.button>
        </div>

        {/* Account Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiLink className="text-indigo-600 dark:text-indigo-400" />
            Account Links & Related Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/AdminDashboard/Companies">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <HiOutlineBuildingOffice className="text-white text-lg" />
                  </div>
                  <FiExternalLink className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Company Payments</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  View company subscription payments
                </p>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {companyState.data?.length || 0} Companies
                </div>
              </motion.div>
            </Link>

            <Link to="/AdminDashboard/Reports">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                    <FiTrendingUp className="text-white text-lg" />
                  </div>
                  <FiExternalLink className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Financial Reports</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  View income, expenses & profit reports
                </p>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  View Reports →
                </div>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <FiDollarSign className="text-white text-lg" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Company Debt</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Total outstanding company debts
              </p>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                ${totalCompanyDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Pending treasury transfers to banks - Confirm from here */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiClock className="text-amber-600 dark:text-amber-400" />
            Pending transfers to banks
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Confirm or cancel treasury transfers sent to banking accounts
          </p>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <select
              value={selectedTransferCompanyId}
              onChange={(e) => setSelectedTransferCompanyId(e.target.value)}
              className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Select company</option>
              {(companyState?.data || []).map((c: any) => (
                <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {treasuryState?.isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto" />
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading transfers...</p>
              </div>
            ) : pendingBankTransfers.length === 0 ? (
              <div className="p-6 text-center">
                <FiClock className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No pending transfers to banks</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">From Branch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingBankTransfers.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{t.reference_id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {t.sender?.company_name || t.sender_company_id || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          ${Number(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={transferActionId === t.id}
                              onClick={() => handleConfirmTransfer(t.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {transferActionId === t.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              disabled={transferActionId === t.id}
                              onClick={() => handleCancelTransfer(t.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <FiTrendingUp className="text-sm text-green-600" />
                  Total Deposits
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <FiArrowDown className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <FiTrendingDown className="text-sm text-red-600" />
                  Total Withdrawals
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 shadow-lg">
                <FiArrowUp className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <FiFileText className="text-sm text-blue-600" />
                  Total Transactions
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(bankingState?.transactions || []).length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <FiFileText className="text-white text-lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-5 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Recent Transactions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your banking transactions</p>
        </div>
        <div className="overflow-x-auto">
          {(bankingState?.isLoading) ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading transactions...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <FiFileText className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start by adding or removing money</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentTransactions.map((transaction) => {
                  const fromBranch = transaction.from_branch
                    ?? (transaction.description?.startsWith('Treasury transfer from branch: ')
                      ? transaction.description.replace('Treasury transfer from branch: ', '')
                      : null);
                  return (
                  <tr key={transaction.transaction_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.account_name || 'Unknown Account'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {fromBranch || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <FiArrowDown className="text-sm" />
                        ) : (
                          <FiArrowUp className="text-sm" />
                        )}
                        {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'deposit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <FiClock className="text-xs" />
                        {transaction.created_at ? formatDate(transaction.created_at) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Add Money Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FiPlus className="text-green-600" />
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Money
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Deposit money into your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMoney} className="flex-1 p-6 flex flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Account
                </label>
                <select
                  value={addFormData.account_id}
                  onChange={(e) => setAddFormData({ ...addFormData, account_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select an account</option>
                  {bankingState?.accounts?.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} (${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addFormData.amount}
                  onChange={(e) => setAddFormData({ ...addFormData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  placeholder="Enter transaction description..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bankingState?.isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bankingState?.isLoading ? 'Processing...' : 'Add Money'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Money Modal */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FiMinus className="text-red-600" />
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Remove Money
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Withdraw money from your account
            </DialogDescription>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Available Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </DialogHeader>
          <form onSubmit={handleRemoveMoney} className="flex-1 p-6 flex flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Account
                </label>
                <select
                  value={removeFormData.account_id}
                  onChange={(e) => {
                    setRemoveFormData({ ...removeFormData, account_id: e.target.value });
                  }}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select an account</option>
                  {bankingState?.accounts?.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} (${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(() => {
                    const acc = bankingState?.accounts?.find(a => a.account_id === removeFormData.account_id);
                    return Number(acc?.balance ?? 0);
                  })()}
                  value={removeFormData.amount}
                  onChange={(e) => setRemoveFormData({ ...removeFormData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
                />
                {(() => {
                  const acc = bankingState?.accounts?.find(a => a.account_id === removeFormData.account_id);
                  const maxAmount = Number(acc?.balance ?? 0);
                  return parseFloat(removeFormData.amount || '0') > maxAmount && (
                    <p className="text-red-600 text-xs mt-1">Amount exceeds available balance</p>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={removeFormData.description}
                  onChange={(e) => setRemoveFormData({ ...removeFormData, description: e.target.value })}
                  placeholder="Enter transaction description..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsRemoveOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bankingState?.isLoading || (() => {
                  const acc = bankingState?.accounts?.find(a => a.account_id === removeFormData.account_id);
                  return parseFloat(removeFormData.amount || '0') > Number(acc?.balance ?? 0);
                })()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bankingState?.isLoading ? 'Processing...' : 'Remove Money'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Account Modal */}
      <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FiPlus className="text-indigo-600" />
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Account
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new banking account to organize your finances
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={handleCreateAccount} 
            className="flex-1 p-6 flex flex-col"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !bankingState?.isLoading && newAccountName.trim()) {
                e.preventDefault();
                handleCreateAccount(e as any);
              }
            }}
          >
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g., Main Account, Savings, Company Payments"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose a descriptive name for this account
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreateAccountOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const trimmedName = newAccountName.trim();
                  if (!trimmedName) {
                    toast.error('Please enter an account name');
                    return;
                  }
                  
                  if (bankingState?.isLoading) {
                    return;
                  }
                  
                  console.log('=== CREATE ACCOUNT BUTTON CLICKED ===');
                  console.log('Account name:', trimmedName);
                  
                  setLastAction('create');
                  
                  // Dispatch the action
                  dispatch(createAccountFn(trimmedName))
                    .unwrap()
                    .then((result) => {
                      console.log('✅ Account created successfully!', result);
                      toast.success('Account created successfully!');
                      setIsCreateAccountOpen(false);
                      setNewAccountName('');
                      setLastAction(null);
                      // Force refresh to ensure UI updates with new account
                      dispatch(getBankingDataFn());
                    })
                    .catch((error) => {
                      console.error('❌ Account creation failed:', error);
                      toast.error(error || 'Failed to create account');
                      setLastAction(null);
                    });
                }}
                disabled={bankingState?.isLoading || !newAccountName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bankingState?.isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default Banking;
