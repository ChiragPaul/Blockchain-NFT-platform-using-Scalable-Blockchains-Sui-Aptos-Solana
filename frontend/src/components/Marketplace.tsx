import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x_PACKAGE_ID';
const MARKETPLACE_ID = import.meta.env.VITE_MARKETPLACE_ID || '0x_MARKETPLACE_ID';
// Usually you would fetch the user's loyalty object ID automatically via querying their owned objects, 
// for prototyping we simulate it via env or manual input
const LOYALTY_ID = import.meta.env.VITE_LOYALTY_ID || '0x_LOYALTY_ID';
const PLACEHOLDER_MARKETPLACE_ID = '0x_MARKETPLACE_ID';

type ListingCard = {
  listingId: string;
  nftId: string;
  priceMist: string;
  seller: string;
};

type OwnedNftCard = {
  objectId: string;
  name: string;
  description: string;
  url: string;
  owner: string;
};

function formatSui(mist: string) {
  return (Number(mist) / 1_000_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

function shortenAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function parseErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) return maybeMessage;

    const nestedMessage = (error as { cause?: { message?: string } }).cause?.message;
    if (nestedMessage) return nestedMessage;
  }

  return 'Unknown transaction error';
}

type MarketplaceProps = {
  recentMintedNftId?: string | null;
  onRecentMintHandled?: () => void;
};

