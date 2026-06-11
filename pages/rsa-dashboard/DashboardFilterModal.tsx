
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, RotateCcw, Check } from 'lucide-react';
import {
  DashboardFilterValues,
  defaultDashboardFilters,
  partnerOptions,
  stationOptions,
  provinceOptions,
  wardOptions,
} from './dashboardFilterData';

interface DashboardFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFilterValues;
  onApply: (filters: DashboardFilterValues) => void;
}

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const selectClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-vetc-green bg-white';

const DashboardFilterModal: React.FC<DashboardFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
}) => {
  const [draft, setDraft] = useState<DashboardFilterValues>(filters);

  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const stations = stationOptions[draft.partner] ?? stationOptions[''];
  const wards = wardOptions[draft.province] ?? wardOptions[''];

  const update = (patch: Partial<DashboardFilterValues>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if ('partner' in patch) next.station = '';
      if ('province' in patch) next.ward = '';
      return next;
    });
  };

  const handleReset = () => setDraft(defaultDashboardFilters);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-vetc-green/10 flex items-center justify-center text-vetc-green">
                  <Filter size={18} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Bộ lọc</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">rescue_order_v2.created_at &amp; phạm vi vận hành</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Thời gian tạo đơn
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Từ ngày</FieldLabel>
                    <div className="relative">
                      <input
                        type="date"
                        value={draft.createdFrom}
                        onChange={(e) => update({ createdFrom: e.target.value })}
                        className={`${selectClass} pr-10`}
                      />
                      <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel required>Đến ngày</FieldLabel>
                    <div className="relative">
                      <input
                        type="date"
                        value={draft.createdTo}
                        min={draft.createdFrom}
                        onChange={(e) => update({ createdTo: e.target.value })}
                        className={`${selectClass} pr-10`}
                      />
                      <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Đối tác</FieldLabel>
                  <select
                    value={draft.partner}
                    onChange={(e) => update({ partner: e.target.value })}
                    className={selectClass}
                  >
                    {partnerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Trạm cứu hộ</FieldLabel>
                  <select
                    value={draft.station}
                    onChange={(e) => update({ station: e.target.value })}
                    className={selectClass}
                  >
                    {stations.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Khu vực</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Tỉnh/Thành phố</FieldLabel>
                    <select
                      value={draft.province}
                      onChange={(e) => update({ province: e.target.value })}
                      className={selectClass}
                    >
                      {provinceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Phường/Xã</FieldLabel>
                    <select
                      value={draft.ward}
                      onChange={(e) => update({ ward: e.target.value })}
                      className={selectClass}
                      disabled={!draft.province}
                    >
                      {wards.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white transition-colors"
              >
                <RotateCcw size={14} />
                Đặt lại
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-vetc-green text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Check size={14} />
                  Áp dụng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DashboardFilterModal;
