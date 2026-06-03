import React from 'react';
import { AlertCircle, Calendar, CheckCircle2, MessageSquare, Save, X } from 'lucide-react';
import { useTascoCrm } from './TascoCrmContext';
import {
  CONTACT_REASONS,
  CONTACT_RESULTS,
  CONTACT_SLA_DAYS_AFTER_EXIT,
  DANH_GIA_OPTIONS,
  GIAO_XE_OPTIONS,
  LIEN_LAC_OPTIONS,
  RATING_OPTIONS,
  canEditContactAttempt,
  daysSinceVehicleExit,
  validateContactAttempt,
} from './tascoLogic';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-vetc-green text-white px-3 py-1.5 rounded-t-lg text-xs font-bold">{children}</div>
);

/** Panel đánh giá — mở từ màn Báo cáo (Detail / double-click) */
const CustomerEvaluationPanel: React.FC = () => {
  const {
    evaluation,
    updateEvaluation,
    updateContact,
    updateCriterion,
    saveEvaluation,
    saveMessage,
    clearSaveMessage,
    closeEvaluationPanel,
    selectedRow,
  } = useTascoCrm();

  if (!evaluation) return null;

  const daysSinceExit = daysSinceVehicleExit(evaluation.ngayXeRa);
  const slaWarning =
    !evaluation.contacts[0]?.date && daysSinceExit > CONTACT_SLA_DAYS_AFTER_EXIT;

  const handleSave = () => {
    clearSaveMessage();
    const result = saveEvaluation();
    if (result.ok) {
      setTimeout(() => closeEvaluationPanel(), 800);
    }
  };

  const contactErrors = evaluation.contacts.flatMap((c) => validateContactAttempt(c));

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-vetc-green text-white px-4 py-3 flex items-start justify-between gap-3 shadow">
        <div>
          <p className="text-[10px] uppercase opacity-80 tracking-wide">Chức năng trên báo cáo</p>
          <h2 className="font-bold text-sm">Đánh giá khách hàng sau sửa chữa</h2>
          <p className="text-[11px] opacity-90 mt-0.5">
            R/O {evaluation.soRO} · {evaluation.bienSo} · {evaluation.cvdv}
          </p>
        </div>
        <button
          type="button"
          onClick={closeEvaluationPanel}
          className="p-1.5 rounded hover:bg-white/20 shrink-0"
          aria-label="Đóng"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {saveMessage && (
          <div
            className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs border ${
              saveMessage.startsWith('Đã lưu')
                ? 'bg-green-50 border-green-200 text-vetc-green'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {saveMessage.startsWith('Đã lưu') ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span>{saveMessage}</span>
          </div>
        )}

        {slaWarning && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertCircle size={16} />
            Tasco: Xe ra {evaluation.ngayXeRa} — đã {daysSinceExit} ngày chưa ghi nhận Call 1 (ngưỡng{' '}
            {CONTACT_SLA_DAYS_AFTER_EXIT} ngày).
          </div>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionTitle>Thông tin khách hàng & xe</SectionTitle>
          <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white text-xs">
            <div className="space-y-2">
              <label className="block text-gray-500">Khách hàng</label>
              <input readOnly value={evaluation.khachHang} className="w-full border rounded px-2 py-1.5 bg-gray-50" />
              <label className="block text-gray-500">Địa chỉ</label>
              <input readOnly value={evaluation.diaChi} className="w-full border rounded px-2 py-1.5 bg-gray-50" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500">Người LH</label>
                  <input
                    value={evaluation.nguoiLienHe}
                    onChange={(e) => updateEvaluation({ nguoiLienHe: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 focus:border-vetc-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500">Điện thoại</label>
                  <input
                    value={evaluation.dienThoai}
                    onChange={(e) => updateEvaluation({ dienThoai: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 focus:border-vetc-green outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-500">Loại xe</label>
              <input readOnly value={evaluation.loaiXe} className="w-full border rounded px-2 py-1.5 bg-gray-50" />
              <label className="block text-gray-500 text-red-600 font-semibold">Số khung</label>
              <input
                readOnly
                value={evaluation.soKhung}
                className="w-full border border-red-200 rounded px-2 py-1.5 text-red-600 font-semibold bg-red-50/30"
              />
              <label className="block text-gray-500 text-red-600 font-semibold">Biển số</label>
              <input
                readOnly
                value={evaluation.bienSo}
                className="w-full border border-red-200 rounded px-2 py-1.5 text-red-600 font-semibold bg-red-50/30"
              />
              <label className="block text-gray-500 text-blue-700 font-semibold">Số R/O</label>
              <input
                readOnly
                value={evaluation.soRO}
                className="w-full border border-blue-200 rounded px-2 py-1.5 text-blue-800 font-semibold bg-blue-50/30"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-500">Liên lạc</label>
              <select
                value={evaluation.lienLac}
                onChange={(e) => updateEvaluation({ lienLac: e.target.value })}
                className="w-full border rounded px-2 py-1.5 focus:border-vetc-green outline-none"
              >
                {LIEN_LAC_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <label className="block text-gray-500">Đánh giá tổng thể</label>
              <select
                value={evaluation.danhGia}
                onChange={(e) => updateEvaluation({ danhGia: e.target.value })}
                className="w-full border rounded px-2 py-1.5 focus:border-vetc-green outline-none"
              >
                {DANH_GIA_OPTIONS.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {o || '— Chọn —'}
                  </option>
                ))}
              </select>
              <label className="block text-gray-500">Giao xe</label>
              <select
                value={evaluation.giaoXe}
                onChange={(e) => updateEvaluation({ giaoXe: e.target.value })}
                className="w-full border rounded px-2 py-1.5 focus:border-vetc-green outline-none"
              >
                {GIAO_XE_OPTIONS.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {o || '— Chọn —'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionTitle>Nhật ký liên hệ (tối đa 3 lần)</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-green-50 text-vetc-green">
                  <th className="border-b border-green-100 px-2 py-2 w-10">#</th>
                  <th className="border-b border-green-100 px-2 py-2 w-28">Ngày</th>
                  <th className="border-b border-green-100 px-2 py-2 w-20">Giờ</th>
                  <th className="border-b border-green-100 px-2 py-2 w-36">Kết quả</th>
                  <th className="border-b border-green-100 px-2 py-2 w-32">Lý do</th>
                  <th className="border-b border-green-100 px-2 py-2">Diễn giải</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.contacts.map((c) => {
                  const editable = canEditContactAttempt(evaluation.contacts, c.attemptNo);
                  return (
                    <tr key={c.attemptNo} className={!editable ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="border-b border-gray-100 px-2 py-2 text-center font-bold text-vetc-green">
                        {c.attemptNo}
                      </td>
                      <td className="border-b border-gray-100 px-1 py-1">
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          disabled={!editable}
                          value={c.date}
                          onChange={(e) => updateContact(c.attemptNo, { date: e.target.value })}
                          className="w-full border rounded px-1.5 py-1 disabled:bg-gray-100 focus:border-vetc-green outline-none"
                        />
                      </td>
                      <td className="border-b border-gray-100 px-1 py-1">
                        <input
                          type="text"
                          placeholder="HH:mm"
                          disabled={!editable}
                          value={c.time}
                          onChange={(e) => updateContact(c.attemptNo, { time: e.target.value })}
                          className="w-full border rounded px-1.5 py-1 disabled:bg-gray-100 focus:border-vetc-green outline-none"
                        />
                      </td>
                      <td className="border-b border-gray-100 px-1 py-1">
                        <select
                          disabled={!editable}
                          value={c.result}
                          onChange={(e) =>
                            updateContact(c.attemptNo, { result: e.target.value as typeof c.result })
                          }
                          className="w-full border rounded px-1 py-1 disabled:bg-gray-100 focus:border-vetc-green outline-none"
                        >
                          <option value="">—</option>
                          {CONTACT_RESULTS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-b border-gray-100 px-1 py-1">
                        <select
                          disabled={!editable || c.result !== 'L/H Thành công'}
                          value={c.reason}
                          onChange={(e) =>
                            updateContact(c.attemptNo, { reason: e.target.value as typeof c.reason })
                          }
                          className="w-full border rounded px-1 py-1 disabled:bg-gray-100 focus:border-vetc-green outline-none"
                        >
                          <option value="">—</option>
                          {CONTACT_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-b border-gray-100 px-1 py-1">
                        <input
                          type="text"
                          disabled={!editable}
                          value={c.note}
                          onChange={(e) => updateContact(c.attemptNo, { note: e.target.value })}
                          className="w-full border rounded px-1.5 py-1 disabled:bg-gray-100 focus:border-vetc-green outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionTitle>Tiêu chí đánh giá chi tiết</SectionTitle>
          <table className="w-full text-xs">
            <tbody>
              {evaluation.criteria.map((c) => (
                <tr key={c.code} className="border-b border-gray-100">
                  <td className="w-10 text-center font-bold text-vetc-green py-2">{c.code}</td>
                  <td className="px-2 py-2 w-64 text-gray-700">{c.label}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <select
                        value={c.rating}
                        onChange={(e) => updateCriterion(c.code, { rating: e.target.value })}
                        className="w-28 border rounded px-2 py-1 focus:border-vetc-green outline-none"
                      >
                        <option value="">—</option>
                        {RATING_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={c.note}
                        onChange={(e) => updateCriterion(c.code, { note: e.target.value })}
                        placeholder="Ghi chú"
                        className="flex-1 border rounded px-2 py-1 focus:border-vetc-green outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contactErrors.length > 0 && (
          <p className="text-[11px] text-amber-700">{contactErrors.join(' · ')}</p>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 flex flex-wrap gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button type="button" className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-xs">
          <MessageSquare size={14} />
          Sms
        </button>
        <button type="button" className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-xs">
          <Calendar size={14} />
          Lịch sử
        </button>
        <button
          type="button"
          className="px-3 py-2 border border-red-300 text-red-700 bg-red-50 rounded text-xs font-semibold"
        >
          Khiếu nại
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={closeEvaluationPanel}
          className="px-4 py-2 border border-gray-200 rounded text-xs hover:bg-gray-50"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 px-5 py-2 bg-vetc-green text-white rounded font-bold text-xs hover:bg-green-700"
        >
          <Save size={14} />
          Lưu
        </button>
      </div>

      {selectedRow && (
        <p className="text-[10px] text-center text-gray-400 pb-2">
          Dòng báo cáo #{selectedRow.stt} — {selectedRow.bienKiemSoat}
        </p>
      )}
    </div>
  );
};

export default CustomerEvaluationPanel;
