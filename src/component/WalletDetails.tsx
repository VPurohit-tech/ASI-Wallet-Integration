import React from 'react';

type WalletDetailsProps = {
  balance: string;
  network: string | undefined;
  account: string | undefined;
};

const WalletDetails: React.FC<WalletDetailsProps> = ({
  balance,
  network,
  account,
}) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-hidden">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Network:</span>
        <span className="text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap">
          {network}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Account:</span>
        <span className="text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap">
          {account}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Usable Balance:</span>
        <span className="text-gray-600">{balance}</span>
      </div>
    </div>
  </div>
);

export default WalletDetails;
