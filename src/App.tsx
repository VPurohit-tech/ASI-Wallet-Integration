import React, { useState, useEffect } from 'react';
import { WalletStatus } from '@fetchai/wallet-types';
import { useWallet } from './hooks/useWallet';
import { useAccountAndNetwork } from './hooks/useAccountAndNetwork';
import NetworkSwitchModal from './component/NetworkSwitchModal';
import AccountSwitchModal from './component/AccountSwitchModal';
import WalletDetails from './component/WalletDetails';

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

  useEffect(() => {
    initWallet(); // Initialize wallet once on first load

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getAllDetails = async () => {
      if (status === WalletStatus.UNLOCKED) {
        await fetchAccountAndNetworkDetails();
        setDetailsLoading(false);
      }
    };
    getAllDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, status]);

  const toggleAccountModal = () => setIsAccountModalOpen((prev) => !prev);
  const toggleNetworkModal = () => setIsNetworkModalOpen((prev) => !prev);

  if (status === WalletStatus.NOTLOADED) {
    return (
      <div>
        <h1>Wallet Initialising...</h1>
        {!wallet && (
          <div>
            <h2>Wallet not found</h2>
            <p>Please install or connect your wallet to continue.</p>
            <ul>
              <li>Download the wallet extension from the official source.</li>
              <li>
                Ensure that your wallet is unlocked and connected.{' '}
                <a
                  href="https://fetch.ai/docs/guides/fetch-network/fetch-wallet/web-wallet/get-started"
                  target="_blank"
                >
                  Setup Instructions
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {status === WalletStatus.UNLOCKED && (
        <div style={{ display: 'flex', gap: '50px', marginBottom: '12px' }}>
          <button className="asi-button" onClick={toggleAccountModal}>
            Change Account
          </button>
          <button className="asi-button" onClick={toggleNetworkModal}>
            Change Network
          </button>
          <button className="asi-button" onClick={() => wallet?.lockWallet()}>
            Sign Out
          </button>
        </div>
      )}

      {status === WalletStatus.LOCKED && (
        <div className="item" style={{ marginBottom: '12px' }}>
          <div className="item-title">Wallet Locked</div>
          <div className="item-content">
            <button
              className="asi-button"
              onClick={() => wallet?.unlockWallet()}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {status === WalletStatus.EMPTY && (
        <h1>Wallet Empty. Please create an account in the wallet</h1>
      )}

      {!isLoading && status === WalletStatus.UNLOCKED && (
        <WalletDetails
          balance={balance}
          network={network?.chainId}
          account={account?.bech32Address}
        />
      )}

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
  );
};

export default App;
