
import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, ChevronDown, ShieldCheck, Check } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  role: 'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER';
  onRoleChange: (newRole: 'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER') => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, role, onRoleChange }) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { id: 'ADMIN', label: 'Quyền: ADMIN', description: 'Quản trị viên' },
    { id: 'OSA', label: 'Quyền: OSA', description: 'Giám sát điều phối' },
    { id: 'CSKH', label: 'Quyền: CSKH', description: 'Chăm sóc khách hàng' },
    { id: 'STATION', label: 'Quyền: STATION', description: 'Quản lý trạm cứu hộ' },
    { id: 'DRIVER', label: 'Quyền: DRIVER', description: 'Tài xế cứu hộ' }
  ];

  return (
    <header className="bg-white border-b h-14 flex items-center justify-between px-6 shadow-sm z-20">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="font-bold text-vetc-green tracking-wide hidden sm:block">
          VETC - CỔNG THÔNG TIN DÀNH CHO ĐẠI LÝ
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Role Selector */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold shadow-sm ${
              isRoleDropdownOpen 
                ? 'border-vetc-green bg-green-50 text-vetc-green' 
                : 'border-gray-200 text-gray-600 hover:border-vetc-green hover:bg-gray-50'
            }`}
          >
            <ShieldCheck size={14} className={isRoleDropdownOpen ? 'text-vetc-green' : 'text-gray-400'} />
            <span>Quyền: {role}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-2 bg-gray-50 border-b">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Chọn vai trò hệ thống</span>
              </div>
              <div className="p-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onRoleChange(r.id as any);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                      role === r.id 
                        ? 'bg-green-50 text-vetc-green' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{r.id}</span>
                      <span className="text-[10px] opacity-70 font-medium">{r.description}</span>
                    </div>
                    {role === r.id && <Check size={14} className="text-vetc-green" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer group hover:text-gray-900 transition-colors">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="font-bold text-gray-800">rsa_test1</span>
            <span className="text-[10px] text-gray-400 font-medium">Đại lý Miền Bắc</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-vetc-green transition-colors">
            <User size={18} className="text-gray-500 group-hover:text-vetc-green" />
          </div>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </header>
  );
};

export default Header;
