export type RatingType =
  | 'customer_vetc'
  | 'customer_driver'
  | 'customer_workshop'
  | 'rescue_customer'
  | 'vetc_rescue';

export interface RatingAttachment {
  name: string;
  url?: string;
}

export interface RatingVersion {
  id: string;
  version: number;
  targetLabel: string;
  ratedAt: string;
  stars: number;
  content: string;
  attachments: RatingAttachment[];
  category?: string;
  updatedBy?: string;
}

export const RATING_TYPE_LABELS: Record<RatingType, string> = {
  customer_vetc: 'Khách hàng đánh giá dịch vụ VETC',
  customer_driver: 'Khách hàng đánh giá Tài xế',
  customer_workshop: 'Khách hàng đánh giá xưởng dịch vụ',
  rescue_customer: 'Đơn vị cứu hộ đánh giá Khách hàng',
  vetc_rescue: 'VETC đánh giá đơn vị cứu hộ',
};
