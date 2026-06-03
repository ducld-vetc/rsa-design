import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Phone,
  PhoneOff,
  RefreshCw,
  Search,
} from 'lucide-react';
import CrmPreviewShell from './CrmPreviewShell';
import CustomerEvaluationPanel from './CustomerEvaluationPanel';
import { useTascoCrm } from './TascoCrmContext';
import { REPORT_DATE_FROM, REPORT_DATE_TO, type ServiceVehicleRow } from './mockData';
import {
  CONTACT_SLA_DAYS_AFTER_EXIT,
  ContactFilterTab,
  STATUS_LABELS,
  countByStatus,
  getTascoContactStatus,
  isContactOverdue,
} from './tascoLogic';

type ColumnKey = keyof ServiceVehicleRow | 'stt' | 'trangThai';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: ServiceVehicleRow) => React.ReactNode;
}

const FILTER_TABS: { id: ContactFilterTab; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'CHUA_LIEN_HE', label: 'Chưa liên hệ' },
  { id: 'CAN_GOI_LAI', label: 'Cần gọi lại' },
  { id: 'THANH_CONG', label: 'Đã hài lòng' },
  { id: 'QUA_HAN', label: `Quá hạn SLA (>${CONTACT_SLA_DAYS_AFTER_EXIT} ngày)` },
];

