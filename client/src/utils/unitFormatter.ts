/**
 * Cleanly formats cart item quantity and unit.
 * Examples:
 * - 1 of '1 kg' -> '1 kg'
 * - 2 of '1 kg' -> '2 kg'
 * - 1 of '1 pc' -> '1 pc'
 * - 2 of '1 pc' -> '2 pcs'
 * - 1 of '1 pack' -> '1 pack'
 * - 2 of '1 pack' -> '2 packs'
 * - 1 of '1 bunch' -> '1 bunch'
 * - 2 of '1 bunch' -> '2 bunches'
 * - 1 of '1 box' -> '1 box'
 * - 2 of '1 box' -> '2 boxes'
 * - 1 of '1 L' -> '1 L'
 * - 2 of '1 L' -> '2 L'
 * - 1 of '500 g' -> '500 g'
 * - 2 of '500 g' -> '2 × 500 g'
 * - 1 of '6 pcs' -> '6 pcs'
 * - 2 of '6 pcs' -> '2 × 6 pcs'
 */
export function formatCartItemQuantity(quantity: number, unit?: string): string {
  if (!unit) return `${quantity}`;
  const trimmed = unit.trim();

  // If unit begins with "1 " (like "1 kg", "1 pc", "1 pack", "1 bunch", "1 box", "1 L")
  const match = trimmed.match(/^1\s+([a-zA-Z]+)$/);
  if (match) {
    const rawUnit = match[1];
    if (quantity === 1) {
      return `1 ${rawUnit}`;
    }
    const lower = rawUnit.toLowerCase();
    if (lower === 'pc') return `${quantity} pcs`;
    if (lower === 'pack') return `${quantity} packs`;
    if (lower === 'bunch') return `${quantity} bunches`;
    if (lower === 'box') return `${quantity} boxes`;
    return `${quantity} ${rawUnit}`;
  }

  if (quantity === 1) {
    return trimmed;
  }
  return `${quantity} × ${trimmed}`;
}

/**
 * Strips leading '1 ' from units when displaying with per-unit price labels like "/kg" or "/pc"
 * e.g., '1 kg' -> 'kg', '1 pc' -> 'pc', '1 pack' -> 'pack', '500 g' -> '500 g', '6 pcs' -> '6 pcs'
 */
export function formatPerUnitLabel(unit?: string): string {
  if (!unit) return 'kg';
  const trimmed = unit.trim();
  const match = trimmed.match(/^1\s+([a-zA-Z]+)$/);
  if (match) {
    return match[1];
  }
  return trimmed;
}
