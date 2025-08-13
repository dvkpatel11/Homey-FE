import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesAPI } from '../lib/api';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotifications } from '../contexts/NotificationContext';

export const useExpenses = (filters = {}) => {
  const { activeHouseholdId } = useHousehold();
  const { showNotificationToast } = useNotifications();
  const queryClient = useQueryClient();

  // Get bills for active household
  const {
    data: billsData,
    isLoading: billsLoading,
    error: billsError,
    refetch: refetchBills,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'bills', filters],
    queryFn: () => expensesAPI.getBills(activeHouseholdId, filters),
    enabled: !!activeHouseholdId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get household balances
  const {
    data: balancesData,
    isLoading: balancesLoading,
    error: balancesError,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'balances'],
    queryFn: () => expensesAPI.getBalances(activeHouseholdId),
    enabled: !!activeHouseholdId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: (data) => expensesAPI.createBill(activeHouseholdId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
      
      showNotificationToast({
        type: 'bill_created',
        title: 'Bill Created',
        message: `${data.data.title} has been added`,
      });
    },
    onError: (error) => {
      showNotificationToast({
        type: 'error',
        title: 'Failed to create bill',
        message: error.message,
      });
    },
  });

  // Update bill mutation
  const updateBillMutation = useMutation({
    mutationFn: ({ billId, data }) => expensesAPI.updateBill(billId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
    },
  });

  // Delete bill mutation
  const deleteBillMutation = useMutation({
    mutationFn: expensesAPI.deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: ({ billId, data }) => expensesAPI.recordPayment(billId, data),
    onMutate: async ({ billId, data }) => {
      // Optimistic update for better UX
      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
      
      const previousBalances = queryClient.getQueryData(['households', activeHouseholdId, 'balances']);
      
      // Update balances optimistically
      queryClient.setQueryData(['households', activeHouseholdId, 'balances'], (old) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            summary: {
              ...old.data.summary,
              total_owed_by_household: old.data.summary.total_owed_by_household - data.amount,
            },
          },
        };
      });
      
      return { previousBalances };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousBalances) {
        queryClient.setQueryData(['households', activeHouseholdId, 'balances'], context.previousBalances);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
      
      showNotificationToast({
        type: 'payment_recorded',
        title: 'Payment Recorded',
        message: `$${data.data.amount_paid.toFixed(2)} payment recorded`,
      });
    },
  });

  // Update split mutation
  const updateSplitMutation = useMutation({
    mutationFn: ({ billId, splits }) => expensesAPI.updateSplit(billId, splits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
    },
  });

  // Bulk payment mutation
  const bulkPaymentMutation = useMutation({
    mutationFn: expensesAPI.recordMultiplePayments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
    },
  });

  // Settlement mutations
  const calculateSettlementMutation = useMutation({
    mutationFn: () => expensesAPI.calculateSettlement(activeHouseholdId),
  });

  const recordSettlementMutation = useMutation({
    mutationFn: (settlements) => expensesAPI.recordSettlement(activeHouseholdId, settlements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'balances'] });
    },
  });

  // Helper functions
  const getBillById = (billId) => {
    return billsData?.data?.find(bill => bill.id === billId);
  };

  const getPendingBills = () => {
    return billsData?.data?.filter(bill => bill.status === 'pending') || [];
  };

  const getOverdueBills = () => {
    return billsData?.data?.filter(bill => bill.status === 'overdue') || [];
  };

  const getTotalOwed = () => {
    return balancesData?.data?.summary?.total_owed_by_household || 0;
  };

  const getUserBalance = (userId) => {
    return balancesData?.data?.member_balances?.find(balance => balance.user_id === userId);
  };

  const exportBills = async (format = 'csv', exportFilters = {}) => {
    try {
      const blob = await expensesAPI.exportBills(activeHouseholdId, format, exportFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bills_${activeHouseholdId}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showNotificationToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message,
      });
    }
  };

  return {
    // Data
    bills: billsData?.data || [],
    balances: balancesData?.data || null,
    
    // Loading states
    isLoading: billsLoading || balancesLoading,
    billsLoading,
    balancesLoading,
    
    // Error states
    error: billsError || balancesError,
    billsError,
    balancesError,
    
    // Mutation loading states
    isCreatingBill: createBillMutation.isPending,
    isUpdatingBill: updateBillMutation.isPending,
    isDeletingBill: deleteBillMutation.isPending,
    isRecordingPayment: recordPaymentMutation.isPending,
    isUpdatingSplit: updateSplitMutation.isPending,
    isBulkPayment: bulkPaymentMutation.isPending,
    isCalculatingSettlement: calculateSettlementMutation.isPending,
    isRecordingSettlement: recordSettlementMutation.isPending,
    
    // Actions
    createBill: createBillMutation.mutateAsync,
    updateBill: (billId, data) => updateBillMutation.mutateAsync({ billId, data }),
    deleteBill: deleteBillMutation.mutateAsync,
    recordPayment: (billId, data) => recordPaymentMutation.mutateAsync({ billId, data }),
    updateSplit: (billId, splits) => updateSplitMutation.mutateAsync({ billId, splits }),
    recordBulkPayments: bulkPaymentMutation.mutateAsync,
    calculateSettlement: calculateSettlementMutation.mutateAsync,
    recordSettlement: recordSettlementMutation.mutateAsync,
    
    // Utilities
    refetchBills,
    refetchBalances,
    getBillById,
    getPendingBills,
    getOverdueBills,
    getTotalOwed,
    getUserBalance,
    exportBills,
    
    // Settlement data
    settlementData: calculateSettlementMutation.data?.data,
  };
};

export default useExpenses;
