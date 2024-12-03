import React, { useEffect, useState, useCallback } from 'react';
import { NetworkConfig } from '@fetchai/wallet-types';

interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNetworkId: string;
}

const NetworkSwitchModal: React.FC<NetworkSwitchModalProps> = ({
  isOpen,
  onClose,
  currentNetworkId,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [networks, setNetworks] = useState<NetworkConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch networks only when the modal is open and networks haven't already been loaded
  const getNetworks = useCallback(async () => {
    if (isOpen && !networks) {
      // Only fetch if modal is open and networks are not loaded
      setIsLoading(true);
      try {
        const fetchedNetworks =
          await window.fetchBrowserWallet?.wallet.networks.listNetworks();
        setNetworks(fetchedNetworks || []);
      } catch (error) {
        console.error('Error fetching networks:', error);
        setNetworks([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen, networks]);

  useEffect(() => {
    getNetworks();
  }, [getNetworks]);

  // Early return for modal when it's not open
  if (!isOpen) return null; // If modal is not open, return null to stop rendering

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNetwork(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedNetwork && selectedNetwork !== currentNetworkId) {
      await window.fetchBrowserWallet?.wallet.networks.switchToNetworkByChainId(
        selectedNetwork
      );
      onClose();
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="close" onClick={onClose}>
            <span>&times;</span>
          </div>
          <h2>Network Switch</h2>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading networks...</p>
            </div>
          ) : networks && networks.length === 0 ? (
            <p>No networks found. Please add or configure a network.</p>
          ) : networks && networks.length === 1 ? (
            <p>You only have one network. No need to switch.</p>
          ) : (
            <>
              <p>Select a network to switch:</p>
              <select
                style={{ marginBottom: '15px' }}
                value={selectedNetwork}
                onChange={handleNetworkChange}
              >
                <option value="">Select Network</option>
                {networks?.map((network) =>
                  network.chainId !== currentNetworkId ? (
                    <option key={network.chainId} value={network.chainId}>
                      {network.chainName}
                    </option>
                  ) : null
                )}
              </select>
              <button
                className="asi-button"
                onClick={handleSubmit}
                disabled={!selectedNetwork}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitchModal;
