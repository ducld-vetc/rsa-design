import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Car,
  Check,
  History,
  Package,
  Search,
  X,
} from 'lucide-react';
import {
  MOCK_VEHICLE_REGISTRY,
  normalizeVehicleQuery,
  VehicleDataSource,
  VehicleFieldKey,
  VehicleRescuePackage,
  VehicleSearchResult,
} from './VehiclePlateSearchModal';

type LookupKind = 'plate' | 'vin' | 'phone';
type DetailTab = 'package' | 'vehicle' | 'history';

const LOOKUP_OPTIONS: { value: LookupKind; label: string; placeholder: string }[] = [
  { value: 'plate', label: 'Biển số xe', placeholder: 'Nhập biển số xe...' },
  { value: 'vin', label: 'Số khung', placeholder: 'Nhập số khung...' },
  { value: 'phone', label: 'Số điện thoại', placeholder: 'Nhập số điện thoại...' },
];

const lookupKindFromMode = (mode: 'plate' | 'vin' | 'auto'): LookupKind =>
  mode === 'vin' ? 'vin' : 'plate';

const historyPortalStatus = (orderStatus: string) => {
  if (orderStatus === 'Hủy đơn' || orderStatus === 'Đã hủy') return 'FINISH-CANCELLED';
  if (orderStatus === 'Hoàn thành') return 'FINISH-COMPLETED';
  return 'EXECUTE-RESCUING';
};

type Props = {
  isOpen: boolean;
  initialQuery?: string;
  /** Giá trị mặc định của droplist tra cứu khi mở modal */
  searchMode?: 'plate' | 'vin' | 'auto';
  /**
   * true = màn Tạo đơn — bắt buộc chọn gói trước khi Lấy thông tin, rồi áp gói vào form.
   * false = Chi tiết/Sửa đơn — chỉ xem danh sách gói, không áp dụng gói.
   */
  applyPackage?: boolean;
  /** false = chỉ xem, không hiện «Lấy thông tin» */
  allowApply?: boolean;
  onClose: () => void;
  onApply: (vehicle: VehicleSearchResult, selectedPackage: VehicleRescuePackage | null) => void;
};

