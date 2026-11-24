import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Eye, Upload, X } from 'lucide-react';
import AppSelect from './AppSelect';
import {
  ADVANCE_BANKS,
  ADVANCE_PAYER_LABEL,
  ADVANCE_PAYER_OPTIONS,
  ADVANCE_REASONS,
  ADVANCE_STATUS_LABEL,
  ADVANCE_USERS,
  type AdvancePayer,
  type AdvancePurpose,
  cancelAdvanceRequest,
  confirmedAmount,
  createAdvanceRequest,
  getAdvanceRequestVersion,
  getAdvanceRequests,
  isAdvanceLocked,
  reasonById,
  remainingAdvanceCap,
  seedOrderAdvances,
  subscribeAdvanceRequests,
} from '../data/advanceRequestStore';

const REQUEST_TYPES: { value: AdvancePurpose; label: string }[] = [
  { value: 'refund_customer', label: 'Khách hàng' },
  { value: 'pay_supplier', label: 'NCC' },
];

type PhotoFile = { name: string; url: string };

type FieldErrors = Partial<Record<'advancer' | 'reason' | 'bank' | 'account' | 'holder' | 'amount', string>>;

const formatMoney = (value: number) => value.toLocaleString('en-US');

const parseMoney = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0;

const statusClass: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

interface AdvanceRequestSectionProps {
  orderId: string;
  refundAmount: number;
  supplierCost: number;
}

