export function formatCurrency(
    amount: number,
    options: Intl.NumberFormatOptions = {}
): string {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const formatter = new Intl.NumberFormat("bn-BD", {
        maximumFractionDigits: 0,
        ...options,
    });
    return `৳${formatter.format(safeAmount)}`;
}

export function isFreePrice(value: number | null | undefined): boolean {
    return !value || value <= 0;
}
