import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AppSelect from './AppSelect';
import {
  MOCK_RESCUE_PROVIDERS,
  MOCK_RESCUE_STATIONS_ADMIN,
  getStaffByStationId,
  getVehiclesByStationId,
  providerDisplayName,
  type RescueProviderRecord,
  type RescueStationAdminRecord,
} from '../data/rescuePartnerAdminMockData';

export const CHANGE_REASONS = [
  { id: 'wrong_info', label: 'Nhập sai thông tin' },
  { id: 'too_far', label: 'Khoảng cách quá xa' },
  { id: 'vehicle_issue', label: 'Phương tiện gặp sự cố' },
  { id: 'busy', label: 'Đang bận việc khác' },
  { id: 'capacity', label: 'Không phù hợp với năng lực' },
  { id: 'other', label: 'Lý do khác' },
] as const;

export type ChangeReason = (typeof CHANGE_REASONS)[number]['id'];

interface DriverOption {
  id: string;
  name: string;
  phone: string;
}

const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

const findProvider = (label: string): RescueProviderRecord | undefined =>
  MOCK_RESCUE_PROVIDERS.find((item) => providerDisplayName(item) === label || item.name === label);

const findStation = (name: string): RescueStationAdminRecord | undefined =>
  MOCK_RESCUE_STATIONS_ADMIN.find((item) => item.name === name);

const stationsOf = (providerId: string): RescueStationAdminRecord[] =>
  MOCK_RESCUE_STATIONS_ADMIN.filter((item) => item.providerId === providerId && item.status === 'active');

const driversOf = (stationId: string): DriverOption[] =>
  getStaffByStationId(stationId)
    .filter((item) => item.status === 'active' && item.role === 'RESCUE')
    .map((item) => ({ id: item.id, name: item.fullname, phone: item.phone }));

const platesOf = (stationId: string): string[] =>
  getVehiclesByStationId(stationId)
    .filter((item) => item.status !== 'repair')
    .map((item) => item.plate);

