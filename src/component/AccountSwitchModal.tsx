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
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="close" onClick={onClose}>
            <span>&times;</span>
          </div>
          <h2>Account Switch</h2>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading accounts...</p>
            </div>
          ) : accounts && accounts.length === 0 ? (
            <p>No accounts found. Please create or add an account.</p>
          ) : accounts && accounts.length === 1 ? (
            <p>You only have one account. No need to switch.</p>
          ) : (
            <>
              <p>Select an account to switch:</p>
              <select
                style={{ marginBottom: '15px' }}
                value={selectedAccount}
                onChange={handleAccountChange}
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
                className="asi-button"
                onClick={handleSubmit}
                disabled={!selectedAccount}
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

export default AccountSwitchModal;
