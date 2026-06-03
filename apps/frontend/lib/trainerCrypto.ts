import type { TrainerProfileRecord } from "./marketplace";

export type TrainerCryptoReadiness = {
  missingWalletAddress: boolean;
  missingPayoutMintAddress: boolean;
  cryptoPricedServiceCount: number;
  cryptoReadyServiceCount: number;
  activeCryptoServicesMissingMint: Array<{
    id: number;
    title: string;
  }>;
  checklist: Array<{
    id: string;
    label: string;
    complete: boolean;
  }>;
  isReady: boolean;
};

export function getTrainerCryptoReadiness(
  profile: TrainerProfileRecord | null,
): TrainerCryptoReadiness {
  const services = profile?.services ?? [];
  const activeServices = services.filter((service) => service.isActive);
  const activeCryptoServices = activeServices.filter(
    (service) => typeof service.priceInLamports === "number" && service.priceInLamports > 0,
  );
  const activeCryptoServicesMissingMint = activeCryptoServices
    .filter((service) => !service.tokenMintAddress)
    .map((service) => ({ id: service.id, title: service.title }));
  const cryptoReadyServiceCount = activeCryptoServices.filter(
    (service) => Boolean(service.tokenMintAddress),
  ).length;

  const missingWalletAddress = !profile?.user?.walletAddress;
  const missingPayoutMintAddress = !profile?.payoutMintAddress;

  const checklist = [
    {
      id: "wallet",
      label: "Trainer wallet address added",
      complete: !missingWalletAddress,
    },
    {
      id: "mint",
      label: "Default payout token mint configured",
      complete: !missingPayoutMintAddress,
    },
    {
      id: "service",
      label: "At least one active service is crypto-ready",
      complete: cryptoReadyServiceCount > 0,
    },
  ];

  return {
    missingWalletAddress,
    missingPayoutMintAddress,
    cryptoPricedServiceCount: activeCryptoServices.length,
    cryptoReadyServiceCount,
    activeCryptoServicesMissingMint,
    checklist,
    isReady:
      !missingWalletAddress &&
      !missingPayoutMintAddress &&
      cryptoReadyServiceCount > 0 &&
      activeCryptoServicesMissingMint.length === 0,
  };
}

export function getTrainerCryptoWarningCopy(readiness: TrainerCryptoReadiness) {
  const missing: string[] = [];

  if (readiness.missingWalletAddress) missing.push("wallet address");
  if (readiness.missingPayoutMintAddress) missing.push("default token mint");
  if (readiness.activeCryptoServicesMissingMint.length > 0) missing.push("service token mint");
  if (readiness.cryptoReadyServiceCount === 0) missing.push("a crypto-ready active service");

  return missing;
}
