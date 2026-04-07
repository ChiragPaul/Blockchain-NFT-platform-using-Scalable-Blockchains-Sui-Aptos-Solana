import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// Assuming the package ID of our deployed contract is known or from env.
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x_MINT_PACKAGE_ID';

type MintWidgetProps = {
  onMinted?: (nftId: string) => void;
};

export default function MintWidget({ onMinted }: MintWidgetProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;

    setLoading(true);
    try {
      const tx = new Transaction();
      
      // Argument types: name: vector<u8>, description: vector<u8>, url: vector<u8>
      tx.moveCall({
        target: `${PACKAGE_ID}::nft::mint_nft`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(url),
        ],
      });

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result: any) => {
            console.log('Minted successfully', result);
            let mintedNftId: string | null = null;

            try {
              const txn = await suiClient.getTransactionBlock({
                digest: result.digest,
                options: { showObjectChanges: true },
              });

              const createdNft = txn.objectChanges?.find(
                (change: any) =>
                  change.type === 'created' &&
                  typeof change.objectType === 'string' &&
                  change.objectType.includes(`${PACKAGE_ID}::nft::NFT`),
              ) as { objectId?: string } | undefined;

              mintedNftId = createdNft?.objectId ?? null;
            } catch (fetchError) {
              console.error('Unable to resolve minted NFT object from transaction:', fetchError);
            }

            alert(
              mintedNftId
                ? `NFT Minted! Ready to list: ${mintedNftId}`
                : 'NFT Minted! Check your wallet for the new object ID.',
            );

            if (mintedNftId) {
              onMinted?.(mintedNftId);
            }

            setName('');
            setDescription('');
            setUrl('');
          },
          onError: (error) => {
            console.error('Minting failed', error);
            alert('Failed to mint NFT. See console for details.');
          },
          onSettled: () => {
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="mint-container">
      <h2>Create New NFT</h2>
      <p className="subtitle" style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
        Mint your exclusive digital asset onto the Sui network.
      </p>

      <form onSubmit={handleMint}>
        <div className="input-group">
          <label>Name</label>
          <input 
            type="text" 
            className="form-input" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Cosmic Artifact #001"
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea 
            className="form-input" 
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT..."
          />
        </div>

        <div className="input-group">
          <label>Image URL (IPFS or HTTPS)</label>
          <input 
            type="url" 
            className="form-input" 
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {url && (
            <div style={{marginTop: '1rem', marginBottom: '1.5rem'}}>
              <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Preview:</p>
              <img src={url} alt="Preview" style={{width: '100%', maxWidth: '200px', borderRadius: '8px', objectFit: 'cover'}} 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
              />
            </div>
        )}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Minting to Blockchain...' : 'Mint NFT Asset'}
        </button>
      </form>
    </div>
  );
}
