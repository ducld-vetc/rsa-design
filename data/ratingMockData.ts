import { RatingType, RatingVersion, RATING_TYPE_LABELS } from '../shared/ratingTypes';

const makeVersion = (
  type: RatingType,
  version: number,
  stars: number,
  content: string,
  ratedAt: string,
  attachments: RatingVersion['attachments'] = [],
  category = 'Bình thường',
  updatedBy = 'CSKH — Nguyễn Thị Lan'
): RatingVersion => ({
  id: `${type}-v${version}`,
  version,
  targetLabel: RATING_TYPE_LABELS[type],
  ratedAt,
  stars,
  content,
  attachments,
  category,
  updatedBy,
});

/**
 * Demo tất cả trường hợp trên màn Chi tiết đơn hàng › Giám sát & Thực thi:
 * 1. customer_vetc       → Chưa đánh giá (mảng rỗng)
 * 2. customer_driver     → Có sao, không nội dung / file (1 version tối thiểu)
 * 3. customer_workshop   → 1 version đầy đủ (sao + nội dung + file)
 * 4. rescue_customer     → Nhiều version (v1 → v2)
 * 5. vetc_rescue         → Nhiều version + nhiều file đính kèm (v1 → v3)
 */
export const INITIAL_RATING_HISTORIES: Record<RatingType, RatingVersion[]> = {
  customer_vetc: [],

  customer_driver: [
    makeVersion('customer_driver', 1, 4, '', '20/06/2026 10:00'),
  ],

  customer_workshop: [
    {
      ...makeVersion(
        'customer_workshop',
        1,
        3,
        'Xưởng tiếp nhận xe đúng hẹn, nhân viên tư vấn rõ ràng.',
        '19/06/2026 15:30',
        [{ name: 'bien-ban-tiep-nhan.pdf' }],
        'Góp ý nhẹ'
      ),
      targetLabel: 'Carpla Service Thái Bình',
    },
  ],

  rescue_customer: [
    makeVersion('rescue_customer', 1, 3, 'Khách hàng cung cấp thông tin chưa đầy đủ lúc đầu.', '14/06/2026 11:00'),
    makeVersion(
      'rescue_customer',
      2,
      5,
      'Khách hàng hợp tác tốt sau khi được hướng dẫn thêm.',
      '18/06/2026 17:00',
      [{ name: 'xac-nhan-khach-hang.pdf' }]
    ),
  ],

  vetc_rescue: [
    makeVersion('vetc_rescue', 1, 2, 'Đơn vị cứu hộ đến trễ 20 phút so với cam kết.', '15/06/2026 09:00'),
    makeVersion(
      'vetc_rescue',
      2,
      3,
      'Đã cải thiện thời gian phản hồi nhưng báo cáo chưa đầy đủ.',
      '19/06/2026 14:00',
      [{ name: 'bien-ban-nghiem-thu.pdf' }]
    ),
    makeVersion(
      'vetc_rescue',
      3,
      4,
      'Quy trình báo cáo đầy đủ, thái độ chuyên nghiệp.',
      '22/06/2026 09:45',
      [
        { name: 'bien-ban-nghiem-thu.pdf' },
        { name: 'anh-hien-truong.jpg', url: 'https://picsum.photos/id/1071/400/300' },
      ],
      'Đúng giờ, chuyên nghiệp'
    ),
  ],
};

export const RATING_DEMO_CASES: { type: RatingType; label: string }[] = [
  { type: 'customer_vetc', label: 'Chưa đánh giá' },
  { type: 'customer_driver', label: 'Có sao, chưa có nội dung / file' },
  { type: 'customer_workshop', label: '1 version đầy đủ' },
  { type: 'rescue_customer', label: 'Nhiều version (v2)' },
  { type: 'vetc_rescue', label: 'Nhiều version + file (v3)' },
];
