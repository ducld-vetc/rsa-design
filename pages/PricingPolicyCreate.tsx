
import React, { useState } from 'react';
import { ChevronDown, Trash2, PlusCircle, Info, Save, X } from 'lucide-react';

/* ─── Row Types ─── */
interface FixedPriceRow {
  id: number;
  type: string;
  from: string;
  to: string;
  fromInclusive: boolean;
  toInclusive: boolean;
  fixedPrice: string;
  weightFrom: string;
  weightTo: string;
  weightFromInclusive: boolean;
  weightToInclusive: boolean;
  pricePerKm: string;
}

interface AdjustmentRow {
  id: number;
  adjustmentType: string;
  detail: string;
  coefficientType: string;
  coefficient: string;
}

interface PriceCapRow {
  id: number;
  type: string;
  from: string;
  to: string;
  fromInclusive: boolean;
  toInclusive: boolean;
  maxPrice: string;
}

/* ─── Component ─── */
const PricingPolicyCreate: React.FC = () => {
  /* General info */
  const [policyCode, setPolicyCode] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [service, setService] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  /* Collapse state */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    fixed: true,
    adjustment: true,
    cap: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  /* Fixed price rows */
  const [fixedRows, setFixedRows] = useState<FixedPriceRow[]>([
    { id: 1, type: 'Theo khoảng cách', from: '', to: '', fromInclusive: true, toInclusive: false, fixedPrice: '', weightFrom: '', weightTo: '', weightFromInclusive: true, weightToInclusive: false, pricePerKm: '' },
  ]);
  const addFixedRow = () =>
    setFixedRows(prev => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1, type: '', from: '', to: '', fromInclusive: true, toInclusive: false, fixedPrice: '', weightFrom: '', weightTo: '', weightFromInclusive: true, weightToInclusive: false, pricePerKm: '' },
    ]);
  const removeFixedRow = (id: number) => setFixedRows(prev => prev.filter(r => r.id !== id));
  const updateFixedRow = (id: number, field: keyof FixedPriceRow, value: string | boolean) =>
    setFixedRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  /* Adjustment rows */
  const [adjustRows, setAdjustRows] = useState<AdjustmentRow[]>([
    { id: 1, adjustmentType: '', detail: '', coefficientType: '', coefficient: '' },
  ]);
  const addAdjustRow = () =>
    setAdjustRows(prev => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1, adjustmentType: '', detail: '', coefficientType: '', coefficient: '' },
    ]);
  const removeAdjustRow = (id: number) => setAdjustRows(prev => prev.filter(r => r.id !== id));
  const updateAdjustRow = (id: number, field: keyof AdjustmentRow, value: string) =>
    setAdjustRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  /* Price cap rows */
  const [capRows, setCapRows] = useState<PriceCapRow[]>([
    { id: 1, type: '', from: '', to: '', fromInclusive: true, toInclusive: false, maxPrice: '' },
  ]);
  const addCapRow = () =>
    setCapRows(prev => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1, type: '', from: '', to: '', fromInclusive: true, toInclusive: false, maxPrice: '' },
    ]);
  const removeCapRow = (id: number) => setCapRows(prev => prev.filter(r => r.id !== id));
  const updateCapRow = (id: number, field: keyof PriceCapRow, value: string | boolean) =>
    setCapRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  /* ─── Shared styles ─── */
  const inputClass =
    'w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00A859] focus:border-[#00A859] transition-colors bg-white';
  const selectClass =
    'w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00A859] focus:border-[#00A859] transition-colors bg-white appearance-none';
  const labelClass = 'text-sm font-medium text-gray-700';
  const thClass = 'px-3 py-1.5 text-xs font-semibold text-[#00A859] text-center whitespace-nowrap border border-gray-300';
  const tdClass = 'px-2 py-1 text-center border border-gray-300';

  const SectionHeader: React.FC<{ title: string; sectionKey: string; icon?: React.ReactNode }> = ({
    title,
    sectionKey,
    icon,
  }) => (
    <div
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between bg-[#00A859] text-white px-4 py-2 rounded-t-lg cursor-pointer select-none hover:bg-[#009850] transition-colors"
    >
      <div className="flex items-center space-x-2">
        {icon || <Info size={16} />}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <ChevronDown
        size={18}
        className={`transition-transform duration-200 ${openSections[sectionKey] ? 'rotate-180' : ''}`}
      />
    </div>
  );

  return (
    <div className="-m-6 -mt-4 space-y-4">
      {/* ═══════════ THÔNG TIN CHUNG ═══════════ */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-3">
        <SectionHeader title="Thông tin chung" sectionKey="general" />
        {openSections.general && (
          <div className="p-4 space-y-3 bg-white">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>
                  Mã chính sách <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={policyCode}
                  onChange={e => setPolicyCode(e.target.value)}
                  placeholder="Nhập mã chính sách"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  Tên chính sách <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={policyName}
                  onChange={e => setPolicyName(e.target.value)}
                  placeholder="Nhập tên chính sách"
                />
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>
                  Dịch vụ <span className="text-red-500">*</span>
                </label>
                <select className={selectClass} value={service} onChange={e => setService(e.target.value)}>
                  <option value="">Chọn dịch vụ</option>
                  <option value="keo_xe">Kéo xe cứu hộ</option>
                  <option value="kich_binh">Kích bình ắc quy</option>
                  <option value="thay_lop">Thay lốp xe</option>
                  <option value="cuu_ho_giao_thong">Cứu hộ giao thông</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  Loại dịch vụ <span className="text-red-500">*</span>
                </label>
                <select className={selectClass} value={serviceType} onChange={e => setServiceType(e.target.value)}>
                  <option value="">Chọn loại dịch vụ</option>
                  <option value="cẩu kéo">Cẩu kéo</option>
                  <option value="xử lý tại chỗ">Xử lý tại chỗ</option>
                </select>
              </div>
            </div>
            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="Chọn thời điểm"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  placeholder="Chọn thời điểm"
                />
              </div>
            </div>
            {/* Row 4 */}
            <div className="space-y-1">
              <label className={labelClass}>Mô tả</label>
              <input
                className={inputClass}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Nhập mô tả"
              />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ GIÁ CỐ ĐỊNH ═══════════ */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-3">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <div
            onClick={() => toggleSection('fixed')}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${openSections.fixed ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-semibold text-gray-800">Giá cố định</span>
          </div>
          <button
            onClick={addFixedRow}
            className="w-7 h-7 flex items-center justify-center bg-[#00A859] text-white rounded-full hover:bg-[#009850] transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
          </button>
        </div>
        {openSections.fixed && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#e6f7ef]">
                  <th className={thClass} style={{ width: 60 }}>STT</th>
                  <th className={thClass} style={{ width: 80 }}>Thao tác</th>
                  <th className={thClass}>Loại</th>
                  <th className={thClass}>Khoảng cách</th>
                  <th className={thClass}>Trọng tải</th>
                  <th className={thClass}>Giá cố định</th>
                  <th className={thClass}>Giá thêm/1km</th>
                </tr>
              </thead>
              <tbody>
                {fixedRows.map((row, idx) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors align-middle">
                    <td className={tdClass}>{idx + 1}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => removeFixedRow(row.id)}
                        className="text-red-500 hover:text-red-700 transition-colors mx-auto flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td className={tdClass} style={{ minWidth: 140 }}>
                      <select
                        className={selectClass}
                        value={row.type}
                        onChange={e => updateFixedRow(row.id, 'type', e.target.value)}
                      >
                        <option value="">Chọn loại</option>
                        <option value="Theo khoảng cách">Theo khoảng cách</option>
                        <option value="Cố định">Cố định</option>
                      </select>
                    </td>
                    {/* Chi tiết: from/to khoảng cách */}
                    <td className={tdClass} style={{ minWidth: 240 }}>
                      {row.type === 'Theo khoảng cách' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className={inputClass + ' text-center flex-1'}
                            value={row.from}
                            onChange={e => updateFixedRow(row.id, 'from', e.target.value)}
                            placeholder="Từ (km)"
                          />
                          <button
                            type="button"
                            onClick={() => updateFixedRow(row.id, 'fromInclusive', !row.fromInclusive)}
                            className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.fromInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                            title={row.fromInclusive ? 'Bao gồm (≥)' : 'Không bao gồm (>)'}
                          >
                            {row.fromInclusive ? '≤' : '<'}
                          </button>
                          <span className="text-gray-400 font-bold">~</span>
                          <button
                            type="button"
                            onClick={() => updateFixedRow(row.id, 'toInclusive', !row.toInclusive)}
                            className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.toInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                            title={row.toInclusive ? 'Bao gồm (≤)' : 'Không bao gồm (<)'}
                          >
                            {row.toInclusive ? '≤' : '<'}
                          </button>
                          <input
                            type="number"
                            className={inputClass + ' text-center flex-1'}
                            value={row.to}
                            onChange={e => updateFixedRow(row.id, 'to', e.target.value)}
                            placeholder="Đến (km)"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    {/* Ngưỡng trọng tải: from/to */}
                    <td className={tdClass} style={{ minWidth: 240 }}>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className={inputClass + ' text-center flex-1'}
                          value={row.weightFrom}
                          onChange={e => updateFixedRow(row.id, 'weightFrom', e.target.value)}
                          placeholder="Từ (tấn)"
                        />
                        <button
                          type="button"
                          onClick={() => updateFixedRow(row.id, 'weightFromInclusive', !row.weightFromInclusive)}
                          className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.weightFromInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                          title={row.weightFromInclusive ? '≤' : '<'}
                        >
                          {row.weightFromInclusive ? '≤' : '<'}
                        </button>
                        <span className="text-gray-400 font-bold">~</span>
                        <button
                          type="button"
                          onClick={() => updateFixedRow(row.id, 'weightToInclusive', !row.weightToInclusive)}
                          className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.weightToInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                          title={row.weightToInclusive ? '≤' : '<'}
                        >
                          {row.weightToInclusive ? '≤' : '<'}
                        </button>
                        <input
                          type="number"
                          className={inputClass + ' text-center flex-1'}
                          value={row.weightTo}
                          onChange={e => updateFixedRow(row.id, 'weightTo', e.target.value)}
                          placeholder="Đến (tấn)"
                        />
                      </div>
                    </td>
                    <td className={tdClass} style={{ minWidth: 120 }}>
                      <input
                        className={inputClass}
                        value={row.fixedPrice}
                        onChange={e => updateFixedRow(row.id, 'fixedPrice', e.target.value)}
                        placeholder="VND"
                      />
                    </td>
                    <td className={tdClass} style={{ minWidth: 120 }}>
                      <input
                        className={inputClass}
                        value={row.pricePerKm}
                        onChange={e => updateFixedRow(row.id, 'pricePerKm', e.target.value)}
                        placeholder="VND/km"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════ HỆ SỐ ĐIỀU CHỈNH ═══════════ */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-3">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <div
            onClick={() => toggleSection('adjustment')}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${openSections.adjustment ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-semibold text-gray-800">Hệ số điều chỉnh</span>
          </div>
          <button
            onClick={addAdjustRow}
            className="w-7 h-7 flex items-center justify-center bg-[#00A859] text-white rounded-full hover:bg-[#009850] transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
          </button>
        </div>
        {openSections.adjustment && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#e6f7ef]">
                  <th className={thClass} style={{ width: 60 }}>STT</th>
                  <th className={thClass} style={{ width: 80 }}>Thao tác</th>
                  <th className={thClass}>Loại điều chỉnh</th>
                  <th className={thClass}>Chi tiết</th>
                  <th className={thClass}>Loại hệ số</th>
                  <th className={thClass}>Hệ số</th>
                </tr>
              </thead>
              <tbody>
                {adjustRows.map((row, idx) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className={tdClass}>{idx + 1}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => removeAdjustRow(row.id)}
                        className="text-red-500 hover:text-red-700 transition-colors mx-auto flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td className={tdClass}>
                      <select
                        className={selectClass}
                        value={row.adjustmentType}
                        onChange={e => updateAdjustRow(row.id, 'adjustmentType', e.target.value)}
                      >
                        <option value="">Chọn loại điều chỉnh</option>
                        <option value="Thời gian">Thời gian</option>
                        <option value="Thời tiết">Thời tiết</option>
                        <option value="Khu vực">Khu vực</option>
                        <option value="Trọng tải xe KH">Trọng tải xe KH</option>
                      </select>
                    </td>
                    <td className={tdClass}>
                      <select
                        className={selectClass}
                        value={row.detail}
                        onChange={e => updateAdjustRow(row.id, 'detail', e.target.value)}
                      >
                        <option value="">Chọn chi tiết</option>
                        {row.adjustmentType === 'Thời gian' && (
                          <>
                            <option value="Ban đêm">Ban đêm (22h - 6h)</option>
                            <option value="Ngày lễ">Ngày lễ, Tết</option>
                            <option value="Giờ cao điểm">Giờ cao điểm</option>
                          </>
                        )}
                        {row.adjustmentType === 'Thời tiết' && (
                          <>
                            <option value="Mưa lớn">Mưa lớn</option>
                            <option value="Ngập lụt">Ngập lụt</option>
                            <option value="Bão/Sương mù">Bão/Sương mù</option>
                          </>
                        )}
                        {row.adjustmentType === 'Khu vực' && (
                          <>
                            <option value="Vùng núi/Đèo">Vùng núi/Đèo</option>
                            <option value="Ngoại thành">Ngoại thành</option>
                            <option value="Biển đảo">Biển đảo</option>
                          </>
                        )}
                        {row.adjustmentType === 'Trọng tải xe KH' && (
                          <>
                            <option value="Xe > 2 tấn">Xe &gt; 2 tấn</option>
                            <option value="Xe > 5 tấn">Xe &gt; 5 tấn</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <select
                        className={selectClass}
                        value={row.coefficientType}
                        onChange={e => updateAdjustRow(row.id, 'coefficientType', e.target.value)}
                      >
                        <option value="">Chọn loại</option>
                        <option value="Phần trăm">Phần trăm</option>
                        <option value="Cố định">Cố định</option>
                      </select>
                    </td>
                    <td className={tdClass}>
                      <input
                        className={inputClass}
                        value={row.coefficient}
                        onChange={e => updateAdjustRow(row.id, 'coefficient', e.target.value)}
                        placeholder="Nhập hệ số"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════ GIÁ TRẦN ═══════════ */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-3">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <div
            onClick={() => toggleSection('cap')}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${openSections.cap ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-semibold text-gray-800">Giá trần</span>
          </div>
          <button
            onClick={addCapRow}
            className="w-7 h-7 flex items-center justify-center bg-[#00A859] text-white rounded-full hover:bg-[#009850] transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
          </button>
        </div>
        {openSections.cap && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#e6f7ef]">
                  <th className={thClass} style={{ width: 60 }}>STT</th>
                  <th className={thClass} style={{ width: 80 }}>Thao tác</th>
                  <th className={thClass} style={{ minWidth: 160 }}>Loại</th>
                  <th className={thClass} style={{ minWidth: 260 }}>Khoảng cách</th>
                  <th className={thClass} style={{ minWidth: 130 }}>Giá max</th>
                </tr>
              </thead>
              <tbody>
                {capRows.map((row, idx) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors align-middle">
                    <td className={tdClass}>{idx + 1}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => removeCapRow(row.id)}
                        className="text-red-500 hover:text-red-700 transition-colors mx-auto flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td className={tdClass}>
                      <select
                        className={selectClass}
                        value={row.type}
                        onChange={e => updateCapRow(row.id, 'type', e.target.value)}
                      >
                        <option value="">Chọn loại</option>
                        <option value="Theo sự vụ">Theo sự vụ</option>
                        <option value="Theo khoảng cách">Theo khoảng cách</option>
                      </select>
                    </td>
                    <td className={tdClass}>
                      {row.type === 'Theo khoảng cách' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className={inputClass + ' text-center flex-1'}
                            value={row.from}
                            onChange={e => updateCapRow(row.id, 'from', e.target.value)}
                            placeholder="Từ (km)"
                          />
                          <button
                            type="button"
                            onClick={() => updateCapRow(row.id, 'fromInclusive', !row.fromInclusive)}
                            className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.fromInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                          >
                            {row.fromInclusive ? '≤' : '<'}
                          </button>
                          <span className="text-gray-400 font-bold">~</span>
                          <button
                            type="button"
                            onClick={() => updateCapRow(row.id, 'toInclusive', !row.toInclusive)}
                            className={`px-1.5 py-1 rounded border text-xs font-bold min-w-[28px] transition-colors ${row.toInclusive ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                          >
                            {row.toInclusive ? '≤' : '<'}
                          </button>
                          <input
                            type="number"
                            className={inputClass + ' text-center flex-1'}
                            value={row.to}
                            onChange={e => updateCapRow(row.id, 'to', e.target.value)}
                            placeholder="Đến (km)"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className={tdClass}>
                      <input
                        className={inputClass}
                        value={row.maxPrice}
                        onChange={e => updateCapRow(row.id, 'maxPrice', e.target.value)}
                        placeholder="VND"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════ FOOTER ACTIONS ═══════════ */}
      <div className="flex items-center justify-end space-x-3 pb-4 mx-3">
        <button className="flex items-center space-x-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <X size={16} />
          <span>Hủy</span>
        </button>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-[#00A859] text-white rounded-lg text-sm font-medium hover:bg-[#009850] transition-colors shadow-sm">
          <Save size={16} />
          <span>Lưu chính sách</span>
        </button>
      </div>
    </div>
  );
};

export default PricingPolicyCreate;
