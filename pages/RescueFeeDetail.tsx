import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Edit3, CalendarRange, ListFilter, ReceiptText, SlidersHorizontal } from 'lucide-react';
import {
  FEE_KIND_LABELS,
  FEE_STATUS_LABELS,
  FEE_TARGET_LABELS,
  duplicatePriceTable,
  feeVersionHistory,
  formatMoneyVi,
  rescueFeeTables,
  type FeeTableStatus,
} from '../data/rescueFeeMockData';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="border-b bg-gray-50 px-4 py-3 font-bold text-sm text-gray-800">{title}</div>
);

const SERVICE_LABELS = {
  ONSITE: 'Hỗ trợ tại chỗ',
  TOWING: 'Kéo xe',
  CRANE: 'Cẩu xe',
} as const;

const StatusBadge: React.FC<{ status: FeeTableStatus }> = ({ status }) => {
  const styles =
    status === 'ACTIVE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'DRAFT'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles}`}>
      {FEE_STATUS_LABELS[status]}
    </span>
  );
};

const RescueFeeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const table = useMemo(() => rescueFeeTables.find((t) => t.id === id), [id]);
  const history = useMemo(
    () => feeVersionHistory.filter((h) => h.tableId === id).sort((a, b) => b.version - a.version),
    [id]
  );

  if (!table) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Không tìm thấy bảng phí.</p>
        <button
          type="button"
          onClick={() => navigate('/rescue-fee-config')}
          className="text-sm font-bold text-vetc-green"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/rescue-fee-config')}
            className="p-2 border rounded hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">{table.name}</h1>
            <p className="text-xs text-gray-500">
              {table.code} · v{table.version} · {FEE_KIND_LABELS[table.kind]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const copy = duplicatePriceTable(table.id);
              if (copy) navigate(`/rescue-fee-config/edit/${copy.id}`);
            }}
            className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <Copy size={14} /> Nhân bản
          </button>
          <button
            type="button"
            onClick={() => navigate(`/rescue-fee-config/edit/${table.id}`)}
            className="inline-flex items-center gap-2 bg-vetc-green text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700"
          >
            <Edit3 size={14} /> Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ReceiptText size={15} className="text-vetc-green" /> Dòng giá
          </div>
          <div className="mt-2 text-xl font-black text-gray-800">{table.serviceRules.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ListFilter size={15} className="text-vetc-green" /> Tiêu chí giá
          </div>
          <div className="mt-2 text-xl font-black text-gray-800">{table.priceCriteria?.length ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <SlidersHorizontal size={15} className="text-vetc-green" /> Phụ phí
          </div>
          <div className="mt-2 text-xl font-black text-gray-800">{table.surchargeRules.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarRange size={15} className="text-vetc-green" /> Hiệu lực
          </div>
          <div className="mt-2 text-sm font-bold text-gray-800">
            {table.validFrom} — {table.validTo}
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tổng quan và tham số tính" />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Đối tượng</div>
            <div className="font-semibold">{FEE_TARGET_LABELS[table.target]}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Áp dụng</div>
            <div className="font-semibold">{table.applyFor}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Ưu tiên</div>
            <div className="font-semibold">{table.priority}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
            <StatusBadge status={table.status} />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Hiệu lực</div>
            <div className="font-semibold">
              {table.validFrom} — {table.validTo}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Cập nhật</div>
            <div className="font-semibold">
              {table.updatedAt} · {table.updatedBy}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Doanh nghiệp</div>
            <div className="font-semibold">{table.scope.enterpriseCode || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">NCC</div>
            <div className="font-semibold">{table.scope.supplierName || table.scope.supplierId || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Hệ số khách lẻ</div>
            <div className="font-semibold">×{table.settings.retailMarkupFactor}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Làm tròn</div>
            <div className="font-semibold">
              {table.settings.roundMode === 'NEAREST_1000'
                ? 'Đến 1.000 đồng'
                : table.settings.roundMode === 'NEAREST_100'
                  ? 'Đến 100 đồng'
                  : 'Không làm tròn'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Cộng dồn phụ phí</div>
            <div className="font-semibold">{table.settings.stackSurcharges ? 'Có' : 'Không'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Bảng dự phòng</div>
            <div className="font-semibold">{table.settings.isFallback ? 'Có' : 'Không'}</div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Ma trận giá dịch vụ theo tiêu chí" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase text-gray-600">
                <th className="px-3 py-2 text-left">Dịch vụ</th>
                <th className="px-3 py-2 text-left">Tổ hợp tiêu chí áp dụng</th>
                <th className="px-3 py-2 text-left">Cách tính</th>
                <th className="px-3 py-2 text-right">Mức giá</th>
                <th className="px-3 py-2 text-right">Km gồm</th>
                <th className="px-3 py-2 text-right">Giá/km vượt</th>
                <th className="px-3 py-2 text-left">Vị trí</th>
              </tr>
            </thead>
            <tbody>
              {table.serviceRules.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.serviceDetail || SERVICE_LABELS[r.serviceType]}</td>
                  <td className="px-3 py-2">
                    {(r.conditions ?? []).length === 0 ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                        Giá mặc định
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(r.conditions ?? []).map((condition, index) => (
                          <span
                            key={`${condition.criterionKey}-${index}`}
                            className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
                          >
                            {condition.criterionLabel}{' '}
                            {condition.operator === 'BETWEEN' && Array.isArray(condition.value)
                              ? `từ ${condition.value[0]} đến ${condition.value[1]}`
                              : `${condition.operator} ${
                                  Array.isArray(condition.value)
                                    ? condition.value.join(', ')
                                    : String(condition.value)
                                }`}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.pricingMode === 'PER_UNIT'
                      ? 'Theo đơn vị'
                      : r.pricingMode === 'FIXED'
                        ? 'Theo lượt'
                        : 'Công thức cơ bản'}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {formatMoneyVi(r.basePrice)}
                    {r.pricingMode === 'PER_UNIT' ? `/${r.unit || 'đơn vị'}` : ''}
                  </td>
                  <td className="px-3 py-2 text-right">{r.includedKm ?? '—'}</td>
                  <td className="px-3 py-2 text-right">
                    {r.pricePerExtraKm != null ? formatMoneyVi(r.pricePerExtraKm) : '—'}
                  </td>
                  <td className="px-3 py-2">{r.roadPosition ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
          <SectionHeader title="Các chiều của ma trận giá" />
          <div className="p-4 space-y-2 text-sm">
            {(table.priceCriteria?.length ?? 0) === 0 && (
              <p className="text-gray-400">Không có tiêu chí, chỉ dùng giá mặc định.</p>
            )}
            {(table.priceCriteria ?? []).map((c) => (
              <div key={c.id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{c.label}</span>
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] text-gray-500">
                    {c.role === 'SURCHARGE' ? 'Phụ phí' : c.role === 'BOTH' ? 'Giá & phụ phí' : 'Giá'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-blue-700">
                  {c.valueType === 'RANGE'
                    ? 'Khoảng Từ – Đến'
                    : 'Giá trị lấy từ danh mục hệ thống'}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
          <SectionHeader title="Phụ phí" />
          <div className="p-4 space-y-2 text-sm">
            {table.surchargeRules.length === 0 && <p className="text-gray-400">Không có phụ phí</p>}
            {table.surchargeRules.map((s) => (
              <div key={s.id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2 flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{s.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.conditions.map((condition, index) => (
                      <span
                        key={`${condition.criterionKey}-${index}`}
                        className="rounded bg-white px-2 py-0.5 text-[10px] text-blue-700"
                      >
                        {condition.criterionLabel} {condition.operator}{' '}
                        {Array.isArray(condition.value)
                          ? condition.value.join(', ')
                          : String(condition.value)}
                      </span>
                    ))}
                  </div>
                  {(s.holidayDates?.length ?? 0) > 0 && (
                    <div className="mt-2 text-[10px] text-amber-700">
                      Holiday: {s.holidayDates?.join(', ')}
                    </div>
                  )}
                </div>
                <div className="shrink-0 font-bold text-gray-800">
                  {s.type === 'FIXED' ? formatMoneyVi(s.value) : `×${s.value}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Lịch sử phiên bản" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase text-gray-600">
                <th className="px-3 py-2 text-left">Phiên bản</th>
                <th className="px-3 py-2 text-left">Trạng thái</th>
                <th className="px-3 py-2 text-left">Kích hoạt</th>
                <th className="px-3 py-2 text-left">Ghi chú / thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                    Chưa có lịch sử phiên bản
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="border-b align-top">
                    <td className="px-3 py-2 font-semibold">v{h.version}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {h.activatedAt || '—'}
                      <div className="text-[10px] text-gray-400">{h.activatedBy}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">{h.note}</div>
                      <ul className="mt-1 list-disc pl-4 text-xs text-gray-500">
                        {h.changes.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RescueFeeDetail;
