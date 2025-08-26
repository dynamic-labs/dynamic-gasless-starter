"use client";

import { useDynamicContext } from "@/lib/dynamic";
import { useMintTokens } from "@/lib/use-mint-tokens";

interface MintTokensProps {
  className: string;
  onTransactionStart: () => void;
  onTransactionSuccess: () => void;
  onTransactionEnd: () => void;
}

export function MintTokens({
  className,
  onTransactionStart,
  onTransactionSuccess,
  onTransactionEnd,
}: MintTokensProps) {
  const { mintTokens, isPending } = useMintTokens();
  const { network } = useDynamicContext();

  const handleClick = async () => {
    if (isPending) return;
    if (!network) return;

    try {
      onTransactionStart();
      await mintTokens({ amountDollars: 100, network });
      onTransactionSuccess();
    } catch (err) {
      onTransactionEnd();
    }
  };

  return (
    <button
      className={className}
      disabled={isPending || !network}
      onClick={handleClick}
    >
      <div className="typography-button__content">
        <span className="typography typography--button-primary typography--primary">
          {isPending ? "Minting..." : !network ? "Loading..." : "Claim USDC"}
        </span>
      </div>
    </button>
  );
}
