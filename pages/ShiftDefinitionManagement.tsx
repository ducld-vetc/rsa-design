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
  type ShiftDefinition,
  type ShiftRole,
  type ShiftType,
  type TimeSlotStaffingRule,
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
});

const emptySlotForm = (role: ShiftRole): Omit<TimeSlotStaffingRule, 'id'> => ({
  role,
  label: '',
  timeStart: '08:00',
  timeEnd: '12:00',
  minStaff: 3,
  maxStaff: 6,
  status: 'active',
});

const ShiftDefinitionManagement: React.FC = () => {
  const {
    shiftDefinitions,
    setShiftDefinitions,
    timeSlotRules,
    setTimeSlotRules,
  } = useShiftConfig();

  const [role, setRole] = useState<ShiftRole>('OSA');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ShiftType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ShiftDefinition, 'id'>>(emptyForm('OSA'));
  const [slotForm, setSlotForm] = useState<Omit<TimeSlotStaffingRule, 'id'>>(emptySlotForm('OSA'));

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

  const roleTimeSlots = useMemo(
    () => timeSlotRules.filter((r) => r.role === role),
    [timeSlotRules, role]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(role));
    setIsModalOpen(true);
  };

  const openEdit = (item: ShiftDefinition) => {
    setEditingId(item.id);
    const { id: _id, ...rest } = item;
    setForm(rest);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.shiftKey.trim() || !form.name.trim()) return;

    if (editingId) {
      setShiftDefinitions((prev) =>
        prev.map((d) => (d.id === editingId ? { ...form, id: editingId } : d))
      );
    } else {
      setShiftDefinitions((prev) => [
        ...prev,
        { ...form, id: `${role}-${form.shiftKey.toLowerCase()}-${Date.now()}` },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setShiftDefinitions((prev) => prev.filter((d) => d.id !== id));
  };

  const openCreateSlot = () => {
    setEditingSlotId(null);
    setSlotForm(emptySlotForm(role));
    setIsSlotModalOpen(true);
  };

  const openEditSlot = (item: TimeSlotStaffingRule) => {
    setEditingSlotId(item.id);
    const { id: _id, ...rest } = item;
    setSlotForm(rest);
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = () => {
    if (!slotForm.label.trim()) return;
    if (editingSlotId) {
      setTimeSlotRules((prev) =>
        prev.map((r) => (r.id === editingSlotId ? { ...slotForm, id: editingSlotId } : r))
      );
    } else {
      setTimeSlotRules((prev) => [
        ...prev,
        { ...slotForm, id: `${role}-slot-${Date.now()}` },
      ]);
    }
    setIsSlotModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    setTimeSlotRules((prev) => prev.filter((r) => r.id !== id));
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
        <p className="font-bold text-[11px] uppercase tracking-wide text-blue-700 mb-1">Key ca & khung giờ</p>
        <p>
          <strong>KEY ca</strong> (HC, S1, G1…) dùng khi upload Excel — mỗi ca có khung giờ riêng.
          <strong> Cảnh báo thiếu người</strong> cấu hình theo <strong>khung giờ trong ngày</strong> (tổng mọi ca đang làm trong khung), không theo từng KEY ca.
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
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead className="bg-gray-50 text-[11px] font-black text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">STT</th>
                <th className="px-4 py-3 border-b">Key ca</th>
                <th className="px-4 py-3 border-b">Tên ca</th>
                <th className="px-4 py-3 border-b">Loại ca</th>
                <th className="px-4 py-3 border-b">Khung giờ</th>
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
                        onClick={() => handleDelete(item.id)}
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
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Chưa có ca làm việc nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Khung giờ — ngưỡng nhân sự */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="bg-vetc-green text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
            <AlertTriangle size={16} />
            <span>Khung giờ & số người tối thiểu — {role}</span>
          </div>
          <button
            type="button"
            onClick={openCreateSlot}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold"
          >
            <Plus size={14} />
            Thêm khung giờ
          </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="bg-gray-50 text-[11px] font-black text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">STT</th>
                <th className="px-4 py-3 border-b">Tên khung</th>
                <th className="px-4 py-3 border-b">Khung giờ</th>
                <th className="px-4 py-3 border-b text-center">Tối thiểu</th>
                <th className="px-4 py-3 border-b text-center">Tối đa</th>
                <th className="px-4 py-3 border-b text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roleTimeSlots.map((slot, index) => (
                <tr key={slot.id} className="border-b hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{slot.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{formatTimeRange(slot)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                      <AlertTriangle size={11} />
                      {slot.minStaff}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{slot.maxStaff ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => openEditSlot(slot)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => handleDeleteSlot(slot.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {isSlotModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-amber-500 text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold">
                {editingSlotId ? 'Sửa khung giờ' : 'Thêm khung giờ'} — {role}
              </h3>
              <button type="button" onClick={() => setIsSlotModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Tên khung giờ</label>
                <input
                  value={slotForm.label}
                  onChange={(e) => setSlotForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="VD: Buổi sáng"
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Từ</label>
                  <input type="time" value={slotForm.timeStart} onChange={(e) => setSlotForm((f) => ({ ...f, timeStart: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Đến</label>
                  <input type="time" value={slotForm.timeEnd} onChange={(e) => setSlotForm((f) => ({ ...f, timeEnd: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Tối thiểu (tổng người)</label>
                  <input type="number" min={1} value={slotForm.minStaff} onChange={(e) => setSlotForm((f) => ({ ...f, minStaff: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">Tối đa (cảnh báo thừa)</label>
                  <input type="number" min={1} value={slotForm.maxStaff ?? ''} onChange={(e) => setSlotForm((f) => ({ ...f, maxStaff: e.target.value ? Number(e.target.value) : undefined }))} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                Đếm tổng nhân viên có ca chồng lấn khung giờ này (HC + S1 + G1…), không tính riêng từng KEY ca.
              </p>
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 flex gap-2">
              <button type="button" onClick={() => setIsSlotModalOpen(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-gray-500">Hủy</button>
              <button type="button" onClick={handleSaveSlot} disabled={!slotForm.label.trim()} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold disabled:opacity-50">Lưu khung giờ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftDefinitionManagement;
