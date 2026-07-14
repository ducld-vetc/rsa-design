import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Moon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  SHIFT_TYPE_COLORS,
  SHIFT_TYPE_LABELS,
  summarizeFutureShiftKeyUsage,
  type FutureShiftKeyUsage,
  type ShiftDefinition,
  type ShiftRole,
  type ShiftType,
} from '../data/shiftConfigMockData';
import { useShiftConfig } from '../context/ShiftConfigContext';

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

const emptyForm = (role: ShiftRole): Omit<ShiftDefinition, 'id'> => ({
  role,
  shiftKey: '',
  name: '',
  type: 'TIME_SLOT',
  timeStart: '08:00',
  timeEnd: '17:00',
  status: 'active',
  description: '',
  isNightShift: false,
  restDayAfterShift: true,
  minStaff: 3,
  maxStaff: 5,
});

type PendingImpact =
  | { action: 'edit'; payload: Omit<ShiftDefinition, 'id'>; editingId: string; shiftKey: string; usage: FutureShiftKeyUsage }
  | { action: 'delete'; id: string; shiftKey: string; usage: FutureShiftKeyUsage };

const formatYearMonthLabel = (yearMonth: string) => {
  const [y, m] = yearMonth.split('-');
  return `${m}/${y}`;
};

const ShiftDefinitionManagement: React.FC = () => {
  const { shiftDefinitions, setShiftDefinitions, buildEmployees } = useShiftConfig();

  const [role, setRole] = useState<ShiftRole>('OSA');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ShiftType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ShiftDefinition, 'id'>>(emptyForm('OSA'));
  const [pendingImpact, setPendingImpact] = useState<PendingImpact | null>(null);

  const currentYearMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const roleDefinitions = useMemo(() => {
    return shiftDefinitions
      .filter((d) => d.role === role)
      .filter((d) => {
        if (typeFilter !== 'all' && d.type !== typeFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          d.shiftKey.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.description ?? '').toLowerCase().includes(q)
        );
      });
  }, [shiftDefinitions, role, search, typeFilter]);

  const getFutureUsage = (shiftKey: string): FutureShiftKeyUsage => {
    const employees = buildEmployees(role, currentYearMonth);
    return summarizeFutureShiftKeyUsage(shiftKey, employees, currentYearMonth);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(role));
    setIsModalOpen(true);
  };

  const openEdit = (item: ShiftDefinition) => {
    setEditingId(item.id);
    const { id: _id, ...rest } = item;
    setForm({
      ...rest,
      minStaff: rest.minStaff ?? 3,
      maxStaff: rest.maxStaff,
    });
    setIsModalOpen(true);
  };

  const commitSave = (payload: Omit<ShiftDefinition, 'id'>, id: string | null) => {
    if (id) {
      setShiftDefinitions((prev) =>
        prev.map((d) => (d.id === id ? { ...payload, id } : d))
      );
    } else {
      setShiftDefinitions((prev) => [
        ...prev,
        { ...payload, id: `${role}-${payload.shiftKey.toLowerCase()}-${Date.now()}` },
      ]);
    }
    setIsModalOpen(false);
    setPendingImpact(null);
  };

  const commitDelete = (id: string) => {
    setShiftDefinitions((prev) => prev.filter((d) => d.id !== id));
    setPendingImpact(null);
  };

  const handleSave = () => {
    if (!form.shiftKey.trim() || !form.name.trim()) return;

    const payload: Omit<ShiftDefinition, 'id'> = {
      ...form,
      shiftKey: form.shiftKey.trim().toUpperCase(),
      minStaff: form.minStaff != null && form.minStaff > 0 ? form.minStaff : undefined,
      maxStaff: form.maxStaff != null && form.maxStaff > 0 ? form.maxStaff : undefined,
    };

    if (!editingId) {
      commitSave(payload, null);
      return;
    }

    const original = shiftDefinitions.find((d) => d.id === editingId);
    const keyToCheck = original?.shiftKey ?? payload.shiftKey;
    const usage = getFutureUsage(keyToCheck);
    if (usage.cellCount > 0) {
      setPendingImpact({
        action: 'edit',
        payload,
        editingId,
        shiftKey: keyToCheck,
        usage,
      });
      return;
    }

    commitSave(payload, editingId);
  };

  const handleDelete = (item: ShiftDefinition) => {
    const usage = getFutureUsage(item.shiftKey);
    if (usage.cellCount > 0) {
      setPendingImpact({
        action: 'delete',
        id: item.id,
        shiftKey: item.shiftKey,
        usage,
      });
      return;
    }
    commitDelete(item.id);
  };

  const confirmPendingImpact = () => {
    if (!pendingImpact) return;
    if (pendingImpact.action === 'edit') {
      commitSave(pendingImpact.payload, pendingImpact.editingId);
      return;
    }
    commitDelete(pendingImpact.id);
  };

  const formatTimeRange = (item: { timeStart: string; timeEnd: string }) =>
    `${item.timeStart} – ${item.timeEnd}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">
          Cấu hình ca làm việc
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-colors"
          >
            <Download size={14} />
            Tải template Excel (key ca)
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vetc-green text-white text-xs font-bold shadow-sm hover:bg-green-700 transition-colors"
          >
            <Plus size={14} />
            Thêm ca làm việc
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-bold text-[11px] uppercase tracking-wide text-blue-700 mb-1">Key ca & định biên</p>
        <p>
          <strong>KEY ca</strong> (C1, CG1, OT…) dùng khi upload Excel và lưới lịch tháng. Mỗi ca có khung giờ riêng cùng{' '}
          <strong>số người tối thiểu / tối đa</strong> để cảnh báo thiếu–thừa trên lịch tháng.
        </p>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Lọc theo nhóm role" icon={<Search size={16} />} />
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['OSA', 'CSKH'] as ShiftRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setTypeFilter('all');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-black border transition-all ${
                  role === r
                    ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600 shrink-0 w-20">Tìm kiếm</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Key ca, tên ca..."
                className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600 shrink-0 w-20">Loại ca</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | ShiftType)}
                className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="ADMIN">Ca hành chính</option>
                <option value="TIME_SLOT">Ca theo khung giờ</option>
                <option value="SPLIT">Ca gãy (Nửa ca)</option>
              </select>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <FileSpreadsheet size={14} className="mr-1.5 text-vetc-green" />
              {roleDefinitions.length} ca được cấu hình cho <strong className="mx-1">{role}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title={`Danh sách ca — ${role}`} />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1000px] text-sm text-left">
            <thead className="bg-gray-50 text-[11px] font-black text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">STT</th>
                <th className="px-4 py-3 border-b">Key ca</th>
                <th className="px-4 py-3 border-b">Tên ca</th>
                <th className="px-4 py-3 border-b">Loại ca</th>
                <th className="px-4 py-3 border-b">Khung giờ</th>
                <th className="px-4 py-3 border-b text-center">Tối thiểu</th>
                <th className="px-4 py-3 border-b text-center">Tối đa</th>
                <th className="px-4 py-3 border-b text-center">Ca đêm</th>
                <th className="px-4 py-3 border-b text-center">Trạng thái</th>
                <th className="px-4 py-3 border-b text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roleDefinitions.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-900 text-white font-mono font-bold text-xs">
                      {item.shiftKey}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${SHIFT_TYPE_COLORS[item.type]}`}
                    >
                      {SHIFT_TYPE_LABELS[item.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">{formatTimeRange(item)}</td>
                  <td className="px-4 py-3 text-center">
                    {item.minStaff != null ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                        <AlertTriangle size={11} />
                        {item.minStaff}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.maxStaff != null ? item.maxStaff : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.isNightShift ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                        <Moon size={10} />
                        {item.restDayAfterShift !== false ? 'Nghỉ H+1' : 'Đêm'}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {item.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                        title="Sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {roleDefinitions.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Chưa có ca làm việc nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-vetc-green text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold">
                {editingId ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc'} — {role}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">
                    Key ca <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.shiftKey}
                    onChange={(e) => setForm((f) => ({ ...f, shiftKey: e.target.value.toUpperCase() }))}
                    placeholder="VD: HC, S1, G1"
                    className="w-full border rounded px-3 py-2 text-sm font-mono outline-none focus:border-vetc-green uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">
                    Tên ca <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Loại ca</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ShiftType }))}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green bg-white"
                >
                  <option value="ADMIN">Ca hành chính</option>
                  <option value="TIME_SLOT">Ca theo khung giờ</option>
                  <option value="SPLIT">Ca gãy (Nửa ca)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={form.timeStart ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={form.timeEnd ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">
                    Tối thiểu (người)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.minStaff ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minStaff: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">
                    Tối đa (cảnh báo thừa)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxStaff ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxStaff: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                Định biên theo <strong>từng KEY ca</strong> — dùng cho cảnh báo thiếu/thừa và sắp xếp ca trên lịch tháng.
              </p>

              {form.type === 'SPLIT' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Buổi (ca gãy)</label>
                  <select
                    value={form.splitPart ?? 'AM'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, splitPart: e.target.value as 'AM' | 'PM' }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green bg-white"
                  >
                    <option value="AM">Nửa ca sáng</option>
                    <option value="PM">Nửa ca chiều</option>
                  </select>
                </div>
              )}

              <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={form.isNightShift ?? false}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isNightShift: e.target.checked,
                        restDayAfterShift: e.target.checked ? f.restDayAfterShift ?? true : f.restDayAfterShift,
                      }))
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Moon size={14} className="text-indigo-600" />
                  Ca đêm
                </label>
                {form.isNightShift && (
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer ml-6">
                    <input
                      type="checkbox"
                      checked={form.restDayAfterShift !== false}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, restDayAfterShift: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Làm ca đêm → nghỉ cả ngày hôm sau
                  </label>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Mô tả</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border font-bold text-gray-500 hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.shiftKey.trim() || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-vetc-green text-white font-bold disabled:opacity-50"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingImpact && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  pendingImpact.action === 'delete' ? 'bg-red-50' : 'bg-amber-50'
                }`}
              >
                <AlertTriangle
                  size={20}
                  className={pendingImpact.action === 'delete' ? 'text-red-600' : 'text-amber-600'}
                />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-gray-900">
                  {pendingImpact.action === 'delete'
                    ? 'Xóa ca đang dùng trên lịch tương lai?'
                    : 'Sửa ca đang dùng trên lịch tương lai?'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  KEY <span className="font-mono font-bold text-gray-900">{pendingImpact.shiftKey}</span> đang
                  được gán trên lịch tháng{' '}
                  <strong>{formatYearMonthLabel(pendingImpact.usage.yearMonth)}</strong> (ngày sau hôm nay):{' '}
                  <strong>{pendingImpact.usage.cellCount}</strong> ô /{' '}
                  <strong>{pendingImpact.usage.employeeCount}</strong> nhân viên
                  {pendingImpact.usage.days.length > 0 && (
                    <>
                      {' '}
                      · ngày {pendingImpact.usage.days.slice(0, 8).join(', ')}
                      {pendingImpact.usage.days.length > 8
                        ? `… (+${pendingImpact.usage.days.length - 8})`
                        : ''}
                    </>
                  )}
                  .
                </p>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                  Ca quá khứ và hôm nay giữ nguyên trên lịch. Thay đổi cấu hình áp dụng ngay cho rule /
                  cảnh báo / sắp xếp; ô tương lai vẫn giữ KEY hiện tại trừ khi bạn chỉnh lại trên màn Lịch
                  ca.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingImpact(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmPendingImpact}
                className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${
                  pendingImpact.action === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {pendingImpact.action === 'delete' ? 'Xác nhận xóa' : 'Xác nhận lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftDefinitionManagement;
