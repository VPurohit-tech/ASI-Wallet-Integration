import React, { useEffect, useState, useCallback } from 'react';
import { Account } from '@fetchai/wallet-types';

const AccountSwitchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
}> = ({ isOpen, onClose, currentAddress }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch accounts only when the modal is open and fetch hasn't already completed
  const getAccounts = useCallback(async () => {
    if (isOpen && !accounts) {
      // Only fetch if modal is open and accounts are not loaded
      setIsLoading(true);
      try {
        const fetchedAccounts =
          await window.fetchBrowserWallet?.wallet.accounts.listAccounts();
        setAccounts(fetchedAccounts || []);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen, accounts]);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  // Early returns for clean and readable code flow
  if (!isOpen) return null; // If modal is not open, return null to stop rendering

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedAccount && selectedAccount !== currentAddress) {
      await window.fetchBrowserWallet?.wallet.accounts.switchAccount(
        selectedAccount
      );
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-lg shadow-xl w-full sm:w-96 p-8 transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Switch Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center items-center space-x-2">
              <div className="w-8 h-8 border-4 border-t-4 border-gray-600 rounded-full animate-spin"></div>
            </div>
          ) : accounts && accounts.length === 0 ? (
            <p className="text-gray-600">
              No accounts found. Please create or add an account.
            </p>
          ) : accounts && accounts.length === 1 ? (
            <p className="text-gray-600">
              You only have one account. No need to switch.
            </p>
          ) : (
            <>
              <p className="text-gray-700 mb-3">Select an account to switch:</p>
              <select
                value={selectedAccount}
                onChange={handleAccountChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select Account"
              >
                <option value="">Select Account</option>
                {accounts?.map((account) =>
                  account.bech32Address !== currentAddress ? (
                    <option
                      key={account.bech32Address}
                      value={account.bech32Address}
                    >
                      {account.bech32Address}
                    </option>
                  ) : null
                )}
              </select>
              <button
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                onClick={handleSubmit}
                disabled={!selectedAccount}
              >
                Switch Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSwitchModal;
