export function money(pence: number, opts: { decimals?: boolean } = {}): string {
  const pounds = pence / 100;
  const decimals = opts.decimals ?? pounds % 1 !== 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(pounds);
}

/** Compact form for headline figures: £75,000 rather than £75,000.00. */
export function moneyShort(pence: number): string {
  return money(pence, { decimals: false });
}

export function dateLong(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function dateTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Gift Aid adds 25p per eligible pound. */
export function giftAidBonus(pence: number): number {
  return Math.round(pence * 0.25);
}
