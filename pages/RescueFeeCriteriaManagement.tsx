import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, X } from 'lucide-react';
import AppSelect from '../shared/AppSelect';
import {
  feeCriterionDefinitions,
  incidentalFeeDefinitions,
  upsertFeeCriterionDefinition,
  upsertIncidentalFeeDefinition,
  type CriterionValueType,
  type FeeCriterionDefinition,
  type IncidentalFeeDefinition,
} from '../data/rescueFeeMockData';

type CatalogTab = 'criteria' | 'incidental';

const emptyDefinition = (): FeeCriterionDefinition => ({
  id: `FEE-CRITERION-${Date.now()}`,
  key: '',
  label: '',
  valueType: 'LIST',
  values: [],
  status: 'ACTIVE',
  updatedAt: '',
});

const emptyIncidental = (): IncidentalFeeDefinition => ({
  id: `INCIDENTAL-${Date.now()}`,
  code: '',
  name: '',
  suggestedPrice: 0,
  status: 'ACTIVE',
  updatedAt: '',
});

const toKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
    .replace(/^[A-Z]/, (character) => character.toLowerCase());

const formatMoneyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
};

const parseMoney = (value: string): number => parseInt(value.replace(/\D/g, ''), 10) || 0;

const RescueFeeCriteriaManagement: React.FC = () => {
  const [tab, setTab] = useState<CatalogTab>('criteria');

  const [definitions, setDefinitions] = useState<FeeCriterionDefinition[]>([
    ...feeCriterionDefinitions,
  ]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [editing, setEditing] = useState<FeeCriterionDefinition | null>(null);
  const [valuesText, setValuesText] = useState('');
  const [error, setError] = useState('');

  const [incidentalItems, setIncidentalItems] = useState<IncidentalFeeDefinition[]>([
    ...incidentalFeeDefinitions,
  ]);
  const [incidentalKeyword, setIncidentalKeyword] = useState('');
  const [incidentalStatus, setIncidentalStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [editingIncidental, setEditingIncidental] = useState<IncidentalFeeDefinition | null>(null);
  const [priceText, setPriceText] = useState('');
  const [incidentalError, setIncidentalError] = useState('');

  const filtered = useMemo(
    () =>
      definitions.filter((definition) => {
        if (status !== 'ALL' && definition.status !== status) return false;
        const query = keyword.trim().toLowerCase();
        return (
          !query ||
          definition.label.toLowerCase().includes(query) ||
          definition.key.toLowerCase().includes(query)
        );
      }),
    [definitions, keyword, status]
  );

  const filteredIncidental = useMemo(
    () =>
      incidentalItems.filter((item) => {
        if (incidentalStatus !== 'ALL' && item.status !== incidentalStatus) return false;
        const query = incidentalKeyword.trim().toLowerCase();
        return (
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query)
        );
      }),
    [incidentalItems, incidentalKeyword, incidentalStatus]
  );

  const openEditor = (definition?: FeeCriterionDefinition) => {
    const next = definition ? { ...definition, values: [...definition.values] } : emptyDefinition();
    setEditing(next);
    setValuesText(next.values.join('\n'));
    setError('');
  };

  const openIncidentalEditor = (item?: IncidentalFeeDefinition) => {
    const next = item ? { ...item } : emptyIncidental();
    setEditingIncidental(next);
    setPriceText(next.suggestedPrice > 0 ? next.suggestedPrice.toLocaleString('en-US') : '');
    setIncidentalError('');
  };

  const save = () => {
    if (!editing) return;
    const label = editing.label.trim();
    const key = (editing.key || toKey(label)).trim();
    if (!label || !key) {
      setError('Vui lòng nhập tên và mã tiêu chí');
      return;
    }
    if (
      definitions.some(
        (definition) =>
          definition.id !== editing.id &&
          (definition.key.toLowerCase() === key.toLowerCase() ||
            definition.label.toLowerCase() === label.toLowerCase())
      )
    ) {
      setError('Tên hoặc mã tiêu chí đã tồn tại');
      return;
    }
    const values = Array.from(
      new Set(
        valuesText
          .split(/\n|,/)
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );
    if (editing.valueType === 'LIST' && values.length === 0) {
      setError('Tiêu chí dạng danh sách cần có ít nhất một giá trị');
      return;
    }
    const saved: FeeCriterionDefinition = {
      ...editing,
      label,
      key,
      values: editing.valueType === 'LIST' ? values : [],
      updatedAt: new Date().toLocaleString('vi-VN'),
    };
    upsertFeeCriterionDefinition(saved);
    setDefinitions([...feeCriterionDefinitions]);
    setEditing(null);
  };

  const saveIncidental = () => {
    if (!editingIncidental) return;
    const name = editingIncidental.name.trim();
    const code = (editingIncidental.code || toKey(name)).trim();
    const suggestedPrice = parseMoney(priceText);
    if (!name || !code) {
      setIncidentalError('Vui lòng nhập tên và mã phí phát sinh');
      return;
    }
    if (suggestedPrice < 0) {
      setIncidentalError('Giá gợi ý không hợp lệ');
      return;
    }
    if (
      incidentalItems.some(
        (item) =>
          item.id !== editingIncidental.id &&
          (item.code.toLowerCase() === code.toLowerCase() ||
            item.name.toLowerCase() === name.toLowerCase())
      )
    ) {
      setIncidentalError('Tên hoặc mã phí phát sinh đã tồn tại');
      return;
    }
    if (editingIncidental.isCatchAll) {
      const otherCatchAll = incidentalItems.find(
        (item) => item.isCatchAll && item.id !== editingIncidental.id
      );
      if (otherCatchAll) {
        setIncidentalError('Chỉ được có một mục “Khác” (catch-all) trong danh mục');
        return;
      }
    }
    const saved: IncidentalFeeDefinition = {
      ...editingIncidental,
      name,
      code,
      suggestedPrice,
      updatedAt: new Date().toLocaleString('vi-VN'),
    };
    upsertIncidentalFeeDefinition(saved);
    setIncidentalItems([...incidentalFeeDefinitions]);
    setEditingIncidental(null);
  };

  const toggleStatus = (definition: FeeCriterionDefinition) => {
    const updated = {
      ...definition,
      status: definition.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
      updatedAt: new Date().toLocaleString('vi-VN'),
    };
    upsertFeeCriterionDefinition(updated);
    setDefinitions([...feeCriterionDefinitions]);
  };

  const toggleIncidentalStatus = (item: IncidentalFeeDefinition) => {
    const updated = {
      ...item,
      status: item.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
      updatedAt: new Date().toLocaleString('vi-VN'),
    };
    upsertIncidentalFeeDefinition(updated);
    setIncidentalItems([...incidentalFeeDefinitions]);
  };

  const inputClass =
    'w-full rounded border px-3 py-1.5 text-sm outline-none placeholder:text-gray-400 focus:border-vetc-green';
  const labelClass = 'mb-1 block text-xs font-semibold text-gray-600';

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight text-gray-800">
            Danh mục tiêu chí tính phí
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Quản lý tiêu chí ma trận giá và danh mục phí phát sinh dùng trên đơn hàng.
          </p>
        </div>
        {tab === 'criteria' ? (
          <button
            type="button"
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 rounded bg-vetc-green px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus size={16} /> Thêm tiêu chí
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openIncidentalEditor()}
            className="inline-flex items-center gap-2 rounded bg-vetc-green px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus size={16} /> Thêm phí phát sinh
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        <button
          type="button"
          onClick={() => setTab('criteria')}
          className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
            tab === 'criteria'
              ? 'border-vetc-green text-vetc-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tiêu chí tính phí
        </button>
        <button
          type="button"
          onClick={() => setTab('incidental')}
          className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
            tab === 'incidental'
              ? 'border-vetc-green text-vetc-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Phí phát sinh
        </button>
      </div>

      {tab === 'criteria' ? (
        <>
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-vetc-green px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
              <Search size={16} /> Tra cứu
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_240px]">
              <div>
                <label className={labelClass}>Tên hoặc mã tiêu chí</label>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className={inputClass}
                  placeholder="Nhập nội dung tìm kiếm"
                />
              </div>
              <div>
                <label className={labelClass}>Trạng thái</label>
                <AppSelect
                  value={status}
                  options={[
                    { value: 'ALL', label: 'Tất cả' },
                    { value: 'ACTIVE', label: 'Đang sử dụng' },
                    { value: 'INACTIVE', label: 'Ngừng sử dụng' },
                  ]}
                  onChange={(value) => setStatus(value as typeof status)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="bg-vetc-green px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
              Danh sách tiêu chí
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-600">
                    <th className="border-b px-4 py-3 text-left">STT</th>
                    <th className="border-b px-4 py-3 text-left">Tên tiêu chí</th>
                    <th className="border-b px-4 py-3 text-left">Mã tiêu chí</th>
                    <th className="border-b px-4 py-3 text-left">Kiểu giá trị</th>
                    <th className="border-b px-4 py-3 text-left">Giá trị cấu hình</th>
                    <th className="border-b px-4 py-3 text-center">Trạng thái</th>
                    <th className="border-b px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((definition, index) => (
                    <tr key={definition.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="border-b px-4 py-3 font-semibold text-gray-800">
                        {definition.label}
                      </td>
                      <td className="border-b px-4 py-3 font-mono text-gray-600">{definition.key}</td>
                      <td className="border-b px-4 py-3">
                        {definition.valueType === 'LIST' ? 'Danh sách' : 'Khoảng số'}
                      </td>
                      <td className="max-w-[340px] border-b px-4 py-3 text-gray-600">
                        {definition.valueType === 'RANGE'
                          ? 'Nhập Từ – Đến khi cấu hình bảng phí'
                          : definition.values.join(', ')}
                      </td>
                      <td className="border-b px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(definition)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            definition.status === 'ACTIVE'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-100 text-gray-500'
                          }`}
                        >
                          {definition.status === 'ACTIVE' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                        </button>
                      </td>
                      <td className="border-b px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openEditor(definition)}
                          className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-gray-50 px-4 py-3 text-xs text-gray-500">
              Hiển thị {filtered.length}/{definitions.length} tiêu chí
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-vetc-green px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
              <Search size={16} /> Tra cứu
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_240px]">
              <div>
                <label className={labelClass}>Tên hoặc mã phí phát sinh</label>
                <input
                  value={incidentalKeyword}
                  onChange={(event) => setIncidentalKeyword(event.target.value)}
                  className={inputClass}
                  placeholder="Nhập nội dung tìm kiếm"
                />
              </div>
              <div>
                <label className={labelClass}>Trạng thái</label>
                <AppSelect
                  value={incidentalStatus}
                  options={[
                    { value: 'ALL', label: 'Tất cả' },
                    { value: 'ACTIVE', label: 'Đang sử dụng' },
                    { value: 'INACTIVE', label: 'Ngừng sử dụng' },
                  ]}
                  onChange={(value) => setIncidentalStatus(value as typeof incidentalStatus)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="bg-vetc-green px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
              Danh sách phí phát sinh
            </div>
            <p className="border-b bg-blue-50/60 px-4 py-2 text-[11px] text-blue-800">
              Danh mục này dùng cho droplist <span className="font-semibold">Loại phí phát sinh</span> khi
              thêm “Dịch vụ khác” trên chi tiết đơn hàng.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-600">
                    <th className="border-b px-4 py-3 text-left">STT</th>
                    <th className="border-b px-4 py-3 text-left">Tên phí phát sinh</th>
                    <th className="border-b px-4 py-3 text-left">Mã</th>
                    <th className="border-b px-4 py-3 text-right">Giá gợi ý</th>
                    <th className="border-b px-4 py-3 text-center">Loại</th>
                    <th className="border-b px-4 py-3 text-center">Trạng thái</th>
                    <th className="border-b px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidental.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="border-b px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="border-b px-4 py-3 font-mono text-gray-600">{item.code}</td>
                      <td className="border-b px-4 py-3 text-right font-semibold text-gray-800">
                        {item.suggestedPrice.toLocaleString('en-US')}
                      </td>
                      <td className="border-b px-4 py-3 text-center">
                        {item.isCatchAll ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Khác
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="border-b px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleIncidentalStatus(item)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            item.status === 'ACTIVE'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.status === 'ACTIVE' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                        </button>
                      </td>
                      <td className="border-b px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openIncidentalEditor(item)}
                          className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-gray-50 px-4 py-3 text-xs text-gray-500">
              Hiển thị {filteredIncidental.length}/{incidentalItems.length} phí phát sinh
            </div>
          </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-sm font-bold text-gray-800">
                {definitions.some((item) => item.id === editing.id)
                  ? 'Chỉnh sửa tiêu chí'
                  : 'Thêm tiêu chí'}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="p-1 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Tên tiêu chí *</label>
                <input
                  value={editing.label}
                  onChange={(event) =>
                    setEditing((current) =>
                      current
                        ? {
                            ...current,
                            label: event.target.value,
                            key: current.key || toKey(event.target.value),
                          }
                        : current
                    )
                  }
                  className={inputClass}
                  placeholder="Ví dụ: Hãng phương tiện"
                />
              </div>
              <div>
                <label className={labelClass}>Mã tiêu chí *</label>
                <input
                  value={editing.key}
                  onChange={(event) =>
                    setEditing((current) =>
                      current ? { ...current, key: event.target.value } : current
                    )
                  }
                  className={inputClass}
                  placeholder="vehicleBrand"
                />
              </div>
              <div>
                <label className={labelClass}>Kiểu giá trị</label>
                <AppSelect
                  value={editing.valueType}
                  options={[
                    { value: 'LIST', label: 'Danh sách giá trị' },
                    { value: 'RANGE', label: 'Khoảng số (Từ – Đến)' },
                  ]}
                  onChange={(value) =>
                    setEditing((current) =>
                      current
                        ? { ...current, valueType: value as CriterionValueType }
                        : current
                    )
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Trạng thái</label>
                <AppSelect
                  value={editing.status}
                  options={[
                    { value: 'ACTIVE', label: 'Đang sử dụng' },
                    { value: 'INACTIVE', label: 'Ngừng sử dụng' },
                  ]}
                  onChange={(value) =>
                    setEditing((current) =>
                      current
                        ? { ...current, status: value as FeeCriterionDefinition['status'] }
                        : current
                    )
                  }
                />
              </div>
              {editing.valueType === 'LIST' && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Danh sách giá trị *</label>
                  <textarea
                    value={valuesText}
                    onChange={(event) => setValuesText(event.target.value)}
                    rows={5}
                    className={inputClass}
                    placeholder="Mỗi giá trị một dòng hoặc phân cách bằng dấu phẩy"
                  />
                </div>
              )}
              {error && (
                <div className="md:col-span-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded border bg-white px-4 py-2 text-xs font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded bg-vetc-green px-4 py-2 text-xs font-bold text-white"
              >
                Lưu tiêu chí
              </button>
            </div>
          </div>
        </div>
      )}

      {editingIncidental && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-sm font-bold text-gray-800">
                {incidentalItems.some((item) => item.id === editingIncidental.id)
                  ? 'Chỉnh sửa phí phát sinh'
                  : 'Thêm phí phát sinh'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingIncidental(null)}
                className="p-1 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Tên phí phát sinh *</label>
                <input
                  value={editingIncidental.name}
                  onChange={(event) =>
                    setEditingIncidental((current) =>
                      current
                        ? {
                            ...current,
                            name: event.target.value,
                            code: current.code || toKey(event.target.value),
                          }
                        : current
                    )
                  }
                  className={inputClass}
                  placeholder="Ví dụ: Phụ phí cao tốc"
                />
              </div>
              <div>
                <label className={labelClass}>Mã *</label>
                <input
                  value={editingIncidental.code}
                  onChange={(event) =>
                    setEditingIncidental((current) =>
                      current ? { ...current, code: event.target.value } : current
                    )
                  }
                  className={inputClass}
                  placeholder="highway-support"
                />
              </div>
              <div>
                <label className={labelClass}>Giá gợi ý (VND) *</label>
                <input
                  value={priceText}
                  onChange={(event) => setPriceText(formatMoneyInput(event.target.value))}
                  className={`${inputClass} text-right font-semibold`}
                  placeholder="300,000"
                />
              </div>
              <div>
                <label className={labelClass}>Trạng thái</label>
                <AppSelect
                  value={editingIncidental.status}
                  options={[
                    { value: 'ACTIVE', label: 'Đang sử dụng' },
                    { value: 'INACTIVE', label: 'Ngừng sử dụng' },
                  ]}
                  onChange={(value) =>
                    setEditingIncidental((current) =>
                      current
                        ? {
                            ...current,
                            status: value as IncidentalFeeDefinition['status'],
                          }
                        : current
                    )
                  }
                />
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(editingIncidental.isCatchAll)}
                    onChange={(event) =>
                      setEditingIncidental((current) =>
                        current ? { ...current, isCatchAll: event.target.checked } : current
                      )
                    }
                    className="rounded border-gray-300 text-vetc-green focus:ring-vetc-green"
                  />
                  Mục “Khác” (nhập tay tên/giá trên đơn)
                </label>
              </div>
              {incidentalError && (
                <div className="md:col-span-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {incidentalError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setEditingIncidental(null)}
                className="rounded border bg-white px-4 py-2 text-xs font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveIncidental}
                className="rounded bg-vetc-green px-4 py-2 text-xs font-bold text-white"
              >
                Lưu phí phát sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueFeeCriteriaManagement;
