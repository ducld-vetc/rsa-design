export type ActionLogGroup =
  | 'lifecycle'
  | 'incident'
  | 'dispatch'
  | 'fee'
  | 'payment'
  | 'file'
  | 'invoice';

export type ActionLogDiff = {
  field: string;
  before: string;
  after: string;
};

export type ActionLogEntry = {
  id: string;
  at: string;
  actor: string;
  channel: string;
  group: ActionLogGroup;
  code: string;
  title: string;
  cause: string;
  diffs: ActionLogDiff[];
  minStage: number;
  onlyWhenCancelled?: boolean;
};

export const ACTION_LOG_GROUPS: { id: 'all' | ActionLogGroup; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'lifecycle', label: 'Vòng đời' },
  { id: 'incident', label: 'Sự cố & xe' },
  { id: 'dispatch', label: 'Điều phối' },
  { id: 'fee', label: 'Phí' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'file', label: 'Hồ sơ' },
  { id: 'invoice', label: 'Hóa đơn' },
];

export function actionLogStage(statusId: string): { stage: number; cancelled: boolean } {
  if (statusId === 'FINISH-CANCELLED') return { stage: 2, cancelled: true };
  if (statusId === 'WAITING_CONFIRM' || statusId === 'RECEIVE-NEW') return { stage: 1, cancelled: false };
  if (statusId === 'CONFIRMED' || statusId === 'RECEIVE-PROCESSING') return { stage: 2, cancelled: false };
  if (statusId === 'DISPATCH-SEARCHING' || statusId === 'WAITING_PROVIDER_ACCEPT') return { stage: 3, cancelled: false };
  if (statusId === 'DISPATCH-ASSIGNED' || statusId === 'WAITING_DRIVER_ACCEPT') return { stage: 4, cancelled: false };
  if (statusId === 'EXECUTE-MOVING') return { stage: 5, cancelled: false };
  if (statusId === 'EXECUTE-ARRIVED' || statusId === 'EXECUTE-RESCUING') return { stage: 6, cancelled: false };
  if (statusId === 'FINISH-COMPLETED') return { stage: 8, cancelled: false };
  return { stage: 1, cancelled: false };
}

type LogContext = {
  customerName: string;
  plate: string;
  address: string;
  serviceName: string;
};