const columns: ColumnDef[] = [
  { key: 'stt', label: '#', width: '36px', align: 'center' },
  {
    key: 'trangThai',
    label: 'Trạng thái Tasco',
    width: '130px',
    render: (r) => {
      const s = getTascoContactStatus(r);
      const cfg = STATUS_LABELS[s];
      return (
        <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-semibold ${cfg.className}`}>
          {cfg.label}
        </span>
      );
    },
  },
  { key: 'ngayVao', label: 'Ngày vào', width: '88px' },
  { key: 'bienKiemSoat', label: 'Biển kiểm soát', width: '96px' },
  { key: 'soRO', label: 'Số R/O', width: '110px' },
  { key: 'tenKhachHang', label: 'Tên khách hàng', width: '180px' },
  { key: 'ngayXeRa', label: 'Ngày xe ra', width: '88px' },
  { key: 'call1', label: 'Call 1', width: '88px' },
  { key: 'call2', label: 'Call 2', width: '88px' },
  { key: 'call3', label: 'Call 3', width: '88px' },
  { key: 'ketQuaLienHe', label: 'Kết quả LH', width: '120px' },
  { key: 'lyDoLienHe', label: 'Lý do', width: '110px' },
  { key: 'cvdv', label: 'CVDV', width: '110px' },
  { key: 'nguoiChamSoc', label: 'Người CS', width: '120px' },
  { key: 'danhGiaKH', label: 'Đánh giá KH', width: '90px' },
  { key: 'ghiChuLan1', label: 'Ghi chú lần 1', width: '200px' },
];

const cellValue = (row: ServiceVehicleRow, key: ColumnKey): React.ReactNode => {
  if (key === 'stt') return row.stt;
  const col = columns.find((c) => c.key === key);
  if (col?.render) return col.render(row);
  if (key === 'trangThai') return null;
  const v = row[key as keyof ServiceVehicleRow];
  return v === '' || v == null ? '' : String(v);
};

const ServiceVehicleReportPreview: React.FC = () => {
  const {
    rows,
    totalRecords,
    selectedRow,
    selectRow,
    contactFilter,
    setContactFilter,
    plateFilter,
    setPlateFilter,
    filteredRows,
    evaluationPanelOpen,
    openEvaluationForRow,
    openEvaluationForSelected,
    closeEvaluationPanel,
  } = useTascoCrm();

  const stats = useMemo(() => countByStatus(rows), [rows]);

  const title = 'Báo cáo chi tiết xe dịch vụ';
  const subtitle = `Từ ngày ${REPORT_DATE_FROM} đến ngày ${REPORT_DATE_TO} · Tổng ${totalRecords} bản ghi`;

  const toolbar = (
    <>
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs hover:border-vetc-green hover:text-vetc-green"
      >
        <RefreshCw size={14} />
        Refresh
      </button>
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs hover:border-vetc-green hover:text-vetc-green"
      >
        <FileSpreadsheet size={14} className="text-vetc-green" />
        Export Excel
      </button>
      <button
        type="button"
        onClick={openEvaluationForSelected}
        disabled={!selectedRow}
        className="flex items-center gap-1 px-3 py-1.5 bg-vetc-green text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Search size={14} />
        Đánh giá KH
      </button>
    </>
  );

  return (
    <CrmPreviewShell
      title={title}
      subtitle={subtitle}
      toolbar={toolbar}
      evaluationOpen={evaluationPanelOpen}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-2 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-vetc-green shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Đã hài lòng</p>
              <p className="font-bold text-vetc-green">{stats.HOAN_THANH}</p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 flex items-center gap-2">
            <Phone size={18} className="text-amber-700 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Cần gọi lại</p>
              <p className="font-bold text-amber-800">{stats.CAN_GOI_LAI}</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 flex items-center gap-2">
            <PhoneOff size={18} className="text-gray-500 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Chưa liên hệ</p>
              <p className="font-bold text-gray-700">{stats.CHUA_LIEN_HE}</p>
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Quá hạn SLA</p>
              <p className="font-bold text-red-700">{stats.QUA_HAN}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setContactFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                contactFilter === tab.id
                  ? 'bg-vetc-green text-white border-vetc-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <input
            type="text"
            value={plateFilter}
            onChange={(e) => setPlateFilter(e.target.value)}
            placeholder="Lọc biển số / Số R/O"
            className="ml-auto border border-gray-200 rounded px-3 py-1 text-xs w-40 focus:border-vetc-green focus:outline-none"
          />
        </div>

        <p className="text-[11px] text-gray-500">
          Hiển thị <strong>{filteredRows.length}</strong> / {rows.length} dòng mẫu · Double-click hoặc Detail để mở đánh giá
        </p>

        <div className="overflow-auto custom-scrollbar max-h-[420px] border border-gray-200 rounded-lg">
          <table className="border-collapse text-[11px] min-w-max w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-green-50 text-vetc-green">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border-b border-green-200 px-2 py-2 font-semibold whitespace-nowrap text-left"
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const selected = selectedRow?.stt === row.stt;
                const overdue = isContactOverdue(row);
                return (
                  <tr
                    key={row.stt}
                    onClick={() => selectRow(row.stt)}
                    onDoubleClick={() => openEvaluationForRow(row.stt)}
                    className={`cursor-pointer transition-colors ${
                      selected
                        ? 'bg-vetc-green text-white'
                        : overdue
                          ? 'bg-red-50 hover:bg-red-100'
                          : 'hover:bg-green-50 even:bg-gray-50/50'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`border-b border-gray-100 px-2 py-1 whitespace-nowrap max-w-[220px] truncate ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                        }`}
                        title={
                          typeof cellValue(row, col.key) === 'string'
                            ? (cellValue(row, col.key) as string)
                            : undefined
                        }
                      >
                        {selected && col.key === 'trangThai' ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-semibold">
                            {STATUS_LABELS[getTascoContactStatus(row)].label}
                          </span>
                        ) : (
                          cellValue(row, col.key)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedRow && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-xs">
            <span>
              <strong>R/O:</strong> {selectedRow.soRO} · <strong>{selectedRow.tenKhachHang}</strong> ·{' '}
              {selectedRow.bienKiemSoat}
            </span>
            <button
              type="button"
              onClick={() => openEvaluationForRow(selectedRow.stt)}
              className="px-4 py-1.5 bg-vetc-green text-white rounded font-bold hover:bg-green-700"
            >
              Đánh giá khách hàng
            </button>
          </div>
        )}
      </div>

      {evaluationPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={closeEvaluationPanel}
            aria-label="Đóng đánh giá"
          />
          <div className="relative w-full max-w-3xl lg:max-w-4xl h-full bg-white shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <CustomerEvaluationPanel />
          </div>
        </div>
      )}
    </CrmPreviewShell>
  );
};

export default ServiceVehicleReportPreview;
