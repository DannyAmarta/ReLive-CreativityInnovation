export const formatIDR = (n: number) =>
  "IDR " + new Intl.NumberFormat("id-ID").format(Math.round(n));

export const formatUSDC = (n: number) => `$${n.toFixed(2)} USDC`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