export function buildRescueOrderActionLog(statusId: string, ctx: LogContext): ActionLogEntry[] {
  const customer = ctx.customerName || 'Khách hàng';
  const plate = ctx.plate || '—';
  const address = ctx.address || '—';
  const service = ctx.serviceName || 'Kéo xe';
  const { stage, cancelled } = actionLogStage(statusId);

  const entries: ActionLogEntry[] = [
    {
      id: 'created',
      at: '02/02/2026 13:30',
      actor: customer,
      channel: 'App khách',
      group: 'lifecycle',
      code: 'ORDER_CREATED',
      title: 'Tạo đơn cứu hộ',
      cause: 'Khách tạo yêu cầu trên app',
      diffs: [
        { field: 'Trạng thái', before: '—', after: 'Nháp' },
        { field: 'Nguồn', before: '—', after: 'App khách' },
        { field: 'Biển số', before: '—', after: plate },
      ],
      minStage: 1,
    },
    {
      id: 'package',
      at: '02/02/2026 13:31',
      actor: customer,
      channel: 'App khách',
      group: 'incident',
      code: 'PACKAGE_UPDATED',
      title: 'Gắn gói cứu hộ',
      cause: 'Khách chọn gói đang hiệu lực',
      diffs: [{ field: 'Gói', before: 'Không có', after: 'Gói cơ bản 10 dịch vụ' }],
      minStage: 1,
    },
    {
      id: 'location',
      at: '02/02/2026 13:32',
      actor: customer,
      channel: 'App khách',
      group: 'incident',
      code: 'INCIDENT_LOCATION_UPDATED',
      title: 'Cập nhật điểm sự cố',
      cause: 'Khách chọn vị trí trên bản đồ',
      diffs: [
        { field: 'Địa chỉ', before: '—', after: address },
        { field: 'Loại vị trí', before: '—', after: 'Đô thị' },
      ],
      minStage: 1,
    },
    {
      id: 'service',
      at: '02/02/2026 13:33',
      actor: customer,
      channel: 'App khách',
      group: 'fee',
      code: 'SERVICE_CHANGED',
      title: 'Chọn dịch vụ',
      cause: 'Khách chọn dịch vụ theo gói',
      diffs: [{ field: 'Dịch vụ', before: '—', after: service }],
      minStage: 1,
    },
    {
      id: 'desc',
      at: '02/02/2026 13:34',
      actor: customer,
      channel: 'App khách',
      group: 'incident',
      code: 'INCIDENT_UPDATED',
      title: 'Ghi mô tả sự cố',
      cause: 'Khách nhập tình trạng xe',
      diffs: [{ field: 'Mô tả', before: '—', after: 'Xe không nổ được máy' }],
      minStage: 1,
    },
    {
      id: 'photos',
      at: '02/02/2026 13:35',
      actor: customer,
      channel: 'App khách',
      group: 'file',
      code: 'FILE_ADDED',
      title: 'Thêm ảnh hiện trường',
      cause: 'Khách tải ảnh lúc tạo đơn',
      diffs: [{ field: 'Ảnh hiện trường', before: '0', after: '3 ảnh' }],
      minStage: 1,
    },
    {
      id: 'qr',
      at: '02/02/2026 13:36',
      actor: 'Hệ thống',
      channel: 'Cổng thanh toán',
      group: 'payment',
      code: 'DEPOSIT_QR_ISSUED',
      title: 'Tạo QR cọc',
      cause: 'Khách chọn thanh toán QR',
      diffs: [
        { field: 'Số cọc', before: '—', after: '200.000 đ' },
        { field: 'Giao dịch', before: '—', after: 'Chờ thanh toán' },
      ],
      minStage: 1,
    },
    {
      id: 'paid',
      at: '02/02/2026 13:40',
      actor: customer,
      channel: 'Cổng thanh toán',
      group: 'payment',
      code: 'DEPOSIT_PAID',
      title: 'Thanh toán cọc đủ',
      cause: 'Cổng thanh toán báo đã thu đủ',
      diffs: [
        { field: 'Đã thu', before: '0 đ', after: '200.000 đ' },
        { field: 'Còn lại cọc', before: '200.000 đ', after: '0 đ' },
      ],
      minStage: 1,
    },
    {
      id: 'waiting',
      at: '02/02/2026 13:41',
      actor: 'Hệ thống',
      channel: 'Hệ thống',
      group: 'lifecycle',
      code: 'ORDER_CONFIRMED',
      title: 'Đưa đơn vào chờ xác nhận',
      cause: 'Cọc đủ, đơn rời trạng thái nháp',
      diffs: [
        { field: 'Trạng thái', before: 'Nháp', after: 'Chờ xác nhận' },
        { field: 'Thanh toán', before: 'Chờ thanh toán', after: 'Đã cọc tiền' },
      ],
      minStage: 1,
    },
    {
      id: 'osa-confirm',
      at: '02/02/2026 13:46',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'lifecycle',
      code: 'OSA_CONFIRMED',
      title: 'Tổng đài xác nhận đơn',
      cause: 'OSA xác nhận yêu cầu',
      diffs: [{ field: 'Trạng thái', before: 'Chờ xác nhận', after: 'Đã xác nhận' }],
      minStage: 2,
    },
    {
      id: 'contact',
      at: '02/02/2026 13:48',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'incident',
      code: 'INCIDENT_UPDATED',
      title: 'Sửa người liên hệ',
      cause: 'OSA cập nhật SĐT liên hệ tại hiện trường',
      diffs: [{ field: 'SĐT liên hệ', before: '0909888777', after: '0912345678' }],
      minStage: 2,
    },
    {
      id: 'ask-customer',
      at: '02/02/2026 13:49',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'incident',
      code: 'CUSTOMER_UPDATE_REQUESTED',
      title: 'Yêu cầu khách cập nhật',
      cause: 'OSA gửi yêu cầu bổ sung vị trí và ảnh',
      diffs: [{ field: 'Chờ khách', before: 'Không', after: 'Đang chờ' }],
      minStage: 2,
    },
    {
      id: 'customer-update',
      at: '02/02/2026 13:55',
      actor: customer,
      channel: 'Webview',
      group: 'incident',
      code: 'CUSTOMER_UPDATE_SUBMITTED',
      title: 'Khách gửi bản cập nhật',
      cause: 'Khách hoàn tất trên link chia sẻ vị trí',
      diffs: [
        { field: 'Địa chỉ', before: address, after: `${address} (cập nhật GPS)` },
        { field: 'Ảnh hiện trường', before: '3 ảnh', after: '4 ảnh' },
      ],
      minStage: 2,
    },
    {
      id: 'guarantee',
      at: '02/02/2026 13:57',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'fee',
      code: 'GUARANTEE_UPDATED',
      title: 'Cập nhật bảo lãnh',
      cause: 'OSA ghi nhận bảo lãnh theo doanh nghiệp',
      diffs: [
        { field: 'Bảo lãnh', before: 'Không', after: 'Có' },
        { field: 'Tỷ lệ', before: '—', after: '100%' },
      ],
      minStage: 2,
    },
    {
      id: 'dispatch',
      at: '02/02/2026 14:02',
      actor: 'Hệ thống',
      channel: 'Portal',
      group: 'dispatch',
      code: 'SENT_TO_PROVIDER',
      title: 'Gửi nhà cung cấp',
      cause: 'Điều phối tự động chọn trạm gần nhất',
      diffs: [
        { field: 'Trạng thái', before: 'Đã xác nhận', after: 'Chờ NCC' },
        { field: 'Đối tác', before: '—', after: 'CARPLA - CARPLA SERVICE' },
        { field: 'Trạm', before: '—', after: 'Carpla Service - CN Hà Nội' },
      ],
      minStage: 3,
    },
    {
      id: 'provider-ok',
      at: '02/02/2026 14:06',
      actor: 'Điều phối Carpla',
      channel: 'App đối tác',
      group: 'dispatch',
      code: 'PROVIDER_ACCEPTED',
      title: 'Nhà cung cấp nhận đơn',
      cause: 'Đối tác xác nhận nhận cứu hộ',
      diffs: [{ field: 'Trạng thái', before: 'Chờ NCC', after: 'Đã gán trạm' }],
      minStage: 4,
    },
    {
      id: 'driver',
      at: '02/02/2026 14:08',
      actor: 'Điều phối Carpla',
      channel: 'App đối tác',
      group: 'dispatch',
      code: 'SENT_TO_DRIVER',
      title: 'Gán tài xế',
      cause: 'Nhà cung cấp chỉ định tài xế và xe',
      diffs: [
        { field: 'Tài xế', before: '—', after: 'Nguyễn Văn Tài' },
        { field: 'Biển xe cứu hộ', before: '—', after: '29C-123.45' },
        { field: 'Trạng thái', before: 'Đã gán trạm', after: 'Chờ tài xế' },
      ],
      minStage: 4,
    },
    {
      id: 'resource',
      at: '02/02/2026 14:12',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'dispatch',
      code: 'RESOURCE_CHANGED',
      title: 'Đổi nguồn lực',
      cause: 'Khoảng cách quá xa',
      diffs: [
        { field: 'Trạm', before: 'Carpla Service - CN Hà Nội', after: 'Cứu hộ 116 Hà Nội' },
        { field: 'Tài xế', before: 'Nguyễn Văn Tài', after: 'Trần Quốc Huy' },
        { field: 'Biển xe cứu hộ', before: '29C-123.45', after: '30H-678.90' },
      ],
      minStage: 4,
    },
    {
      id: 'driver-go',
      at: '02/02/2026 14:15',
      actor: 'Trần Quốc Huy',
      channel: 'App tài xế',
      group: 'lifecycle',
      code: 'DRIVER_ACCEPTED',
      title: 'Tài xế nhận đơn',
      cause: 'Tài xế bấm nhận và xuất phát',
      diffs: [{ field: 'Trạng thái', before: 'Chờ tài xế', after: 'Đang di chuyển' }],
      minStage: 5,
    },
    {
      id: 'arrived',
      at: '02/02/2026 14:42',
      actor: 'Trần Quốc Huy',
      channel: 'App tài xế',
      group: 'lifecycle',
      code: 'DRIVER_ARRIVED',
      title: 'Đã đến hiện trường',
      cause: 'Tài xế báo đã tới điểm sự cố',
      diffs: [{ field: 'Trạng thái', before: 'Đang di chuyển', after: 'Đang cứu hộ' }],
      minStage: 6,
    },
    {
      id: 'exec-photo',
      at: '02/02/2026 14:44',
      actor: 'Trần Quốc Huy',
      channel: 'App tài xế',
      group: 'file',
      code: 'FILE_ADDED',
      title: 'Thêm ảnh quá trình',
      cause: 'Tài xế chụp hiện trường khi bắt đầu xử lý',
      diffs: [{ field: 'Ảnh thực hiện', before: '0', after: '2 ảnh' }],
      minStage: 6,
    },
    {
      id: 'fee',
      at: '02/02/2026 14:50',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'fee',
      code: 'FEE_RECALCULATED',
      title: 'Tính lại phí',
      cause: 'Đổi mức nguy hiểm và khoảng cách thực tế',
      diffs: [
        { field: 'Mức nguy hiểm', before: 'Mức 1', after: 'Mức 2' },
        { field: 'Khoảng cách', before: '8 km', after: '11 km' },
        { field: 'Phí khách', before: '450.000 đ', after: '620.000 đ' },
      ],
      minStage: 6,
    },
    {
      id: 'tow',
      at: '02/02/2026 15:05',
      actor: 'Trần Quốc Huy',
      channel: 'App tài xế',
      group: 'lifecycle',
      code: 'TOW_STARTED',
      title: 'Bắt đầu kéo xe',
      cause: 'Tài xế bắt đầu kéo về điểm đích',
      diffs: [
        { field: 'Trạng thái', before: 'Đang cứu hộ', after: 'Đang kéo xe' },
        { field: 'Điểm kéo', before: '—', after: 'Xưởng Carpla Cầu Giấy' },
      ],
      minStage: 7,
    },
    {
      id: 'driver-done',
      at: '02/02/2026 15:40',
      actor: 'Trần Quốc Huy',
      channel: 'App tài xế',
      group: 'lifecycle',
      code: 'DRIVER_COMPLETED',
      title: 'Tài xế hoàn thành',
      cause: 'Tài xế báo đã xử lý xong',
      diffs: [{ field: 'Trạng thái', before: 'Đang kéo xe', after: 'Tài xế hoàn thành' }],
      minStage: 7,
    },
    {
      id: 'final-paid',
      at: '02/02/2026 15:55',
      actor: customer,
      channel: 'Cổng thanh toán',
      group: 'payment',
      code: 'FINAL_PAID',
      title: 'Thanh toán phần còn lại',
      cause: 'Khách thanh toán đủ số còn lại',
      diffs: [
        { field: 'Đã thu', before: '200.000 đ', after: '620.000 đ' },
        { field: 'Còn lại', before: '420.000 đ', after: '0 đ' },
      ],
      minStage: 8,
    },
    {
      id: 'closed',
      at: '02/02/2026 16:02',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'lifecycle',
      code: 'OSA_CLOSED',
      title: 'Đóng đơn',
      cause: 'OSA xác nhận hoàn thành',
      diffs: [{ field: 'Trạng thái', before: 'Tài xế hoàn thành', after: 'Hoàn thành' }],
      minStage: 8,
    },
    {
      id: 'invoice',
      at: '02/02/2026 16:05',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'invoice',
      code: 'INVOICE_EXPORTED',
      title: 'Xuất hóa đơn',
      cause: 'OSA xuất hóa đơn điện tử',
      diffs: [{ field: 'Hóa đơn', before: 'Chưa xuất', after: 'Đã xuất' }],
      minStage: 8,
    },
    {
      id: 'rating',
      at: '02/02/2026 16:20',
      actor: customer,
      channel: 'App khách',
      group: 'file',
      code: 'RATING_SAVED',
      title: 'Lưu đánh giá',
      cause: 'Khách đánh giá tài xế',
      diffs: [{ field: 'Đánh giá tài xế', before: '—', after: '5 sao' }],
      minStage: 8,
    },
    {
      id: 'cancel',
      at: '02/02/2026 14:10',
      actor: 'rsa_test1',
      channel: 'Portal',
      group: 'lifecycle',
      code: 'ORDER_CANCELLED',
      title: 'Hủy đơn',
      cause: 'Khách không còn cần dịch vụ',
      diffs: [{ field: 'Trạng thái', before: 'Đã xác nhận', after: 'Hủy đơn' }],
      minStage: 2,
      onlyWhenCancelled: true,
    },
  ];

  return entries
    .filter((entry) => {
      if (entry.onlyWhenCancelled) return cancelled;
      if (cancelled && entry.minStage > 2) return false;
      if (entry.minStage === 7) return stage >= 8;
      return entry.minStage <= stage;
    })
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}
