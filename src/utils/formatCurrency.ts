export function formatCurrency(amount: number | undefined | null, city?: string): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '—';
  }

  const c = (city || '').toLowerCase();

  if (c.includes('london') || c.includes('manchester') || c.includes('edinburgh') || c.includes('uk')) {
    return `£${amount.toLocaleString('en-GB')}`;
  }

  if (
    c.includes('paris') ||
    c.includes('berlin') ||
    c.includes('amsterdam') ||
    c.includes('madrid') ||
    c.includes('rome') ||
    c.includes('dublin') ||
    c.includes('lisbon') ||
    c.includes('munich') ||
    c.includes('vienna')
  ) {
    return `€${amount.toLocaleString('de-DE')}`;
  }

  if (c.includes('dubai') || c.includes('abu dhabi') || c.includes('sharjah') || c.includes('uae')) {
    return `AED ${amount.toLocaleString('en-AE')}`;
  }

  if (c.includes('tokyo') || c.includes('osaka') || c.includes('kyoto') || c.includes('japan')) {
    return `¥${amount.toLocaleString('ja-JP')}`;
  }

  if (c.includes('sydney') || c.includes('melbourne') || c.includes('brisbane') || c.includes('australia')) {
    return `A$${amount.toLocaleString('en-AU')}`;
  }

  if (
    c.includes('new york') ||
    c.includes('san francisco') ||
    c.includes('los angeles') ||
    c.includes('chicago') ||
    c.includes('miami') ||
    c.includes('seattle') ||
    c.includes('austin') ||
    c.includes('boston') ||
    c.includes('toronto') ||
    c.includes('vancouver') ||
    c.includes('usa')
  ) {
    return `$${amount.toLocaleString('en-US')}`;
  }

  if (
    c.includes('bangalore') ||
    c.includes('bengaluru') ||
    c.includes('mumbai') ||
    c.includes('delhi') ||
    c.includes('pune') ||
    c.includes('hyderabad') ||
    c.includes('chennai') ||
    c.includes('gurgaon') ||
    c.includes('noida') ||
    c.includes('india')
  ) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  if (amount < 10000) {
    return `$${amount.toLocaleString('en-US')}`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getCurrencySymbol(city?: string): string {
  const c = (city || '').toLowerCase();
  if (c.includes('london') || c.includes('manchester') || c.includes('uk')) return '£';
  if (c.includes('paris') || c.includes('berlin') || c.includes('amsterdam') || c.includes('rome')) return '€';
  if (c.includes('dubai') || c.includes('abu dhabi')) return 'AED ';
  if (c.includes('tokyo') || c.includes('osaka')) return '¥';
  if (c.includes('sydney') || c.includes('melbourne')) return 'A$';
  if (c.includes('new york') || c.includes('san francisco') || c.includes('chicago') || c.includes('usa')) return '$';
  if (c.includes('bangalore') || c.includes('mumbai') || c.includes('delhi') || c.includes('pune') || c.includes('india')) return '₹';
  return '$';
}