const packageStatusLabel = (status?: string) => {
  if (status === 'active') return { text: 'Đang hiệu lực', className: 'bg-green-50 text-green-700 border-green-200' };
  if (status === 'expired') return { text: 'Hết hạn', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { text: 'Không có gói', className: 'bg-red-50 text-red-600 border-red-200' };
};

const historyTextClass = (value: string) => {
  if (value === 'Hoàn thành' || value === 'Đã thanh toán' || value === 'Kết thúc') {
    return 'text-vetc-green';
  }
  if (value === 'Hủy đơn' || value === 'Đã hủy') return 'text-red-600';
  return 'text-gray-600';
};

const formatMoney = (value: number) => `${value.toLocaleString('en-US')} đ`;

const sourceOf = (row: VehicleSearchResult): VehicleDataSource => row.recordSource ?? 'VEHICLE';

const PROFILE_FIELDS: { key: VehicleFieldKey; label: string }[] = [
  { key: 'plate', label: 'BSX' },
  { key: 'vin', label: 'Số khung' },
  { key: 'brand', label: 'Hãng xe' },
  { key: 'model', label: 'Dòng' },
  { key: 'loadTons', label: 'Trọng tải' },
  { key: 'seats', label: 'Số chỗ' },
  { key: 'vehicleType', label: 'Loại xe' },
];

const fieldText = (row: VehicleSearchResult, key: VehicleFieldKey) => {
  if (key === 'plate') return row.plate;
  if (key === 'vin') return row.vin;
  if (key === 'brand') return row.brand;
  if (key === 'model') return row.model;
  if (key === 'loadTons') return row.loadTons ? `${row.loadTons} tấn` : '';
  if (key === 'seats') return row.seats ? String(row.seats) : '';
  return row.vehicleType;
};

/** Nội bộ không hiện những trường đã ghi là lấy từ One Vehicle. */
const visibleField = (row: VehicleSearchResult, key: VehicleFieldKey) => {
  if (sourceOf(row) === 'VEHICLE' && row.fieldSources?.[key] === 'ONE_VEHICLE') return '';
  return fieldText(row, key);
};

const filled = (value: string) => value.trim() !== '';

const sameOrBlank = (left: string, right: string) => {
  if (!filled(left) || !filled(right)) return true;
  return left.trim().toUpperCase() === right.trim().toUpperCase();
};

type SourceView = {
  id: string;
  plate: string;
  label: string;
  internal: VehicleSearchResult | null;
  oneVehicle: VehicleSearchResult[];
};

const canMergePair = (internal: VehicleSearchResult | null, external: VehicleSearchResult | null) => {
  if (!internal || !external) return false;
  const vinA = normalizeVehicleQuery(visibleField(internal, 'vin'));
  const vinB = normalizeVehicleQuery(visibleField(external, 'vin'));
  if (!vinA || !vinB || vinA !== vinB) return false;
  if (!sameOrBlank(visibleField(internal, 'plate'), visibleField(external, 'plate'))) return false;
  return !PROFILE_FIELDS.some((field) => {
    if (field.key === 'plate' || field.key === 'vin') return false;
    const left = visibleField(internal, field.key);
    const right = visibleField(external, field.key);
    return filled(left) && filled(right) && left.trim().toUpperCase() !== right.trim().toUpperCase();
  });
};

const buildViews = (rows: VehicleSearchResult[], kind: LookupKind): SourceView[] => {
  const buckets = new Map<string, VehicleSearchResult[]>();
  rows.forEach((row) => {
    const key =
      kind === 'phone'
        ? normalizeVehicleQuery(row.plate) || row.id
        : kind === 'vin'
          ? normalizeVehicleQuery(row.vin) || row.id
          : normalizeVehicleQuery(row.plate) || 'plate';
    buckets.set(key, [...(buckets.get(key) ?? []), row]);
  });
  return [...buckets.entries()].map(([id, list]) => {
    const internal = list.find((row) => sourceOf(row) === 'VEHICLE') ?? null;
    const oneVehicle = list.filter((row) => sourceOf(row) === 'ONE_VEHICLE');
    const named = internal ?? oneVehicle[0];
    const model = named ? visibleField(named, 'model') || visibleField(named, 'brand') : '';
    return {
      id,
      plate: named?.plate ?? '',
      label: [named?.plate, model].filter(Boolean).join(' · ') || 'Xe',
      internal,
      oneVehicle,
    };
  });
};

const defaultChoiceForView = (view: SourceView): string | 'merged' | null => {
  if (view.internal && view.oneVehicle.some((row) => canMergePair(view.internal, row))) return 'merged';
  return view.oneVehicle[0]?.id ?? view.internal?.id ?? null;
};

const chosenExternal = (view: SourceView, choice: string | 'merged' | null) => {
  if (choice === 'merged') {
    return view.oneVehicle.find((row) => canMergePair(view.internal, row)) ?? view.oneVehicle[0] ?? null;
  }
  return view.oneVehicle.find((row) => row.id === choice) ?? null;
};

const buildApplyVehicle = (view: SourceView, choice: string | 'merged'): VehicleSearchResult => {
  const base = view.internal ?? view.oneVehicle[0];
  const external =
    choice === 'merged'
      ? view.oneVehicle.find((row) => canMergePair(view.internal, row)) ?? null
      : view.oneVehicle.find((row) => row.id === choice) ?? null;
  const picked = choice === 'merged' || !external ? base : view.oneVehicle.some((row) => row.id === choice) ? external : base;
  const internal = view.internal;
  if (choice === 'merged' && internal && external) {
    const pick = (key: VehicleFieldKey) => visibleField(internal, key) || visibleField(external, key);
    return {
      ...base,
      plate: pick('plate') || base.plate,
      vin: pick('vin') || base.vin,
      brand: pick('brand'),
      model: pick('model'),
      vehicleType: pick('vehicleType'),
      loadTons: (pick('loadTons') || '').replace(' tấn', ''),
      seats: Number(pick('seats') || 0),
    };
  }
  const sourceRow = picked ?? base;
  return {
    ...base,
    plate: sourceRow.plate || base.plate,
    vin: sourceRow.vin || base.vin,
    brand: visibleField(sourceRow, 'brand'),
    model: visibleField(sourceRow, 'model'),
    vehicleType: visibleField(sourceRow, 'vehicleType'),
    loadTons: (visibleField(sourceRow, 'loadTons') || '').replace(' tấn', ''),
    seats: Number(visibleField(sourceRow, 'seats') || 0),
    owner: base.owner?.name ? base.owner : sourceRow.owner,
  };
};

/** Gói TRIP active mới nhất theo activatedAt — chỉ gói này được dùng. */
const newestActiveTripId = (packages: VehicleRescuePackage[]): string | null => {
  const trips = packages
    .filter((pkg) => (pkg.packageType ?? 'ALWAYS') === 'TRIP' && pkg.status === 'active')
    .slice()
    .sort((a, b) => (b.activatedAt ?? '').localeCompare(a.activatedAt ?? ''));
  return trips[0]?.id ?? null;
};

const isPackageSelectable = (
  pkg: VehicleRescuePackage,
  usableTripId: string | null,
  applyPackage: boolean
) => {
  if (!applyPackage) return false;
  if (pkg.status === 'expired') return false;
  if (pkg.status === 'none') return true;
  if ((pkg.packageType ?? 'ALWAYS') === 'TRIP') return pkg.id === usableTripId;
  return pkg.status === 'active';
};

const VehicleInfoLookupModal: React.FC<Props> = ({
  isOpen,
  initialQuery = '',
  searchMode = 'auto',
  applyPackage = false,
  allowApply = true,
  onClose,
  onApply,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [lookupKind, setLookupKind] = useState<LookupKind>(lookupKindFromMode(searchMode));
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<VehicleSearchResult[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [profileChoice, setProfileChoice] = useState<string | 'merged' | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [packageFilter, setPackageFilter] = useState<'applicable' | 'all'>('applicable');
  const [detailTab, setDetailTab] = useState<DetailTab>('package');

  const runSearch = (raw: string, kind: LookupKind = lookupKind) => {
    const normalized = kind === 'phone' ? raw.replace(/\D/g, '') : normalizeVehicleQuery(raw);
    if (!normalized) {
      setResults([]);
      setSelectedGroupId(null);
      setProfileChoice(null);
      setSelectedPackageId(null);
      setSearched(true);
      return;
    }
    const matched = MOCK_VEHICLE_REGISTRY.filter((v) => {
      if (kind === 'vin') return normalizeVehicleQuery(v.vin).includes(normalized);
      if (kind === 'phone') return v.owner.phone.replace(/\D/g, '').includes(normalized);
      return normalizeVehicleQuery(v.plate).includes(normalized);
    });
    const nextViews = buildViews(matched, kind);
    const first = nextViews[0] ?? null;
    setResults(matched);
    setSelectedGroupId(first?.id ?? null);
    setProfileChoice(first ? defaultChoiceForView(first) : null);
    const pkgs = first?.internal?.rescuePackages ?? [];
    setSelectedPackageId(pkgs.length === 1 ? pkgs[0].id : null);
    setSearched(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const kind = lookupKindFromMode(searchMode);
    setLookupKind(kind);
    setQuery(initialQuery);
    setSearched(false);
    setResults([]);
    setSelectedGroupId(null);
    setProfileChoice(null);
    setSelectedPackageId(null);
    setPackageFilter('applicable');
    setDetailTab('package');
    if (initialQuery.trim()) {
      runSearch(initialQuery, kind);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery, searchMode]);

  const views = useMemo(() => buildViews(results, lookupKind), [results, lookupKind]);
  const selectedView = views.find((view) => view.id === selectedGroupId) ?? null;
  const activeExternal = selectedView ? chosenExternal(selectedView, profileChoice) : null;
  const selected = selectedView?.internal ?? selectedView?.oneVehicle[0] ?? null;

  const packages = selected?.rescuePackages ?? [];
  const usableTripId = newestActiveTripId(packages);
  const activeTripCount = packages.filter(
    (pkg) => (pkg.packageType ?? 'ALWAYS') === 'TRIP' && pkg.status === 'active'
  ).length;
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const comparisonRows = useMemo(() => {
    if (!selectedView) return [];
    return PROFILE_FIELDS.map((field) => {
      const internalValue = selectedView.internal
        ? visibleField(selectedView.internal, field.key)
        : '';
      const externalValue = activeExternal ? visibleField(activeExternal, field.key) : '';
      const diverges =
        filled(internalValue) &&
        filled(externalValue) &&
        internalValue.trim().toUpperCase() !== externalValue.trim().toUpperCase();
      return { ...field, internalValue, externalValue, diverges };
    }).filter((row) => filled(row.internalValue) || filled(row.externalValue));
  }, [selectedView, activeExternal]);

  const canApply = Boolean(selectedView && profileChoice) && (!applyPackage || Boolean(selectedPackageId));

  const handleSelectView = (viewId: string) => {
    const view = views.find((item) => item.id === viewId);
    if (!view) return;
    setSelectedGroupId(viewId);
    setProfileChoice(defaultChoiceForView(view));
    const pkgs = view.internal?.rescuePackages ?? [];
    setSelectedPackageId(pkgs.length === 1 ? pkgs[0].id : null);
    setPackageFilter('applicable');
    setDetailTab('package');
  };

  const displayedPackages = useMemo(() => {
    const sorted = [...packages].sort((a, b) => {
      const rank = (pkg: VehicleRescuePackage) => {
        if (pkg.id === usableTripId) return 0;
        if ((pkg.packageType ?? 'ALWAYS') === 'TRIP' && pkg.status === 'active') return 1;
        if (pkg.status === 'active') return 2;
        if (pkg.status === 'none') return 3;
        return 4;
      };
      return rank(a) - rank(b);
    });
    if (packageFilter === 'all') return sorted;
    return sorted.filter((pkg) => {
      if (pkg.status === 'expired') return false;
      if (pkg.status === 'none') return true;
      if ((pkg.packageType ?? 'ALWAYS') === 'TRIP') return pkg.id === usableTripId;
      return pkg.status === 'active';
    });
  }, [packages, packageFilter, usableTripId]);

  const lookupOption = LOOKUP_OPTIONS.find((option) => option.value === lookupKind) ?? LOOKUP_OPTIONS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-vetc-green" />
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Thông tin xe
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 border-b bg-white shrink-0">
              <div className="flex gap-2">
                <select
                  value={lookupKind}
                  onChange={(e) => {
                    const kind = e.target.value as LookupKind;
                    setLookupKind(kind);
                    if (kind === 'phone') setQuery((current) => current.replace(/\D/g, ''));
                    if (searched) runSearch(kind === 'phone' ? query.replace(/\D/g, '') : query, kind);
                  }}
                  className="shrink-0 border rounded-lg px-2.5 py-2 text-xs font-bold text-gray-700 outline-none focus:border-vetc-green bg-white"
                >
                  {LOOKUP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      lookupKind === 'phone'
                        ? e.target.value.replace(/[^\d]/g, '')
                        : e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runSearch(query);
                  }}
                  placeholder={lookupOption.placeholder}
                  inputMode={lookupKind === 'phone' ? 'tel' : 'text'}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-vetc-green tracking-wide ${
                    lookupKind === 'phone' ? '' : 'uppercase'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => runSearch(query)}
                  className="shrink-0 flex items-center gap-1.5 bg-vetc-green text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                >
                  <Search size={14} />
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 gap-3">
              {!searched ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  Nhập {lookupOption.label.toLowerCase()} rồi bấm Tìm kiếm
                </div>
              ) : results.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  Không tìm thấy xe với &quot;{query}&quot;
                </div>
              ) : (
                <>
                  {lookupKind === 'phone' && views.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {views.map((view) => (
                        <button
                          key={view.id}
                          type="button"
                          onClick={() => handleSelectView(view.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                            selectedGroupId === view.id
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedView && (
                    <div className="flex-1 min-h-0 flex flex-col gap-3">
                      <div className="shrink-0 flex border-b border-gray-200">
                        {(
                          [
                            { id: 'package' as const, label: 'Gói cứu hộ', count: packages.length },
                            { id: 'vehicle' as const, label: 'Thông tin xe' },
                            {
                              id: 'history' as const,
                              label: 'Lịch sử cứu hộ',
                              count: selected?.rescueHistory?.length ?? 0,
                            },
                          ]
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setDetailTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px ${
                              detailTab === tab.id
                                ? 'border-vetc-green text-vetc-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab.label}
                            {tab.count != null && (
                              <span className="ml-1.5 text-[10px] font-bold text-gray-400">({tab.count})</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {detailTab === 'vehicle' && (
                      <section className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <div className="shrink-0 px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-green-50 text-vetc-green flex items-center justify-center shrink-0">
                              <Car size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 tracking-wide truncate">
                                {selectedView.plate || 'Thông tin xe'}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                Nội bộ 1 bản · One Vehicle {selectedView.oneVehicle.length} bản
                              </p>
                            </div>
                          </div>
                          {selectedView.internal &&
                            activeExternal &&
                            canMergePair(selectedView.internal, activeExternal) && (
                              <button
                                type="button"
                                onClick={() => setProfileChoice('merged')}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                  profileChoice === 'merged'
                                    ? 'bg-vetc-green text-white'
                                    : 'border border-gray-200 text-gray-600'
                                }`}
                              >
                                Dùng bản gộp
                              </button>
                            )}
                        </div>
                        <div className="min-h-0 overflow-y-auto px-4 pb-3">
                          {selectedView.oneVehicle.length > 1 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {selectedView.oneVehicle.map((row, index) => {
                                const active = activeExternal?.id === row.id;
                                const title = visibleField(row, 'model') || visibleField(row, 'brand') || `Bản ${index + 1}`;
                                return (
                                  <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => setProfileChoice(row.id)}
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                                      active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                                  >
                                    {title}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {comparisonRows.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic py-2">Không có trường để so sánh</p>
                          ) : (
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr className="text-left">
                                  <th className="w-24 px-2 py-1.5" />
                                  <th className="px-2 py-1.5">
                                    <button
                                      type="button"
                                      disabled={!selectedView.internal}
                                      onClick={() => selectedView.internal && setProfileChoice(selectedView.internal.id)}
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                        profileChoice === selectedView.internal?.id
                                          ? 'bg-vetc-green text-white'
                                          : 'bg-gray-100 text-gray-500'
                                      } disabled:opacity-40`}
                                    >
                                      Nội bộ
                                    </button>
                                  </th>
                                  <th className="px-2 py-1.5">
                                    <button
                                      type="button"
                                      disabled={!activeExternal}
                                      onClick={() => activeExternal && setProfileChoice(activeExternal.id)}
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                        activeExternal && profileChoice === activeExternal.id
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-blue-50 text-blue-600'
                                      } disabled:opacity-40`}
                                    >
                                      One Vehicle
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparisonRows.map((row) => (
                                  <tr key={row.key} className="border-t border-gray-100">
                                    <td className="px-2 py-1.5 text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">
                                      {row.label}
                                    </td>
                                    <td
                                      className={`px-2 py-1.5 font-bold ${
                                        profileChoice === selectedView.internal?.id ? 'bg-green-50/70' : ''
                                      } ${row.diverges ? 'text-red-600' : 'text-gray-800'}`}
                                    >
                                      {row.internalValue || '—'}
                                    </td>
                                    <td
                                      className={`px-2 py-1.5 font-bold ${
                                        activeExternal && profileChoice === activeExternal.id ? 'bg-blue-50/70' : ''
                                      } ${row.diverges ? 'text-red-600' : 'text-gray-800'}`}
                                    >
                                      {row.externalValue || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          {!selectedView.internal && (
                            <p className="text-[11px] text-gray-400 italic mt-1">Không có bản ghi nội bộ</p>
                          )}
                          {selectedView.oneVehicle.length === 0 && (
                            <p className="text-[11px] text-gray-400 italic mt-1">Không có bản ghi One Vehicle</p>
                          )}
                        </div>
                      </section>
                      )}

                      {detailTab === 'package' && (
                      <section className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-100 overflow-hidden">
                        <div className="shrink-0 px-3 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Package size={12} className="text-vetc-green" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
                              Gói cứu hộ của phương tiện
                              {packages.length > 0 && (
                                <span className="ml-1.5 normal-case tracking-normal text-gray-400 font-bold">
                                  ({displayedPackages.length}
                                  {packageFilter === 'applicable' && displayedPackages.length !== packages.length
                                    ? `/${packages.length}`
                                    : ''}
                                  )
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPackageFilter('applicable')}
                              className={`rounded px-2.5 py-1 text-[10px] font-bold ${
                                packageFilter === 'applicable'
                                  ? 'bg-vetc-green text-white'
                                  : 'border border-gray-200 bg-white text-gray-600'
                              }`}
                            >
                              Có thể áp dụng
                            </button>
                            <button
                              type="button"
                              onClick={() => setPackageFilter('all')}
                              className={`rounded px-2.5 py-1 text-[10px] font-bold ${
                                packageFilter === 'all'
                                  ? 'bg-vetc-green text-white'
                                  : 'border border-gray-200 bg-white text-gray-600'
                              }`}
                            >
                              Toàn bộ
                            </button>
                            {!applyPackage && (
                              <span className="text-[9px] font-bold text-gray-400 italic">
                                {allowApply ? 'Chỉ xem — không áp vào đơn đang sửa' : 'Chỉ xem thông tin xe ban đầu'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                          {packageFilter === 'all' && activeTripCount > 1 && (
                            <p className="text-[10px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                              Xe có {activeTripCount} gói bảo hiểm chuyến đi đang hiệu lực. Khi tạo đơn chỉ dùng gói kích hoạt mới nhất.
                            </p>
                          )}
                          {displayedPackages.length === 0 ? (
                            <p className="px-1 py-2 text-xs text-gray-400 italic">
                              {packageFilter === 'applicable'
                                ? 'Không có gói có thể áp dụng'
                                : 'Không có thông tin gói'}
                            </p>
                          ) : (
                            displayedPackages.map((pkg) => {
                              const statusUi = packageStatusLabel(pkg.status);
                              const packageType = pkg.packageType ?? 'ALWAYS';
                              const isTrip = packageType === 'TRIP';
                              const isUsableTrip = pkg.id === usableTripId;
                              const isBlockedTrip = isTrip && pkg.status === 'active' && !isUsableTrip;
                              const isSelectable = isPackageSelectable(pkg, usableTripId, applyPackage);
                              const isSelected = selectedPackageId === pkg.id;
                              const isExpired = pkg.status === 'expired';
                              return (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  disabled={!isSelectable}
                                  onClick={() => {
                                    if (isSelectable) setSelectedPackageId(pkg.id);
                                  }}
                                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                                    isSelected
                                      ? 'border-vetc-green bg-green-50/70 ring-2 ring-vetc-green/20'
                                      : isExpired || isBlockedTrip
                                        ? 'border-gray-100 bg-gray-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                  } ${isSelectable ? 'cursor-pointer' : 'cursor-default'} ${
                                    applyPackage && (isExpired || isBlockedTrip) ? 'cursor-not-allowed opacity-80' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex items-start gap-2">
                                      {applyPackage && isSelectable && (
                                        <span
                                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            isSelected
                                              ? 'border-vetc-green bg-vetc-green'
                                              : 'border-gray-300 bg-white'
                                          }`}
                                        >
                                          {isSelected && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                          )}
                                        </span>
                                      )}
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <p
                                            className={`text-sm font-black ${
                                              pkg.status === 'none' ? 'text-red-600' : 'text-gray-900'
                                            }`}
                                          >
                                            {pkg.name}
                                          </p>
                                          {pkg.status !== 'none' && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200 text-gray-500">
                                              {packageType === 'TRIP' ? 'Bảo hiểm chuyến đi' : 'Cứu hộ'}
                                            </span>
                                          )}
                                          {isBlockedTrip && (
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
                                              Còn hạn — không dùng
                                            </span>
                                          )}
                                        </div>
                                        {pkg.status !== 'none' && pkg.validFrom && pkg.validTo && (
                                          <p className="text-[10px] text-gray-500 mt-0.5">
                                            Hiệu lực: {pkg.validFrom} → {pkg.validTo}
                                          </p>
                                        )}
                                        {pkg.status !== 'none' && (
                                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                                            {pkg.remainingUses != null && pkg.totalUses != null && (
                                                <span className="text-[10px] font-bold text-gray-600">
                                                  Còn {pkg.remainingUses}/{pkg.totalUses} lượt cứu hộ
                                                </span>
                                              )}
                                            {pkg.coverageKm != null && (
                                              <span className="text-[10px] font-bold text-gray-600">
                                                Phạm vi {pkg.coverageKm} KM
                                              </span>
                                            )}
                                            {isTrip && pkg.remainSponsorAmount != null && (
                                              <span className="text-[10px] font-bold text-gray-800">
                                                Bảo lãnh còn lại {formatMoney(pkg.remainSponsorAmount)}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusUi.className}`}
                                    >
                                      {statusUi.text}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                          {applyPackage && !selectedPackageId ? (
                            <p className="text-[10px] leading-relaxed text-amber-700 font-medium">
                              Vui lòng chọn 1 gói được dùng trước khi lấy thông tin.
                            </p>
                          ) : !applyPackage ? (
                            <p className="text-[10px] text-amber-700/80 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                              Gói cứu hộ chỉ được chọn/áp dụng khi <strong>Tạo đơn</strong>. Trên màn
                              chỉnh sửa chi tiết đơn chỉ xem thông tin gói gắn với xe.
                            </p>
                          ) : null}
                        </div>
                      </section>
                      )}

                      {detailTab === 'history' && (
                      <section className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-100 overflow-hidden">
                        <div className="shrink-0 px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                          <History size={12} className="text-vetc-green" />
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
                            Lịch sử cứu hộ
                            <span className="ml-1.5 normal-case tracking-normal text-gray-400 font-bold">
                              ({selected?.rescueHistory?.length ?? 0})
                            </span>
                          </p>
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                          <table className="w-full min-w-[980px] border-collapse text-xs">
                            <thead>
                              <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-600">
                                <th className="px-3 py-2 font-bold">Mã đơn</th>
                                <th className="px-3 py-2 font-bold">Trạng thái</th>
                                <th className="px-3 py-2 font-bold">Loại đơn</th>
                                <th className="px-3 py-2 font-bold">OSA</th>
                                <th className="px-3 py-2 font-bold text-right">Chi phí</th>
                                <th className="px-3 py-2 font-bold">Trạng thái đơn</th>
                                <th className="px-3 py-2 font-bold">Trạng thái thanh toán</th>
                                <th className="px-3 py-2 font-bold">Ngày tạo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(selected?.rescueHistory ?? []).length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                                    Chưa có lịch sử cứu hộ
                                  </td>
                                </tr>
                              ) : (
                                (selected?.rescueHistory ?? []).map((item) => (
                                  <tr key={item.id} className="border-b align-top hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                      <Link
                                        to="/details"
                                        state={{
                                          orderId: item.orderCode,
                                          portalStatusId: historyPortalStatus(item.orderStatus),
                                          customerName: selected?.owner.name,
                                          customerPhone: selected?.owner.phone,
                                          plate: selected?.plate,
                                          address: selected?.owner.address,
                                          mainService: item.orderType,
                                        }}
                                        className="font-semibold text-vetc-green underline underline-offset-2 hover:text-green-700"
                                      >
                                        {item.orderCode}
                                      </Link>
                                    </td>
                                    <td className={`px-3 py-2 ${historyTextClass(item.status)}`}>{item.status}</td>
                                    <td className="px-3 py-2 text-gray-600">{item.orderType}</td>
                                    <td className="px-3 py-2 text-gray-600">{item.osa}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{formatMoney(item.cost)}</td>
                                    <td className={`px-3 py-2 ${historyTextClass(item.orderStatus)}`}>{item.orderStatus}</td>
                                    <td className={`px-3 py-2 ${historyTextClass(item.paymentStatus)}`}>{item.paymentStatus}</td>
                                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{item.createdAt}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 px-4 py-3 border-t bg-white flex flex-col sm:flex-row sm:items-center justify-end gap-2">
              {allowApply && selectedView && !profileChoice && (
                <p className="text-[10px] text-amber-600 font-bold sm:mr-auto">
                  Chọn nguồn trước khi lấy thông tin
                </p>
              )}
              {allowApply && applyPackage && selected && !selectedPackageId && (
                <p className="text-[10px] text-amber-600 font-bold sm:mr-auto">
                  Chọn gói trước khi lấy thông tin
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
              {allowApply && (
              <button
                type="button"
                disabled={!canApply}
                onClick={() =>
                  selectedView &&
                  profileChoice &&
                  onApply(buildApplyVehicle(selectedView, profileChoice), selectedPackage)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vetc-green text-white text-xs font-black hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={14} />
                Lấy thông tin
              </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VehicleInfoLookupModal;