const AdvanceRequestSection: React.FC<AdvanceRequestSectionProps> = ({
  orderId,
  refundAmount,
  supplierCost,
}) => {
  useSyncExternalStore(subscribeAdvanceRequests, getAdvanceRequestVersion);
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [advancerName, setAdvancerName] = useState(ADVANCE_USERS[0].name);
  const [purpose, setPurpose] = useState<AdvancePurpose>('refund_customer');
  const [reimburseBy, setReimburseBy] = useState<AdvancePayer>('accountant');
  const [reasonId, setReasonId] = useState(ADVANCE_REASONS[0].id);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [attachment, setAttachment] = useState<PhotoFile | null>(null);
  const [cccdFront, setCccdFront] = useState<PhotoFile | null>(null);
  const [cccdBack, setCccdBack] = useState<PhotoFile | null>(null);
  const [preview, setPreview] = useState<PhotoFile | null>(null);

  useEffect(() => {
    seedOrderAdvances(orderId, refundAmount, supplierCost);
  }, [orderId, refundAmount, supplierCost]);

  const rows = getAdvanceRequests(orderId).filter((row) => row.status !== 'cancelled');
  const locked = isAdvanceLocked(orderId);
  const reasonOptions = ADVANCE_REASONS.filter((item) => item.purpose === purpose);
  const reason = reasonById(reasonId) ?? reasonOptions[0];
  const refundCap = remainingAdvanceCap(orderId, 'refund_customer', refundAmount, supplierCost);
  const supplierCap = remainingAdvanceCap(orderId, 'pay_supplier', refundAmount, supplierCost);
  const cap = purpose === 'refund_customer' ? refundCap : supplierCap;
  const requestedTotal = rows
    .filter((row) => row.status === 'pending')
    .reduce((sum, row) => sum + row.requestedAmount, 0);
  const advancedTotal =
    confirmedAmount(orderId, 'refund_customer') + confirmedAmount(orderId, 'pay_supplier');

  const closeModal = () => {
    setOpen(false);
    setFieldErrors({});
    setAmount('');
    setNote('');
    setPurpose('refund_customer');
    setReimburseBy('accountant');
    setReasonId(ADVANCE_REASONS[0].id);
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setAttachment(null);
    setCccdFront(null);
    setCccdBack(null);
  };

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const choosePurpose = (next: string) => {
    const value = next as AdvancePurpose;
    setPurpose(value);
    const first = ADVANCE_REASONS.find((item) => item.purpose === value);
    setReasonId(first?.id ?? '');
    clearFieldError('reason');
  };

  const handleCreate = () => {
    const requested = parseMoney(amount);
    const nextErrors: FieldErrors = {};
    if (!advancerName) nextErrors.advancer = 'Chọn người tạm ứng.';
    if (!reason || reason.purpose !== purpose) nextErrors.reason = 'Chọn lý do.';
    if (!bankName.trim()) nextErrors.bank = 'Chọn ngân hàng.';
    if (!accountNumber.trim()) nextErrors.account = 'Nhập số tài khoản.';
    if (!accountHolder.trim()) nextErrors.holder = 'Nhập tên chủ tài khoản.';
    if (requested <= 0) nextErrors.amount = 'Nhập số tiền lớn hơn 0.';
    else if (requested > cap) {
      nextErrors.amount =
        purpose === 'refund_customer'
          ? `Vượt phần tiền hoàn còn lại (${formatMoney(cap)}).`
          : `Vượt phần chi phí nhà cung cấp còn lại (${formatMoney(cap)}).`;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    createAdvanceRequest({
      orderId,
      advancerName,
      purpose,
      reimburseBy,
      reasonId,
      requestedAmount: requested,
      note: note.trim(),
      proofLabel: attachment?.name ?? '',
      proofUrl: attachment?.url ?? '',
      cccdFrontUrl: cccdFront?.url ?? '',
      cccdBackUrl: cccdBack?.url ?? '',
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    });
    closeModal();
  };

  const pendingCount = rows.filter((row) => row.status === 'pending').length;

  return (
    <div className="pt-4 border-t border-gray-100">
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
        <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full" />
        Tạm ứng
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <MoneyField
          label="Yêu cầu ứng tiền"
          value={requestedTotal}
          valueClass="text-gray-800"
          action={
            <button
              type="button"
              title="Tạo yêu cầu ứng tiền"
              disabled={locked}
              onClick={() => setOpen(true)}
              className={`shrink-0 bg-green-600 text-white px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap transition-all hover:bg-green-700 active:scale-95 ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Yêu cầu
            </button>
          }
          hint={
            locked
              ? 'Đã tạo đề nghị thanh toán'
              : pendingCount > 0
                ? `${pendingCount} yêu cầu đang chờ`
                : undefined
          }
        />
        <MoneyField
          label="Đã ứng tiền"
          value={advancedTotal}
          valueClass="text-blue-600"
          action={
            <button
              type="button"
              title="Danh sách đã ứng tiền"
              aria-expanded={listOpen}
              onClick={() => setListOpen((current) => !current)}
              className={`shrink-0 border px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap transition-all active:scale-95 ${listOpen ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'}`}
            >
              Danh sách
            </button>
          }
        />
      </div>

      {listOpen && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-[11px]">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase text-gray-400">
                <th className="py-2 pr-3">Người tạm ứng</th>
                <th className="py-2 pr-3">Loại yêu cầu</th>
                <th className="py-2 pr-3">Người hoàn ứng</th>
                <th className="py-2 pr-3">Lý do</th>
                <th className="py-2 pr-3 text-right">Số yêu cầu</th>
                <th className="py-2 pr-3 text-right">Số thực chi</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2 pr-3 whitespace-nowrap">Thời gian yêu cầu</th>
                <th className="py-2 pr-3 whitespace-nowrap">Thời gian cập nhật</th>
                <th className="py-2 pr-3">File đính kèm</th>
                <th className="py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-gray-400">Chưa có tạm ứng</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-bold text-gray-800">{row.advancerName}</td>
                  <td className="py-2 pr-3 text-gray-700">
                    {row.purpose === 'refund_customer' ? 'Khách hàng' : 'NCC'}
                  </td>
                  <td className="py-2 pr-3 text-gray-700">{ADVANCE_PAYER_LABEL[row.reimburseBy]}</td>
                  <td className="py-2 pr-3 text-gray-600">{reasonById(row.reasonId)?.label ?? row.note}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{formatMoney(row.requestedAmount)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {row.actualAmount == null ? '—' : formatMoney(row.actualAmount)}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass[row.status]}`}>
                      {ADVANCE_STATUS_LABEL[row.status]}
                    </span>
                    {row.rejectReason && <p className="mt-1 text-[10px] text-red-500">{row.rejectReason}</p>}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{row.createdAt || '—'}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{row.updatedAt || row.createdAt || '—'}</td>
                  <td className="py-2 pr-3">
                    {row.proofUrl || row.proofLabel ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreview({
                            name: row.proofLabel || 'File đính kèm',
                            url: row.proofUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
                          })
                        }
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        <Eye size={12} />
                        Xem
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {row.status === 'pending' && !locked && (
                      <button
                        type="button"
                        onClick={() => cancelAdvanceRequest(row.id)}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[min(90vh,860px)] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="text-sm font-bold text-gray-800">Tạo yêu cầu ứng tiền</h4>
              <button type="button" onClick={closeModal} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto p-4">
              <Field label="Người tạm ứng" required error={fieldErrors.advancer}>
                <AppSelect
                  value={advancerName}
                  onChange={(value) => {
                    setAdvancerName(value);
                    clearFieldError('advancer');
                  }}
                  options={ADVANCE_USERS.map((user) => ({
                    value: user.name,
                    label: `${user.name} · Số dư ${formatMoney(user.balance)}`,
                  }))}
                  placeholder="Chọn người tạm ứng"
                  searchable
                  searchPlaceholder="Tìm người tạm ứng"
                  className={selectClass(Boolean(fieldErrors.advancer))}
                />
              </Field>
              <Field label="Loại yêu cầu" required>
                <AppSelect
                  value={purpose}
                  onChange={choosePurpose}
                  options={REQUEST_TYPES}
                  placeholder="Chọn loại yêu cầu"
                  className="h-[34px] px-3 text-xs"
                />
              </Field>
              <Field label="Người hoàn ứng" required>
                <AppSelect
                  value={reimburseBy}
                  onChange={(value) => setReimburseBy(value as AdvancePayer)}
                  options={ADVANCE_PAYER_OPTIONS}
                  placeholder="Chọn người hoàn ứng"
                  className="h-[34px] px-3 text-xs"
                />
              </Field>
              <Field label="Lý do" required error={fieldErrors.reason}>
                <AppSelect
                  value={reasonId}
                  onChange={(value) => {
                    setReasonId(value);
                    clearFieldError('reason');
                  }}
                  options={reasonOptions.map((item) => ({ value: item.id, label: item.label }))}
                  placeholder="Chọn lý do"
                  searchable
                  searchPlaceholder="Tìm lý do"
                  className={selectClass(Boolean(fieldErrors.reason))}
                />
                <p className="mt-1 text-[10px] font-medium text-gray-500">Còn lại {formatMoney(cap)}</p>
              </Field>
              <Field label="Tài khoản ngân hàng" required error={fieldErrors.bank}>
                <AppSelect
                  value={bankName}
                  onChange={(value) => {
                    setBankName(value);
                    clearFieldError('bank');
                  }}
                  options={ADVANCE_BANKS.map((bank) => ({ value: bank, label: bank }))}
                  placeholder="Chọn ngân hàng"
                  searchable
                  searchPlaceholder="Tìm ngân hàng"
                  className={selectClass(Boolean(fieldErrors.bank))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Số tài khoản" required error={fieldErrors.account}>
                  <input
                    value={accountNumber}
                    onChange={(event) => {
                      setAccountNumber(event.target.value);
                      clearFieldError('account');
                    }}
                    placeholder="Nhập số tài khoản"
                    className={inputClass(Boolean(fieldErrors.account))}
                  />
                </Field>
                <Field label="Tên chủ tài khoản" required error={fieldErrors.holder}>
                  <input
                    value={accountHolder}
                    onChange={(event) => {
                      setAccountHolder(event.target.value);
                      clearFieldError('holder');
                    }}
                    placeholder="Nhập tên chủ tài khoản"
                    className={inputClass(Boolean(fieldErrors.holder))}
                  />
                </Field>
              </div>
              <Field label="QR chuyển khoản">
                <PhotoSlot value={attachment} onChange={setAttachment} onPreview={setPreview} />
              </Field>
              <Field label="CCCD">
                <div className="grid grid-cols-2 gap-3">
                  <PhotoSlot label="Mặt trước" value={cccdFront} onChange={setCccdFront} onPreview={setPreview} />
                  <PhotoSlot label="Mặt sau" value={cccdBack} onChange={setCccdBack} onPreview={setPreview} />
                </div>
              </Field>
              <Field label="Số tiền" required error={fieldErrors.amount}>
                <input
                  value={amount}
                  onChange={(event) => {
                    setAmount(formatMoney(parseMoney(event.target.value)));
                    clearFieldError('amount');
                  }}
                  inputMode="numeric"
                  placeholder="0"
                  className={`${inputClass(Boolean(fieldErrors.amount))} text-right font-bold`}
                />
              </Field>
              <Field label="Ghi chú">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  placeholder="Nhập ghi chú"
                  className={`${fieldInput} resize-none`}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button type="button" onClick={closeModal} className="rounded px-3 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-100">
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded bg-vetc-green px-4 py-1.5 text-[11px] font-bold text-white hover:bg-green-700"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
              <span className="truncate text-xs font-bold text-gray-700">{preview.name}</span>
              <button type="button" onClick={() => setPreview(null)} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center justify-center overflow-auto p-3">
              <img src={preview.url} alt={preview.name} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MoneyField: React.FC<{
  label: string;
  value: number;
  valueClass?: string;
  action?: React.ReactNode;
  hint?: string;
}> = ({ label, value, valueClass = 'text-gray-800', action, hint }) => (
  <div className="min-w-0">
    <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center">{label}</label>
    <div className={action ? 'flex gap-2' : undefined}>
      <input
        readOnly
        value={formatMoney(value)}
        className={`w-full border rounded px-3 py-1.5 text-xs text-right font-bold outline-none bg-gray-50 border-gray-100 ${action ? 'flex-1 min-w-0' : ''} ${valueClass}`}
      />
      {action}
    </div>
    {hint && <p className="text-[9px] text-amber-600 font-medium mt-1">{hint}</p>}
  </div>
);

const fieldInput =
  'w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green transition-all bg-white placeholder:text-gray-400';

const selectClass = (invalid: boolean) =>
  `h-[34px] px-3 text-xs ${invalid ? 'border-red-500 focus:border-red-500' : ''}`;

const inputClass = (invalid: boolean) =>
  `${fieldInput} ${invalid ? 'border-red-500 focus:border-red-500' : ''}`;

const PhotoSlot: React.FC<{
  label?: string;
  value: PhotoFile | null;
  onChange: (file: PhotoFile | null) => void;
  onPreview: (file: PhotoFile) => void;
}> = ({ label, value, onChange, onPreview }) => (
  <div className="min-w-0">
    {label && <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">{label}</p>}
    <label className="inline-flex h-[34px] cursor-pointer items-center gap-2 rounded border border-dashed border-gray-300 px-3 text-xs font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green">
      <Upload size={14} />
      {value ? 'Đổi ảnh' : 'Tải ảnh'}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onChange({ name: file.name, url: URL.createObjectURL(file) });
          event.target.value = '';
        }}
      />
    </label>
    {value && (
      <button
        type="button"
        onClick={() => onPreview(value)}
        className="mt-2 block overflow-hidden rounded border border-gray-200 bg-gray-50"
      >
        <img src={value.url} alt={value.name} className="h-28 w-full max-w-[180px] object-cover" />
      </button>
    )}
  </div>
);

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="min-w-0">
    <label className={`text-[11px] font-bold uppercase mb-1 flex items-center ${error ? 'text-red-500' : 'text-gray-600'}`}>
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-[10px] font-medium text-red-500">{error}</p>}
  </div>
);

export default AdvanceRequestSection;
