import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface DriverSelectProps {
  value: string;
  onChange: (driverId: string, driverName: string, driverPhone: string) => void;
  disabled?: boolean;
  drivers: Driver[];
}

const DriverSelect: React.FC<DriverSelectProps> = ({ value, onChange, disabled, drivers: initialDrivers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [newDriverName, setNewDriverName] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrivers(initialDrivers);
  }, [initialDrivers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm)
  );

  const selectedDriver = drivers.find(d => d.id === value);
  const displayValue = selectedDriver ? selectedDriver.name : value;

  const handleSelect = (driver: Driver) => {
    onChange(driver.id, driver.name, driver.phone);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddDriver = () => {
    if (newDriverName.trim()) {
      const newDriver: Driver = {
        id: `custom-${Date.now()}`,
        name: newDriverName.trim(),
        phone: ''
      };
      setDrivers([...drivers, newDriver]);
      onChange(newDriver.id, newDriver.name, newDriver.phone);
      setNewDriverName('');
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border rounded px-3 py-1.5 text-xs flex items-center justify-between font-bold transition-all ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-vetc-green focus:border-vetc-green'}`}
      >
        <span className="truncate">{displayValue || 'Chọn tài xế...'}</span>
        <ChevronDown size={14} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b flex items-center space-x-2">
            <Search size={14} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm tài xế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs outline-none font-medium"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map(d => (
                <div 
                  key={d.id}
                  onClick={() => handleSelect(d)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors flex justify-between items-center ${value === d.id ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700'}`}
                >
                  <span>{d.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{d.phone}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500 text-center italic">
                Không tìm thấy tài xế
              </div>
            )}
          </div>
          <div className="p-2 border-t bg-gray-50 flex items-center space-x-2">
            <input 
              type="text"
              placeholder="Nhập tên tài xế mới..."
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDriver();
                }
              }}
              className="flex-1 border rounded px-2 py-1.5 text-xs outline-none focus:border-vetc-green"
            />
            <button
              onClick={handleAddDriver}
              disabled={!newDriverName.trim()}
              className="p-1.5 bg-vetc-green text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Thêm tài xế"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSelect;