const ChangeRescueResourceModal: React.FC<{
  open: boolean;
  orderClosed: boolean;
  currentPartner: string;
  currentStation: string;
  currentDriverId: string;
  currentDriverName: string;
  currentDriverPhone: string;
  currentPlate: string;
  onClose: () => void;
  onConfirm: (value: {
    partner: string;
    station: string;
    driverId: string;
    driverName: string;
    phone: string;
    plate: string;
    syncFrom: string;
  }) => void;
}> = ({
  open,
  orderClosed,
  currentPartner,
  currentStation,
  currentDriverId,
  currentDriverName,
  currentDriverPhone,
  currentPlate,
  onClose,
  onConfirm,
}) => {
  const [partner, setPartner] = useState(currentPartner);
  const [station, setStation] = useState(currentStation);
  const [driverId, setDriverId] = useState(currentDriverId);
  const [plate, setPlate] = useState(currentPlate);
  const [reason, setReason] = useState<ChangeReason | ''>('');
  const [otherReason, setOtherReason] = useState('');
  const [syncFrom, setSyncFrom] = useState('');

  useEffect(() => {
    if (!open) return;
    setPartner(currentPartner);
    setStation(currentStation);
    setDriverId(currentDriverId);
    setPlate(currentPlate);
    setReason('');
    setOtherReason('');
    setSyncFrom('');
  }, [open, currentPartner, currentStation, currentDriverId, currentPlate]);

  if (!open) return null;

  const matchedProvider = findProvider(partner);
  const matchedStation = findStation(station);
  const providerId =
    matchedProvider?.id ??
    (partner === currentPartner ? findStation(currentStation)?.providerId : undefined);
  const stationNames = withCurrent(
    (providerId ? stationsOf(providerId) : []).map((item) => item.name),
    station
  );
  const libraryDrivers = matchedStation ? driversOf(matchedStation.id) : [];
  const driverOptions: DriverOption[] =
    driverId && !libraryDrivers.some((item) => item.id === driverId)
      ? [
          {
            id: driverId,
            name: driverId === currentDriverId ? currentDriverName || driverId : driverId,
            phone: driverId === currentDriverId ? currentDriverPhone : '',
          },
          ...libraryDrivers,
        ]
      : libraryDrivers;
  const plateOptions = withCurrent(matchedStation ? platesOf(matchedStation.id) : [], plate);
  const partnerOptions = withCurrent(
    MOCK_RESCUE_PROVIDERS.filter((item) => item.status === 'active').map((item) => providerDisplayName(item)),
    partner
  );

  const chooseStation = (nextStation: string, previousDriverId: string, previousPlate: string) => {
    const record = findStation(nextStation);
    const nextDrivers = record ? driversOf(record.id) : [];
    const nextPlates = record ? platesOf(record.id) : [];
    const sameOrderStation = nextStation === currentStation;
    setStation(nextStation);
    setDriverId(
      nextDrivers.some((item) => item.id === previousDriverId)
        ? previousDriverId
        : sameOrderStation && previousDriverId === currentDriverId
          ? currentDriverId
          : nextDrivers[0]?.id ?? ''
    );
    setPlate(
      nextPlates.includes(previousPlate)
        ? previousPlate
        : sameOrderStation && previousPlate.trim() === currentPlate.trim()
          ? currentPlate
          : nextPlates[0] ?? ''
    );
  };

  const choosePartner = (nextPartner: string) => {
    setPartner(nextPartner);
    const provider = findProvider(nextPartner);
    const nextProviderId =
      provider?.id ?? (nextPartner === currentPartner ? findStation(currentStation)?.providerId : undefined);
    const nextStations = nextProviderId ? stationsOf(nextProviderId) : [];
    const kept = nextStations.find((item) => item.name === station);
    const nextStation = kept?.name ?? nextStations[0]?.name ?? (nextPartner === currentPartner ? currentStation : '');
    chooseStation(nextStation, driverId, plate);
  };
  const needsSyncTime = orderClosed && reason !== '' && reason !== 'wrong_info';
  const changed =
    partner !== currentPartner ||
    station !== currentStation ||
    driverId !== currentDriverId ||
    plate.trim() !== currentPlate.trim();
  const otherReasonFilled = reason !== 'other' || otherReason.trim() !== '';
  const canSave =
    changed &&
    reason !== '' &&
    otherReasonFilled &&
    partner !== '' &&
    station !== '' &&
    driverId !== '' &&
    plate.trim() !== '' &&
    (!needsSyncTime || syncFrom !== '');

  const confirm = () => {
    if (!canSave) return;
    const driver = driverOptions.find((item) => item.id === driverId);
    onConfirm({
      partner,
      station,
      driverId,
      driverName: driver?.name ?? '',
      phone: driver?.phone ?? '',
      plate: plate.trim(),
      syncFrom: needsSyncTime ? syncFrom : '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-left max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-800">Điều chỉnh thông tin cứu hộ</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Đối tác cung cấp</span>
            <AppSelect
              value={partner}
              options={partnerOptions.map((item) => ({ value: item, label: item }))}
              onChange={choosePartner}
              placeholder="Chọn đối tác"
              searchable
              searchPlaceholder="Tìm đối tác..."
              className="h-[34px] px-3 text-xs font-bold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Trạm cứu hộ cụ thể</span>
            <AppSelect
              value={station}
              options={stationNames.map((item) => ({ value: item, label: item }))}
              onChange={(next) => chooseStation(next, driverId, plate)}
              placeholder="Chọn trạm cứu hộ"
              searchable
              searchPlaceholder="Tìm trạm cứu hộ..."
              className="h-[34px] px-3 text-xs font-bold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Tài xế</span>
            <AppSelect
              value={driverId}
              options={driverOptions.map((driver) => ({
                value: driver.id,
                label: driver.phone ? `${driver.name} · ${driver.phone}` : driver.name,
              }))}
              onChange={setDriverId}
              placeholder="Chọn tài xế"
              searchable
              searchPlaceholder="Tìm tài xế..."
              className="h-[34px] px-3 text-xs font-bold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Biển số xe cứu hộ</span>
            <AppSelect
              value={plate}
              options={plateOptions.map((item) => ({ value: item, label: item }))}
              onChange={setPlate}
              placeholder="Chọn biển số"
              searchable
              searchPlaceholder="Tìm biển số..."
              className="h-[34px] px-3 text-xs font-bold"
            />
          </label>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Lý do</span>
            <div className="space-y-1">
              {CHANGE_REASONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReason(item.id)}
                  className={`w-full text-left rounded border px-3 py-1.5 text-[11px] font-bold ${
                    reason === item.id
                      ? 'border-vetc-green bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {reason === 'other' && (
                <textarea
                  value={otherReason}
                  onChange={(event) => setOtherReason(event.target.value)}
                  placeholder="Nhập lý do"
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green"
                />
              )}
            </div>
          </div>
          {needsSyncTime && (
            <label className="block space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Thời gian bắt đầu lấy dữ liệu</span>
              <input
                type="datetime-local"
                value={syncFrom}
                onChange={(event) => setSyncFrom(event.target.value)}
                className="w-full border rounded px-3 py-2 text-xs font-bold outline-none focus:border-vetc-green"
              />
            </label>
          )}
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-gray-500">
            Hủy
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!canSave}
            className="bg-vetc-green text-white px-4 py-1.5 rounded text-[11px] font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRescueResourceModal;