export default function Marketplace({ recentMintedNftId, onRecentMintHandled }: MarketplaceProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [nftIdToBuy, setNftIdToBuy] = useState('');
  const [priceToBuy, setPriceToBuy] = useState('');
  const [buying, setBuying] = useState(false);

  const [nftIdToList, setNftIdToList] = useState('');
  const [priceToList, setPriceToList] = useState('');
  const [listing, setListing] = useState(false);

  useEffect(() => {
    if (!recentMintedNftId) return;
    setNftIdToList(recentMintedNftId);
    if (!priceToList) {
      setPriceToList('0.01');
    }
    onRecentMintHandled?.();
  }, [onRecentMintHandled, priceToList, recentMintedNftId]);

  const hasMarketplaceId = !!MARKETPLACE_ID && MARKETPLACE_ID !== PLACEHOLDER_MARKETPLACE_ID;

  const {
    data: ownedNftsResponse,
    isPending: ownedNftsPending,
    refetch: refetchOwnedNfts,
  } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address ?? '',
      filter: {
        StructType: `${PACKAGE_ID}::nft::NFT`,
      },
      options: { showContent: true },
    },
    {
      enabled: !!currentAccount?.address,
    },
  );

  const {
    data: dynamicFields,
    isPending: listingsPending,
    error: listingsError,
    refetch: refetchDynamicFields,
  } = useSuiClientQuery(
    'getDynamicFields',
    { parentId: MARKETPLACE_ID },
    { enabled: hasMarketplaceId },
  );

  const listingObjectIds =
    dynamicFields?.data
      ?.map((field: any) => field.objectId)
      .filter((id: string | undefined): id is string => Boolean(id)) ?? [];

  const {
    data: listingObjects,
    isPending: listingObjectsPending,
    refetch: refetchListingObjects,
  } = useSuiClientQuery(
    'multiGetObjects',
    {
      ids: listingObjectIds,
      options: { showContent: true },
    },
    {
      enabled: listingObjectIds.length > 0,
    },
  );

  const visibleListings: ListingCard[] =
    listingObjects
      ?.map((item: any) => {
        const fields = item?.data?.content?.fields;
        if (!fields?.nft_id || fields?.price == null || !fields?.seller) return null;

        return {
          listingId: item?.data?.objectId ?? '',
          nftId: String(fields.nft_id),
          priceMist: String(fields.price),
          seller: String(fields.seller),
        };
      })
      .filter((item: ListingCard | null): item is ListingCard => Boolean(item)) ?? [];

  const ownedNfts: OwnedNftCard[] =
    ownedNftsResponse?.data
      ?.map((item: any) => {
        const fields = item?.data?.content?.fields;
        const objectId = item?.data?.objectId;
        if (!fields || !objectId) return null;

        return {
          objectId,
          name: String(fields.name ?? 'Untitled NFT'),
          description: String(fields.description ?? ''),
          url: String(fields.url ?? ''),
          owner: String(fields.owner ?? ''),
        };
      })
      .filter((item: OwnedNftCard | null): item is OwnedNftCard => Boolean(item)) ?? [];

  const refreshListings = () => {
    refetchDynamicFields();
    if (listingObjectIds.length > 0) {
      refetchListingObjects();
    }
    if (currentAccount?.address) {
      refetchOwnedNfts();
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    setBuying(true);
    
    try {
      const tx = new Transaction();
      // Price in MIST
      const priceInMist = BigInt(parseFloat(priceToBuy) * 1_000_000_000);
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::buy_nft`,
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure.id(nftIdToBuy),
          payment,
          tx.object(LOYALTY_ID),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            alert('Purchase successful!');
            setNftIdToBuy('');
            setPriceToBuy('');
            refreshListings();
          },
          onError: (err) => {
            console.error(err);
            alert(`Purchase failed: ${parseErrorMessage(err)}`);
          },
          onSettled: () => setBuying(false)
        }
      );
    } catch(err) {
      console.error(err);
      setBuying(false);
    }
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    setListing(true);

    try {
      const tx = new Transaction();
      // Price in MIST
      const priceInMist = BigInt(parseFloat(priceToList) * 1_000_000_000);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list_nft`,
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.object(nftIdToList),
          tx.pure.u64(priceInMist),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            alert('Listing successful!');
            setNftIdToList('');
            setPriceToList('');
            refreshListings();
          },
          onError: (err) => {
            console.error(err);
            alert(`Listing failed: ${parseErrorMessage(err)}`);
          },
          onSettled: () => setListing(false)
        }
      );
    } catch(err) {
      console.error(err);
      setListing(false);
    }
  };

  return (
    <div className="marketplace-container" style={{animation: 'fadeIn 0.5s'}}>
      <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>Marketplace</h2>
      
      <div className="grid-container" style={{marginTop: '2rem'}}>
        {/* Buy Section */}
        <div className="nft-card" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.05)'}}>
          <h3 style={{color: 'var(--secondary)'}}>Buy NFT</h3>
          <p className="subtitle" style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
            Purchase an NFT and earn loyalty points (1 point per SUI).
          </p>
          <form onSubmit={handleBuy}>
            <div className="input-group">
              <label>Target NFT Object ID</label>
              <input type="text" className="form-input" required value={nftIdToBuy} onChange={e=>setNftIdToBuy(e.target.value)} placeholder="0x..." />
            </div>
            <div className="input-group">
              <label>Purchase Price (SUI)</label>
              <input type="number" step="0.001" className="form-input" required value={priceToBuy} onChange={e=>setPriceToBuy(e.target.value)} placeholder="0.00" />
            </div>
            <button type="submit" className="primary-btn" disabled={buying}>{buying ? 'Confirming...' : 'Buy Now'}</button>
          </form>
        </div>

        {/* List Section */}
        <div className="nft-card" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.05)'}}>
          <h3 style={{color: 'var(--primary)'}}>List NFT</h3>
          <p className="subtitle" style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
            Sell an NFT you own on the decentralized marketplace.
          </p>
          {recentMintedNftId && (
            <div style={{marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'rgba(34, 211, 238, 0.12)', border: '1px solid rgba(34, 211, 238, 0.25)'}}>
              <p style={{margin: 0, fontWeight: 700, color: 'var(--secondary)'}}>Freshly Minted NFT Ready</p>
              <p style={{margin: '0.35rem 0 0', color: 'var(--text-muted)', wordBreak: 'break-all'}}>
                {recentMintedNftId}
              </p>
            </div>
          )}
          <form onSubmit={handleList}>
            <div className="input-group">
              <label>Your NFT Object ID</label>
              <input type="text" className="form-input" required value={nftIdToList} onChange={e=>setNftIdToList(e.target.value)} placeholder="0x..." />
            </div>
            <div className="input-group">
              <label>Listing Price (SUI)</label>
              <input type="number" step="0.001" className="form-input" required value={priceToList} onChange={e=>setPriceToList(e.target.value)} placeholder="0.00" />
            </div>
            <button type="submit" className="primary-btn" disabled={listing} style={{backgroundImage: 'linear-gradient(135deg, var(--secondary), var(--primary))'}}>
              {listing ? 'Listing...' : 'List on Market'}
            </button>
          </form>
        </div>
      </div>

      <div className="nft-card" style={{padding: '1.5rem', marginTop: '2rem', background: 'rgba(255,255,255,0.04)'}}>
        <h3 style={{color: 'var(--primary)', marginBottom: '0.35rem'}}>Your NFTs</h3>
        <p className="subtitle" style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 0}}>
          NFTs currently owned by the connected wallet. Use one click to prefill the listing form.
        </p>

        {ownedNftsPending ? (
          <p style={{marginTop: '1.5rem', color: 'var(--text-muted)'}}>Loading your NFTs...</p>
        ) : ownedNfts.length === 0 ? (
          <p style={{marginTop: '1.5rem', color: 'var(--text-muted)'}}>
            No owned NFTs found for this wallet. Mint one first, or switch back to the wallet that owns the NFT.
          </p>
        ) : (
          <div className="grid-container" style={{marginTop: '1.5rem'}}>
            {ownedNfts.map((item) => (
              <div key={item.objectId} className="nft-card" style={{padding: '1.25rem', background: 'rgba(0,0,0,0.18)'}}>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{width: '88px', height: '88px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0}}
                    />
                  ) : (
                    <div style={{width: '88px', height: '88px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', flexShrink: 0}} />
                  )}
                  <div style={{minWidth: 0}}>
                    <p style={{margin: 0, fontWeight: 700}}>{item.name}</p>
                    <p style={{margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', wordBreak: 'break-all'}}>
                      {item.objectId}
                    </p>
                    {item.description && (
                      <p style={{margin: '0.6rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem'}}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  style={{marginTop: '1.25rem'}}
                  onClick={() => {
                    setNftIdToList(item.objectId);
                    if (!priceToList) {
                      setPriceToList('0.01');
                    }
                  }}
                >
                  List This NFT
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nft-card" style={{padding: '1.5rem', marginTop: '2rem', background: 'rgba(255,255,255,0.04)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <div>
            <h3 style={{color: 'var(--secondary)', marginBottom: '0.35rem'}}>View Listed NFTs</h3>
            <p className="subtitle" style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 0}}>
              Live listings loaded from the shared marketplace object on Sui.
            </p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={refreshListings}
            disabled={!hasMarketplaceId || listingsPending || listingObjectsPending}
            style={{maxWidth: '220px'}}
          >
            {listingsPending || listingObjectsPending ? 'Refreshing...' : 'Refresh Listings'}
          </button>
        </div>

        {!hasMarketplaceId ? (
          <p style={{marginTop: '1.5rem', color: '#ff8e8e'}}>
            Configure `VITE_MARKETPLACE_ID` to load marketplace listings.
          </p>
        ) : listingsError ? (
          <p style={{marginTop: '1.5rem', color: '#ff8e8e'}}>
            Could not load listings. Verify the marketplace object ID is correct.
          </p>
        ) : listingsPending || listingObjectsPending ? (
          <p style={{marginTop: '1.5rem', color: 'var(--text-muted)'}}>Loading current listings from testnet...</p>
        ) : visibleListings.length === 0 ? (
          <p style={{marginTop: '1.5rem', color: 'var(--text-muted)'}}>
            No active listings found yet. List an NFT above to see it appear here.
          </p>
        ) : (
          <div className="grid-container" style={{marginTop: '1.5rem'}}>
            {visibleListings.map((item) => (
              <div key={item.listingId} className="nft-card" style={{padding: '1.25rem', background: 'rgba(0,0,0,0.18)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start'}}>
                  <div>
                    <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      NFT
                    </p>
                    <p style={{margin: '0.35rem 0 0', fontWeight: 700, wordBreak: 'break-all'}}>{item.nftId}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Price
                    </p>
                    <p style={{margin: '0.35rem 0 0', color: 'var(--secondary)', fontWeight: 700, fontSize: '1.1rem'}}>
                      {formatSui(item.priceMist)} SUI
                    </p>
                  </div>
                </div>

                <p style={{margin: '1rem 0 0.25rem', color: 'var(--text-muted)', fontSize: '0.82rem'}}>Seller</p>
                <p style={{margin: 0, fontWeight: 600}}>{shortenAddress(item.seller)}</p>

                <button
                  type="button"
                  className="primary-btn"
                  style={{marginTop: '1.25rem'}}
                  onClick={() => {
                    setNftIdToBuy(item.nftId);
                    setPriceToBuy(formatSui(item.priceMist));
                  }}
                >
                  Use for Buy Form
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
