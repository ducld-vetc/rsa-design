import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import {
  CRANE_TOOLS,
  SLIDE_TOOLS,
  VEHICLE_TYPE_LABEL,
  type PartnerPersona,
  type VehicleType,
} from '../data/partnerRescueMockData';

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

const filterBtnClass = (active: boolean) =>
  `px-4 py-1.5 rounded text-xs font-bold border transition-all ${
    active
      ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green hover:text-vetc-green'
  }`;

const fieldClass = 'flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white';

const PartnerToolConfig: React.FC = () => {
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [type, setType] = useState<VehicleType>('san_truot_cau');
  const [nameQuery, setNameQuery] = useState('');
  const [extra, setExtra] = useState('');
  const [crane, setCrane] = useState([...CRANE_TOOLS]);
  const [slide, setSlide] = useState([...SLIDE_TOOLS]);

  const list = type === 'san_truot_cau' ? crane : slide;
  const setList = type === 'san_truot_cau' ? setCrane : setSlide;
  const canEdit = persona.role === 'BDH' || persona.role === 'GDM';

  const rows = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return list.filter((name) => !q || name.toLowerCase().includes(q));
  }, [list, nameQuery]);

  const addItem = () => {
    const name = extra.trim();
    if (!name || !canEdit) return;
    if (list.some((n) => n.toLowerCase() === name.toLowerCase())) {
      setExtra('');
      return;
    }
    setList([...list, name]);
    setExtra('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cấu hình công cụ theo loại xe</h1>

      <PartnerScopeBar persona={persona} onChange={setPersona} />

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Loại xe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
                className={fieldClass}
              >
                {(Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]).map((t) => (
                  <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Hạng mục</label>
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Tên công cụ"
                className={fieldClass}
              />
            </div>
            {canEdit && (
              <div className="flex items-center gap-3">
                <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Thêm mới</label>
                <input
                  type="text"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addItem();
                  }}
                  placeholder="Tên hạng mục"
                  className={fieldClass}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  <span>Thêm hạng mục</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {(Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={filterBtnClass(type === t)}
                >
                  {VEHICLE_TYPE_LABEL[t]}
                </button>
              ))}
              <button
                type="button"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm ml-1"
              >
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                <th className="px-3 py-2 text-center w-24 font-bold border-r">Hành động</th>
                <th className="px-3 py-2 text-left font-bold border-r">Hạng mục</th>
                <th className="px-3 py-2 text-left font-bold">Loại xe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((name, index) => (
                <tr key={`${type}-${name}`} className="hover:bg-gray-50/80">
                  <td className="px-3 py-3 text-center border-r text-gray-600">{index + 1}</td>
                  <td className="px-3 py-3 border-r">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => setList(list.filter((n) => n !== name))}
                          className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Gỡ hạng mục"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r font-bold text-gray-800">{name}</td>
                  <td className="px-3 py-3 text-gray-700">{VEHICLE_TYPE_LABEL[type]}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-gray-400">Không có hạng mục phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerToolConfig;
