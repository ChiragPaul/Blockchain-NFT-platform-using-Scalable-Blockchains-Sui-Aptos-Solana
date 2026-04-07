import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x_PACKAGE_ID';
const LOYALTY_ID = import.meta.env.VITE_LOYALTY_ID || '0x_LOYALTY_ID';

export default function LoyaltyDashboard() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [creating, setCreating] = useState(false);

  // Fetch the Loyalty object dynamically (in a real app we'd fetch owned objects of type Loyalty)
  const { data: loyaltyObj, isPending, error } = useSuiClientQuery('getObject', {
    id: LOYALTY_ID,
    options: { showContent: true }
  }, {
    enabled: !!LOYALTY_ID && LOYALTY_ID !== '0x_LOYALTY_ID',
  });

  const handleCreateProfile = async () => {
    if (!currentAccount) return;
    setCreating(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::loyalty::create_profile`,
        arguments: [],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => alert('Loyalty profile created! Check object ID from block explorer.'),
          onError: (err) => alert('Failed: ' + err),
          onSettled: () => setCreating(false)
        }
      );
    } catch(err) {
      console.error(err);
      setCreating(false);
    }
  };

  const content: any = loyaltyObj?.data?.content;
  const points = content?.fields?.points || 0;
  const tier = content?.fields?.tier || 1;

  return (
    <div className="loyalty-container" style={{animation: 'fadeIn 0.5s'}}>
      <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>Loyalty & Rewards Dashboard</h2>
      
      {!LOYALTY_ID || LOYALTY_ID === '0x_LOYALTY_ID' ? (
        <div style={{textAlign: 'center', margin: '4rem 0'}}>
          <p style={{color: 'var(--text-muted)'}}>
            You do not currently have a Loyalty profile configured in Environment vars. 
            <br/>If you haven't created one, create it below:
          </p>
          <button className="primary-btn" style={{maxWidth: '300px', margin: '2rem auto'}} onClick={handleCreateProfile} disabled={creating}>
            {creating ? 'Creating Profile...' : 'Initialize Loyalty Profile'}
          </button>
        </div>
      ) : isPending ? (
        <p style={{textAlign: 'center', padding: '3rem'}}>Loading loyalty data from Sui testnet...</p>
      ) : error ? (
        <p style={{textAlign: 'center', padding: '3rem', color: 'red'}}>Error loading profile. Ensure VITE_LOYALTY_ID is correct.</p>
      ) : (
        <div className="grid-container" style={{marginTop: '2rem'}}>
          <div className="nft-card" style={{padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)'}}>
            <h1 style={{fontSize: '5rem', color: 'var(--secondary)', margin: '1rem 0'}}>{points}</h1>
            <p style={{fontSize: '1.2rem', fontWeight: 600}}>Total Points Earned</p>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
              Points are earned automatically by buying NFTs on the marketplace.
            </p>
          </div>
          <div className="nft-card" style={{padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)'}}>
            <h1 style={{fontSize: '5rem', color: 'var(--primary)', margin: '1rem 0'}}>Tier {tier}</h1>
            <p style={{fontSize: '1.2rem', fontWeight: 600}}>Current VIP Status</p>
            {tier === 1 && <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Reach 101 points to upgrade to Tier 2!</p>}
            {tier === 2 && <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Reach 501 points to upgrade to VIP Tier 3!</p>}
            {tier === 3 && <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Max Tier reached. Excellent!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
