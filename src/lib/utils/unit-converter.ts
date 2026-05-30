type ConversionKey = `${string}_to_${string}`

const CONVERSIONS: Record<ConversionKey, number> = {
  // Energy
  TJ_to_GJ:   1000,
  GJ_to_TJ:   0.001,
  GJ_to_MWh:  277.778,
  MWh_to_GJ:  0.0036,
  TJ_to_MWh:  277778,
  MWh_to_TJ:  0.0000036,
  // Volume (water)
  KL_to_ML:   0.001,
  ML_to_KL:   1000,
  // Mass (same unit aliases)
  MT_to_MT:   1,
  T_to_MT:    0.001,
  MT_to_T:    1000,
  // GHG (already in tCO2e — no conversion needed between same units)
  tCO2e_to_tCO2e: 1,
}

export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value
  const key = `${fromUnit}_to_${toUnit}` as ConversionKey
  const factor = CONVERSIONS[key]
  if (factor === undefined) {
    console.warn(`No conversion defined: ${fromUnit} → ${toUnit}`)
    return value
  }
  return value * factor
}

export function formatWithUnit(value: number, unit: string): string {
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(4).replace(/\.?0+$/, '')
  return `${formatted} ${unit}`
}
