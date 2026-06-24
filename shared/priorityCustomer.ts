/** Danh sách SĐT khách hàng ưu tiên (mock / cấu hình nghiệp vụ) */
export const PRIORITY_CUSTOMER_PHONES = [
  '0967419411',
  '0909888777',
];

export const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) return `0${digits.slice(2)}`;
  if (digits.startsWith('0')) return digits;
  return digits;
};

export const isPriorityCustomerPhone = (phone?: string | null): boolean => {
  if (!phone?.trim()) return false;
  const normalized = normalizePhone(phone);
  return PRIORITY_CUSTOMER_PHONES.some((p) => normalizePhone(p) === normalized);
};
