import React, { useState, useEffect, useCallback } from 'react';
import { WalletStatus } from '@fetchai/wallet-types';
import { useWallet } from './hooks/useWallet';
import { useAccountAndNetwork } from './hooks/useAccountAndNetwork';
import NetworkSwitchModal from './component/NetworkSwitchModal';
import AccountSwitchModal from './component/AccountSwitchModal';
import WalletDetails from './component/WalletDetails';
import Header from './component/Header';

const App: React.FC = () => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const {
    wallet,
    status,
    balance,
    network,
    account,
    initWallet,
    getStatus,
    fetchAccountAndNetworkDetails,
  } = useWallet();

  const { isLoading, setDetailsLoading } = useAccountAndNetwork(
    status,
    wallet,
    fetchAccountAndNetworkDetails
  );

  // Initialize wallet and set up event listeners
  useEffect(() => {
    initWallet();
    window.addEventListener('fetchwallet_walletstatuschange', getStatus);
    window.addEventListener(
      'fetchwallet_keystorechange',
      fetchAccountAndNetworkDetails
    );

    return () => {
      window.removeEventListener('fetchwallet_walletstatuschange', getStatus);
      window.removeEventListener(
        'fetchwallet_keystorechange',
        fetchAccountAndNetworkDetails
      );
    };
  }, [initWallet, getStatus, fetchAccountAndNetworkDetails]);

  // Fetch account and network details when wallet is unlocked
  useEffect(() => {
    if (status === WalletStatus.UNLOCKED) {
      fetchAccountAndNetworkDetails().finally(() => setDetailsLoading(false));
    }
  }, [status, wallet, fetchAccountAndNetworkDetails, setDetailsLoading]);

  // Modal toggles
  const toggleAccountModal = useCallback(
    () => setIsAccountModalOpen((prev) => !prev),
    []
  );
  const toggleNetworkModal = useCallback(
    () => setIsNetworkModalOpen((prev) => !prev),
    []
  );

  // Handle no wallet scenario
  const noWalletContent = (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Wallet Initialising...</h1>
      {!wallet && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-red-500">
            Wallet not found
          </h2>
          <p className="text-sm">
            Please install or connect your wallet to continue.
          </p>
          <ul className="list-disc pl-6 mt-2 text-sm">
            <li>Download the wallet extension from the official source.</li>
            <li>
              Ensure that your wallet is unlocked and connected.{' '}
              <a
                href="https://fetch.ai/docs/guides/fetch-network/fetch-wallet/web-wallet/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Setup Instructions
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Header />
      {status === WalletStatus.NOTLOADED ? (
        noWalletContent
      ) : (
        <div className="p-6">
          {/* Wallet UI when unlocked */}
          {status === WalletStatus.UNLOCKED && (
            <div className="flex gap-4 mb-4">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                onClick={toggleAccountModal}
              >
                Change Account
              </button>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                onClick={toggleNetworkModal}
              >
                Change Network
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                onClick={() => wallet?.lockWallet()}
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Wallet Locked State */}
          {status === WalletStatus.LOCKED && (
            <div className="mb-4 p-4 border border-gray-300 rounded-lg">
              <div className="font-semibold text-lg">Wallet Locked</div>
              <div className="mt-2">
                <button
                  className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200"
                  onClick={() => wallet?.unlockWallet()}
                >
                  Unlock
                </button>
              </div>
            </div>
          )}

          {/* Wallet Empty State */}
          {status === WalletStatus.EMPTY && (
            <h1 className="text-xl font-semibold text-gray-700">
              Wallet Empty. Please create an account in the wallet.
            </h1>
          )}

          {/* Wallet Details */}
          {!isLoading && status === WalletStatus.UNLOCKED && (
            <WalletDetails
              balance={balance}
              network={network?.chainId}
              account={account?.bech32Address}
            />
          )}

          {/* Modals for Account and Network Switch */}
          {isAccountModalOpen && account && (
            <AccountSwitchModal
              isOpen={isAccountModalOpen}
              onClose={toggleAccountModal}
              currentAddress={account.bech32Address}
            />
          )}
          {isNetworkModalOpen && network && (
            <NetworkSwitchModal
              isOpen={isNetworkModalOpen}
              onClose={toggleNetworkModal}
              currentNetworkId={network.chainId}
            />
          )}
        </div>
      )}
    </>
  );
};

export default App;
