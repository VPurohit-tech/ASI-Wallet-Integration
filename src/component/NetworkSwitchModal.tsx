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
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Network Switch</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div>
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 border-4 border-t-4 border-gray-600 rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600">Loading networks...</p>
            </div>
          ) : networks && networks.length === 0 ? (
            <p className="text-gray-600">
              No networks found. Please add or configure a network.
            </p>
          ) : networks && networks.length === 1 ? (
            <p className="text-gray-600">
              You only have one network. No need to switch.
            </p>
          ) : (
            <>
              <p className="text-gray-700 mb-2">Select a network to switch:</p>
              <select
                value={selectedNetwork}
                onChange={handleNetworkChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition duration-200"
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
