export const RUT_PERCENT = 50;          // check Skatteverket before launch
export const PLATFORM_FEE_PERCENT = 15; // your commission on the full price

// Assumes a RUT service's price is labour only (materials are not deductible)
export function priceBreakdown(grossSek, useRut) {
  const rutDeductionSek = useRut ? Math.round((grossSek * RUT_PERCENT) / 100) : 0;
  return {
    grossSek,
    rutDeductionSek,
    payAmountSek: grossSek - rutDeductionSek,
    feeSek: Math.round((grossSek * PLATFORM_FEE_PERCENT) / 100),
  };
}