import { WalletStatus } from '@fetchai/wallet-types';
import { useState, useEffect } from 'react';

export const useAccountAndNetwork = (
  status: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any,
  fetchAccountAndNetworkDetails: () => void
) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === WalletStatus.UNLOCKED && wallet) {
      setIsLoading(true);
      fetchAccountAndNetworkDetails();
      setIsLoading(false);
    }
  }, [status, wallet, fetchAccountAndNetworkDetails]);

  return { isLoading, setDetailsLoading: setIsLoading };
};
