import { defaultShippingPlanContent, type ShippingPlanContent, type ShippingPlanRow } from "@/lib/admin/website";

export type ShippingLocation = {
  country: string;
  province: string;
  region: string;
  address: string;
  postalCode: string;
};

const productWeightByCode: Record<string, number> = {
  "OW-EVE-014": 2.2,
  "OW-WED-001": 3.1,
  "OW-RTW-008": 2.6,
  "OW-EVE-031": 1.4,
  "OW-RTW-022": 2.8,
  "OW-WED-012": 0.6,
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseWeightKg(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return value;
}

export function getProductWeightKg(code: string) {
  return parseWeightKg(productWeightByCode[code]);
}

export function calculateCartWeightKg(items: Array<{ code: string; quantity: number }>) {
  return items.reduce((total, item) => {
    return total + getProductWeightKg(item.code) * Math.max(1, Math.floor(item.quantity));
  }, 0);
}

export function findShippingRateRow(location: ShippingLocation, shippingPlan: ShippingPlanContent = defaultShippingPlanContent): ShippingPlanRow | null {
  const country = normalize(location.country);
  const province = normalize(location.province);
  const region = normalize(location.region);

  const rows = shippingPlan.rows.map((row) => ({
    ...row,
    country: normalize(row.country),
    province: normalize(row.province),
    region: normalize(row.region),
  }));

  if (country === "usa") {
    const usRow = rows.find((row) => row.country === "usa");
    return usRow ? shippingPlan.rows[rows.indexOf(usRow)] : null;
  }

  const provinceSpecificRows = rows.filter((row) => row.country === country && row.province === province);
  if (provinceSpecificRows.length === 0) {
    return null;
  }

  const regionSpecificRow = provinceSpecificRows.find((row) => row.region === region && row.region.length > 0);
  if (regionSpecificRow) {
    return shippingPlan.rows[rows.indexOf(regionSpecificRow)];
  }

  const genericProvinceRow = provinceSpecificRows.find((row) => row.region.length === 0);
  return genericProvinceRow ? shippingPlan.rows[rows.indexOf(genericProvinceRow)] : shippingPlan.rows[rows.indexOf(provinceSpecificRows[0])];
}

export function estimateShippingCostCents(
  totalWeightKg: number,
  location: ShippingLocation,
  shippingPlan: ShippingPlanContent = defaultShippingPlanContent,
) {
  const rateRow = findShippingRateRow(location, shippingPlan);
  if (!rateRow) {
    return null;
  }

  const baseRateCents = Math.round(Number(rateRow.twoKg) * 100);
  const additionalRateCents = Math.round(Number(rateRow.additionalOneKg) * 100);

  if (!Number.isFinite(baseRateCents) || !Number.isFinite(additionalRateCents)) {
    return null;
  }

  const safeWeightKg = Math.max(0, totalWeightKg);
  if (safeWeightKg <= 2) {
    return baseRateCents;
  }

  const additionalKg = Math.ceil(safeWeightKg - 2);
  return baseRateCents + additionalKg * additionalRateCents;
}

export function formatShippingLocation(location: ShippingLocation) {
  return [location.address, location.region, location.province, location.country, location.postalCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
