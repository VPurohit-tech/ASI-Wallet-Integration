import { useState } from 'react';
import {
  WalletApi,
  WalletStatus,
  Account,
  NetworkConfig,
} from '@fetchai/wallet-types';
import { Dec } from '@keplr-wallet/unit';
import { getWalletDetails } from '../utils/getWalletDetails';
import { api } from '../utils/api';
import { Balances } from '../types/balance';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletApi | null>(null);
  const [status, setStatus] = useState<WalletStatus>(WalletStatus.NOTLOADED);
  const [balance, setBalance] = useState<string>('');
  const [account, setAccount] = useState<Account | null>(null);
  const [network, setNetwork] = useState<NetworkConfig | null>(null);

  const initWallet = async () => {
    const fetchBrowserWallet = await getWalletDetails();
    if (fetchBrowserWallet?.wallet) {
      setWallet(fetchBrowserWallet.wallet);
      const status = await fetchBrowserWallet.wallet.status();
      setStatus(status);
    }
  };

  const getStatus = async () => {
    const currentStatus = await window.fetchBrowserWallet?.wallet.status();
    if (currentStatus && currentStatus !== status) {
      setStatus(currentStatus);
    }
  };

  const fetchAccountAndNetworkDetails = async () => {
    const currentAccount =
      await window.fetchBrowserWallet?.wallet.accounts.currentAccount();
    const currentNetwork =
      await window.fetchBrowserWallet?.wallet.networks.getNetwork();

    if (
      currentAccount &&
      account?.bech32Address !== currentAccount.bech32Address
    ) {
      setAccount(currentAccount);
    }
    if (currentNetwork && network?.chainId !== currentNetwork.chainId) {
      setNetwork(currentNetwork);
    }

    if (currentAccount && currentNetwork) {
      const uri = `${currentNetwork.restUrl}/cosmos/bank/v1beta1/balances/${currentAccount.bech32Address}?pagination.limit=1000`;

      const data = await api<Balances>(uri);
      const decimal = currentNetwork.currencies[0].decimals;
      const minimalDenom =
        currentNetwork.currencies[0].denomUnits.find(
          (d: { exponent: number }) => d.exponent === 0
        )?.name ?? '';
      const denom =
        currentNetwork.currencies[0].denomUnits.find(
          (d: { exponent: number }) => d.exponent === decimal
        )?.name ?? '';
      const balance = data.balances.find(
        (balance) => balance.denom === minimalDenom
      );

      if (balance) {
        const amount = new Dec(balance.amount, decimal);
        setBalance(`${amount.toString(decimal)} ${denom.toUpperCase()}`);
      } else {
        setBalance(`0 ${denom.toUpperCase()}`);
      }
    }
  };

  return {
    wallet,
    status,
    balance,
    account,
    network,
    initWallet,
    getStatus,
    fetchAccountAndNetworkDetails,
  };
};
