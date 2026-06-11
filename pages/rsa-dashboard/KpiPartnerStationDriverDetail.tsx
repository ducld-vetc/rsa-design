
import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  Filter,
  Download,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  kpiDetailTabs,
  kpiDetailRows,
  kpiSummaryCards,
  getKpiTone,
  getPrimaryColumnLabel,
  type KpiDetailTab,
  type KpiDetailRow,
} from './kpiDetailData';

interface KpiPartnerStationDriverDetailProps {
  onBack: () => void;
  onOpenFilter: () => void;
  initialTab?: KpiDetailTab;
}

const kpiToneClass = (value: number) => {
  const tone = getKpiTone(value);
  if (tone === 'danger') return 'text-red-500 font-bold';
  if (tone === 'warn') return 'text-red-600 font-semibold';
  if (tone === 'good') return 'text-[#00A859] font-semibold';
  return 'text-gray-800 font-semibold';
};

const KpiCell: React.FC<{ value: number }> = ({ value }) => (
  <span className={kpiToneClass(value)}>{value}%</span>
);

const WarningBadge: React.FC = () => (
  <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500 text-white">
    Cảnh báo
  </span>
);

const SummaryCard: React.FC<{
  label: string;
  value: number;
  target: number;
  trend: number;
  met: boolean;
  subLabel: string;
  avgMinutes?: number;
}> = ({ label, value, trend, met, subLabel, avgMinutes }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 min-w-[220px]">
    <div className="flex items-start justify-between">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-1 text-xs font-bold text-[#00A859]">
        <TrendingUp size={12} />
        +{trend}%
      </div>
    </div>
    <p className={`text-[36px] font-black mt-2 leading-none ${met ? 'text-[#00A859]' : 'text-red-500'}`}>
      {value}%
    </p>
    {avgMinutes !== undefined ? (
      <div className="flex gap-4 mt-3">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase">Trung bình</p>
          <p className="text-sm font-black text-gray-800">{avgMinutes}m</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase">Mục tiêu</p>
          <p className="text-sm font-black text-gray-800">{subLabel.replace('Mục tiêu: ', '')}</p>
        </div>
      </div>
    ) : (
      <>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">{subLabel}</p>
        <div className="mt-2 h-2 rounded-full overflow-hidden flex bg-gray-100">
          <div
            className={`h-full ${met ? 'bg-[#00A859]' : 'bg-[#00A859]'}`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
          {!met && <div className="h-full bg-red-400 flex-1" />}
        </div>
        <p className={`text-[10px] font-black uppercase mt-2 ${met ? 'text-[#00A859]' : 'text-red-500'}`}>
          {met ? 'Đạt' : 'Chưa đạt'}
        </p>
      </>
    )}
  </div>
);

const KpiDetailTable: React.FC<{
  tab: KpiDetailTab;
  rows: KpiDetailRow[];
}> = ({ tab, rows }) => {
  const primaryLabel = getPrimaryColumnLabel(tab);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left py-3 pl-2 w-12" />
            <th className="text-left py-3 px-3">{primaryLabel}</th>
            {tab !== 'driver' && tab !== 'station' && (
              <>
                <th className="text-center py-3 px-2">Trạm cứu hộ</th>
                <th className="text-center py-3 px-2">Phương tiện</th>
                <th className="text-center py-3 px-2">Tài xế</th>
              </>
            )}
            {tab === 'station' && (
              <>
                <th className="text-center py-3 px-2">Phương tiện</th>
                <th className="text-center py-3 px-2">Tài xế</th>
              </>
            )}
            {tab === 'driver' && (
              <th className="text-left py-3 px-3">Trạm cứu hộ</th>
            )}
            <th className="text-center py-3 px-2">KPI tới hiện trường</th>
            <th className="text-center py-3 px-2">KPI xử lý tại chỗ</th>
            <th className="text-center py-3 px-2">KPI kéo xe tới điểm</th>
            <th className="text-center py-3 px-2">KPI hoàn thành</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              className={`border-b border-gray-50 hover:bg-gray-50/80 ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}
            >
              <td className="py-3.5 pl-2">
                <span className="inline-flex w-7 h-7 rounded-full bg-green-50 text-[#00A859] text-xs font-black items-center justify-center">
                  {row.id}
                </span>
              </td>
              <td className="py-3.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                {row.name}
                {row.warning && <WarningBadge />}
              </td>
              {tab !== 'driver' && tab !== 'station' && (
                <>
                  <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.stations}</td>
                  <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.vehicles}</td>
                  <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.drivers}</td>
                </>
              )}
              {tab === 'station' && (
                <>
                  <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.vehicles}</td>
                  <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.drivers}</td>
                </>
              )}
              {tab === 'driver' && (
                <td className="py-3.5 px-3 text-gray-600 font-medium">{row.stationName}</td>
              )}
              <td className="py-3.5 px-2 text-center"><KpiCell value={row.kpis.arrival} /></td>
              <td className="py-3.5 px-2 text-center"><KpiCell value={row.kpis.onsite} /></td>
              <td className="py-3.5 px-2 text-center"><KpiCell value={row.kpis.towing} /></td>
              <td className="py-3.5 px-2 text-center"><KpiCell value={row.kpis.completion} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const KpiPartnerStationDriverDetail: React.FC<KpiPartnerStationDriverDetailProps> = ({
  onBack,
  onOpenFilter,
  initialTab = 'partner',
}) => {
  const [activeTab, setActiveTab] = useState<KpiDetailTab>(initialTab);
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const rows = kpiDetailRows[activeTab];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.stationName?.toLowerCase().includes(q)
    );
  }, [activeTab, search]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-black text-gray-700 hover:text-[#00A859] transition-colors uppercase tracking-wide"
        >
          <ChevronLeft size={18} />
          Tổng hợp KPI
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Filter size={14} />
            Lọc
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={14} />
            Tải báo cáo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
              Chi tiết KPI đối tác - Trạm - Tài xế
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              Mật độ phân bổ trạm cứu hộ trên các tỉnh
            </p>
          </div>
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Filter size={14} />
            Lọc
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {kpiSummaryCards.map((card) => (
            <SummaryCard key={card.key} {...card} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
            Chi tiết KPI đối tác - Trạm - Tài xế
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập để tìm kiếm"
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-full text-xs w-48 outline-none focus:border-vetc-green"
              />
            </div>
            <div className="flex bg-gray-100 rounded-full p-0.5 border border-gray-200">
              {kpiDetailTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#00A859] shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <KpiDetailTable tab={activeTab} rows={filteredRows} />
        </div>
      </div>
    </div>
  );
};

export default KpiPartnerStationDriverDetail;
