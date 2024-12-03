interface WalletDetailsProps {
  balance: string;
  network: string | undefined;
  account: string | undefined;
}

const WalletDetails = ({ balance, network, account }: WalletDetailsProps) => (
  <div className="item">
    <div className="item-content">
      <div>
        <b>Network:</b> {network}
      </div>
      <div>
        <b>Account:</b> {account}
      </div>
      <div>
        <b>Usable Balance:</b> {balance}
      </div>
    </div>
  </div>
);

export default WalletDetails;
