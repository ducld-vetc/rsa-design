import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Copy, MapPin, X } from 'lucide-react';
import AppSelect from './AppSelect';
import MapSelectionModal from './MapSelectionModal';
import {
  INITIAL_WORKSHOP_STATIONS,
  WorkshopStation,
  findDuplicateStation,
  formatDistanceM,
  parseLatLng,
} from '../data/workshopStations';

interface WorkshopSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  defaultAddress?: string;
  defaultLat?: string;
  defaultLng?: string;
  className?: string;
  placeholder?: string;
  stations?: WorkshopStation[];
  onStationsChange?: (stations: WorkshopStation[]) => void;
}

const WorkshopSelect: React.FC<WorkshopSelectProps> = ({
  value,
  onChange,
  disabled = false,
  defaultAddress = '',
  defaultLat = '',
  defaultLng = '',
  className = '',
  placeholder = 'Chọn điểm xưởng',
  stations: controlledStations,
  onStationsChange,
}) => {
  const [internalStations, setInternalStations] = useState<WorkshopStation[]>(INITIAL_WORKSHOP_STATIONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');

  const stations = controlledStations ?? internalStations;

  const setStations = (next: WorkshopStation[]) => {
    if (onStationsChange) onStationsChange(next);
    else setInternalStations(next);
  };

  useEffect(() => {
    if (!isCreateOpen) return;
    setNewName('');
    setNewAddress(defaultAddress);
    setNewLat(defaultLat);
    setNewLng(defaultLng);
  }, [isCreateOpen, defaultAddress, defaultLat, defaultLng]);

  const duplicate = useMemo(() => {
    const coords = parseLatLng(newLat, newLng);
    if (!coords) return null;
    return findDuplicateStation(coords.lat, coords.lng, stations);
  }, [newLat, newLng, stations]);

  const applyExisting = (name: string, extra?: WorkshopStation) => {
    if (extra && !stations.some((s) => s.id === extra.id || s.name === extra.name)) {
      setStations([...stations, extra]);
    }
    onChange(name);
    setIsCreateOpen(false);
  };

  const handleCreate = () => {
    if (duplicate) {
      const { station } = duplicate;
      applyExisting(station.name, {
        id: station.id,
        name: station.name,
        address: station.address,
        lat: station.lat,
        lng: station.lng,
      });
      return;
    }

    const name = newName.trim();
    if (!name) return;

    const existingByName = stations.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existingByName) {
      onChange(existingByName.name);
      setIsCreateOpen(false);
      return;
    }

    const coords = parseLatLng(newLat, newLng);
    setStations([
      ...stations,
      {
        id: `ws-${Date.now()}`,
        name,
        address: newAddress.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      },
    ]);
    onChange(name);
    setIsCreateOpen(false);
  };

  const handleMapConfirm = (address: string, coords: string) => {
    if (address) setNewAddress(address);
    const [lat, lng] = coords.split(',').map((s) => s.trim());
    if (lat) setNewLat(lat);
    if (lng) setNewLng(lng);
    setIsMapOpen(false);
  };

  return (
    <>
      <AppSelect
        value={value}
        options={stations.map((s) => ({ value: s.name, label: s.name }))}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        createLabel="Tạo mới điểm xưởng"
        onCreate={() => setIsCreateOpen(true)}
      />

      {isCreateOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800">Tạo mới điểm xưởng</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  Tên xưởng {!duplicate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Nhập tên xưởng mới..."
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Địa chỉ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Địa chỉ xưởng"
                    className="flex-1 min-w-0 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="bg-vetc-green text-white px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1 hover:bg-green-700 transition-all active:scale-95 shadow-sm shrink-0"
                  >
                    <MapPin size={14} />
                    Bản đồ
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Lat</label>
                    <input
                      value={newLat}
                      onChange={(e) => setNewLat(e.target.value)}
                      className="w-20 border rounded px-1 py-1.5 text-[10px] font-medium text-center outline-none focus:border-vetc-green"
                      placeholder="Vĩ độ"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Long</label>
                    <input
                      value={newLng}
                      onChange={(e) => setNewLng(e.target.value)}
                      className="w-20 border rounded px-1 py-1.5 text-[10px] font-medium text-center outline-none focus:border-vetc-green"
                      placeholder="Kinh độ"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newLat && !newLng) return;
                      navigator.clipboard.writeText(`${newLat}, ${newLng}`);
                    }}
                    className="text-gray-400 hover:text-vetc-green transition-colors shrink-0"
                    title="Copy tọa độ"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {duplicate && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">Trạm đã tồn tại</p>
                    <p>
                      <span className="font-semibold">{duplicate.station.name}</span>
                      {duplicate.station.address ? ` — ${duplicate.station.address}` : ''}
                      {' '}
                      (cách {formatDistanceM(duplicate.distanceM)}, ngưỡng &lt; 5 m)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!duplicate && !newName.trim()}
                className="px-4 py-2 text-xs font-bold bg-vetc-green text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {duplicate ? 'Chọn trạm đã có' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MapSelectionModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialAddress={newAddress}
        initialCoords={newLat && newLng ? `${newLat}, ${newLng}` : ''}
        title="Chọn vị trí điểm xưởng"
        pinLabel="Vị trí xưởng tại đây"
        overlayClassName="z-[400]"
      />
    </>
  );
};

export default WorkshopSelect;
