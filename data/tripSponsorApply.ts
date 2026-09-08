import type { ServiceCategory } from './rescueServiceMockData';
import type { FixedSponsorRule, SponsorType } from './rescuePackageMockData';

/** Quỹ chung cứu hộ + cẩu kéo khi hình thức FIXED. */
export const DEFAULT_RESCUE_TOW_SPONSOR_FIXED = 1_500_000;
/** Quỹ từng dịch vụ sửa chữa khi hình thức FIXED. */
export const DEFAULT_REPAIR_SPONSOR_FIXED = 300_000;

export interface TripSponsorConfig {
  sponsorType: SponsorType;
  /** RATE: một % chung cho mọi loại dịch vụ được bảo lãnh. */
  rateSponsorValue: number;
  /** RATE: trần VND chung trên một đơn. Copy từ package_purchase.sponsor_max. */
  sponsorMax?: number | null;
  /** FIXED: các dòng cấu hình. Không chọn dịch vụ = quỹ chung cho nhóm. */
  fixedSponsorRules: FixedSponsorRule[];
}

/** Snapshot lúc kích hoạt. Mỗi dòng FIXED là một quỹ remain riêng. */
export interface TripSponsorRemain {
  ruleRemains: { index: number; remain: number }[];
}

export interface TripOrderServiceLine {
  serviceId: number;
  category: ServiceCategory | '';
  fee: number;
}

export interface TripOrderSponsorLineResult {
  serviceId: number;
  fee: number;
  sponsorPay: number;
  customerPay: number;
}

const clampRate = (value: number) => Math.min(100, Math.max(0, value));

const matchRuleIndex = (rules: FixedSponsorRule[], line: TripOrderServiceLine): number => {
  if (line.category === 'RESCUE_TERM' || line.category === '') return -1;
  const specific = rules.findIndex((rule) => rule.serviceId != null && rule.serviceId === line.serviceId);
  if (specific >= 0) return specific;
  return rules.findIndex(
    (rule) => rule.serviceId == null && rule.categories.includes(line.category as FixedSponsorRule['categories'][number]),
  );
};

/** Khởi tạo số dư quỹ lúc kích hoạt. Không đọc lại catalog lúc tạo đơn. */
export const snapshotTripSponsorRemain = (config: TripSponsorConfig): TripSponsorRemain => {
  if (config.sponsorType !== 'FIXED') return { ruleRemains: [] };
  return {
    ruleRemains: config.fixedSponsorRules.map((rule, index) => ({
      index,
      remain: rule.amount,
    })),
  };
};

/**
 * Áp bảo lãnh TRIP vào các dòng dịch vụ của một đơn.
 * FIXED: dòng không chọn dịch vụ trừ một quỹ chung; có chọn dịch vụ thì trừ quỹ của đúng dịch vụ đó.
 * RATE: một % chung, không vượt `sponsorMax` trên một đơn; không trừ quỹ FIXED.
 */
export const applyTripSponsorToOrderLines = (
  config: TripSponsorConfig,
  remain: TripSponsorRemain,
  lines: TripOrderServiceLine[],
): { lines: TripOrderSponsorLineResult[]; remain: TripSponsorRemain } => {
  const nextRemain: TripSponsorRemain = {
    ruleRemains: (remain.ruleRemains ?? []).map((row) => ({ ...row })),
  };

  const rateCap =
    config.sponsorType === 'RATE' && config.sponsorMax != null && Number.isFinite(config.sponsorMax)
      ? Math.max(0, config.sponsorMax)
      : null;
  let rateRemain = rateCap;

  const results = lines.map((line) => {
    const fee = Number.isFinite(line.fee) ? Math.max(0, line.fee) : 0;
    let sponsorPay = 0;

    if (line.category === 'RESCUE_TERM' || line.category === '') {
      sponsorPay = 0;
    } else if (config.sponsorType === 'RATE') {
      sponsorPay = Math.round((fee * clampRate(config.rateSponsorValue)) / 100);
      if (rateRemain != null) {
        sponsorPay = Math.min(sponsorPay, rateRemain);
        rateRemain -= sponsorPay;
      }
    } else {
      const ruleIndex = matchRuleIndex(config.fixedSponsorRules, line);
      const bucket = nextRemain.ruleRemains.find((row) => row.index === ruleIndex);
      const pool = bucket?.remain ?? 0;
      sponsorPay = Math.min(fee, pool);
      if (bucket) bucket.remain = pool - sponsorPay;
    }

    sponsorPay = Math.min(sponsorPay, fee);
    return {
      serviceId: line.serviceId,
      fee,
      sponsorPay,
      customerPay: fee - sponsorPay,
    };
  });

  return { lines: results, remain: nextRemain };
};
