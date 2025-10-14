export function formatMoney(value: number | string | null | undefined): string {
  const num = Number(value) || 0;
  return num.toFixed(2);
}