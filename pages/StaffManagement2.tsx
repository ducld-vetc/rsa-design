import React, { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Users,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldOff,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Info,
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  FileText,
  Upload,
  Download
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────
interface StaffAccount {
  username: string;
  keycloakSub: string;
  accountStatus: 1 | 2 | 3; // 1=Active, 2=Locked, 3=Disabled
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  lastLoginIp: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  lockedAt: string | null;
  lockedReason: string | null;
  unlockedAt: string | null;
  passwordChangedAt: string | null;
}

interface StaffRecord {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  station: string;
  role: string;
  eimRole: string;
  status: number; // 1=Hoạt động, 0=Không hoạt động, 2=Ngừng vĩnh viễn
  contractType: string;
  workingStatus: number;
  account: StaffAccount | null;
}

const staffData: StaffRecord[] = [
  {
    id: 1,
    fullname: 'NGUYỄN VĂN AN',
    phone: '0988 123 456',
    email: 'an.nv@vetc.com.vn',
    station: 'Trạm HN - Hoàng Mai',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'nguyen.van.an',
      keycloakSub: 'f:711a8c-rsa_nguyen.van.an',
      accountStatus: 1,
      lastLoginAt: '10/04/2026 08:30',
      lastLogoutAt: '09/04/2026 18:00',
      lastLoginIp: '192.168.1.100',
      mfaEnabled: false,
      createdAt: '01/01/2026',
      lockedAt: null,
      lockedReason: null,
      unlockedAt: null,
      passwordChangedAt: '01/03/2026 10:00',
    }
  },
  {
    id: 2,
    fullname: 'TRẦN THỊ LAN',
    phone: '0912 345 678',
    email: 'lan.tt@vetc.com.vn',
    station: 'Trạm HCM - Bình Thạnh',
    role: 'OPERATOR',
    eimRole: 'RSA_OPERATOR',
    status: 0,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'tran.thi.lan',
      keycloakSub: 'f:711a8c-rsa_tran.thi.lan',
      accountStatus: 2,
      lastLoginAt: '08/04/2026 14:22',
      lastLogoutAt: '08/04/2026 17:30',
      lastLoginIp: '10.0.0.55',
      mfaEnabled: true,
      createdAt: '15/01/2026',
      lockedAt: '09/04/2026 10:00',
      lockedReason: 'Vi phạm quy định bảo mật',
      unlockedAt: null,
      passwordChangedAt: '20/02/2026 09:15',
    }
  },
  {
    id: 3,
    fullname: 'LÊ THẾ CƯỜNG',
    phone: '0966 345 678',
    email: 'cuong.lt@vetc.com.vn',
    station: 'Trạm Nghệ An',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 1,
    contractType: 'Thời vụ',
    workingStatus: 1,
    account: null
  },
  {
    id: 4,
    fullname: 'PHẠM MINH ĐỨC',
    phone: '0955 456 789',
    email: 'duc.pm@vetc.com.vn',
    station: 'Trạm Hải Phòng',
    role: 'ADMIN',
    eimRole: 'RSA_ADMIN',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'pham.minh.duc',
      keycloakSub: 'f:711a8c-rsa_pham.minh.duc',
      accountStatus: 1,
      lastLoginAt: '10/04/2026 07:45',
      lastLogoutAt: '09/04/2026 19:00',
      lastLoginIp: '172.16.0.10',
      mfaEnabled: true,
      createdAt: '01/12/2025',
      lockedAt: null,
      lockedReason: null,
      unlockedAt: null,
      passwordChangedAt: '15/03/2026 14:00',
    }
  },
  {
    id: 5,
    fullname: 'NGUYỄN VĂN DŨNG',
    phone: '0912 345 678',
    email: 'dung.nv@vetc.com.vn',
    station: 'Trạm HN - Hoàng Mai',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'nguyen.van.dung',
      keycloakSub: 'f:711a8c-rsa_nguyen.van.dung',
      accountStatus: 3,
      lastLoginAt: '15/03/2026 08:00',
      lastLogoutAt: '15/03/2026 12:00',
      lastLoginIp: '192.168.1.105',
      mfaEnabled: false,
      createdAt: '10/01/2026',
      lockedAt: '20/03/2026 09:00',
      lockedReason: 'Nghỉ việc',
      unlockedAt: null,
      passwordChangedAt: null,
    }
  },
  {
    id: 6,
    fullname: 'HOÀNG THỊ MAI',
    phone: '0933 444 555',
    email: 'mai.ht@vetc.com.vn',
    station: 'Trạm Bình Dương',
    role: 'OPERATOR',
    eimRole: 'RSA_OPERATOR',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'hoang.thi.mai',
      keycloakSub: 'f:711a8c-rsa_hoang.thi.mai',
      accountStatus: 1,
      lastLoginAt: '10/04/2026 09:15',
      lastLogoutAt: '09/04/2026 17:45',
      lastLoginIp: '10.0.1.20',
      mfaEnabled: false,
      createdAt: '20/01/2026',
      lockedAt: null,
      lockedReason: null,
      unlockedAt: null,
      passwordChangedAt: '01/04/2026 08:30',
    }
  },
  {
    id: 7,
    fullname: 'VŨ ĐÌNH TOÀN',
    phone: '0977 888 999',
    email: 'toan.vd@vetc.com.vn',
    station: 'Trạm Hà Đông',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 2,
    contractType: 'Thời vụ',
    workingStatus: 0,
    account: null
  },
  {
    id: 8,
    fullname: 'ĐẶNG QUỐC HÙNG',
    phone: '0909 111 222',
    email: 'hung.dq@vetc.com.vn',
    station: 'Trạm HCM - Bình Thạnh',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'dang.quoc.hung',
      keycloakSub: 'f:711a8c-rsa_dang.quoc.hung',
      accountStatus: 1,
      lastLoginAt: '09/04/2026 16:40',
      lastLogoutAt: '09/04/2026 18:30',
      lastLoginIp: '10.0.0.88',
      mfaEnabled: false,
      createdAt: '05/02/2026',
      lockedAt: null,
      lockedReason: null,
      unlockedAt: null,
      passwordChangedAt: null,
    }
  },
  {
    id: 9,
    fullname: 'BÙI THỊ HẠNH',
    phone: '0944 333 666',
    email: 'hanh.bt@vetc.com.vn',
    station: 'Trạm Nghệ An',
    role: 'OPERATOR',
    eimRole: 'RSA_OPERATOR',
    status: 1,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: {
      username: 'bui.thi.hanh',
      keycloakSub: 'f:711a8c-rsa_bui.thi.hanh',
      accountStatus: 1,
      lastLoginAt: '10/04/2026 07:55',
      lastLogoutAt: '09/04/2026 17:00',
      lastLoginIp: '192.168.2.50',
      mfaEnabled: true,
      createdAt: '01/01/2026',
      lockedAt: null,
      lockedReason: null,
      unlockedAt: '05/03/2026 09:00',
      passwordChangedAt: '10/03/2026 11:30',
    }
  },
  {
    id: 10,
    fullname: 'TRỊNH CÔNG SƠN',
    phone: '0922 777 888',
    email: 'son.tc@vetc.com.vn',
    station: 'Trạm HN - Hoàng Mai',
    role: 'DRIVER',
    eimRole: 'NCC_DRIVER',
    status: 0,
    contractType: 'Toàn thời gian',
    workingStatus: 1,
    account: null
  }
];

// ─── Helper Components ───────────────────────────────────────────

const SectionHeader = ({ title, icon, rightElement }: { title: string; icon?: React.ReactNode; rightElement?: React.ReactNode }) => (
  <div className="bg-[#00A859] text-white px-4 py-2 flex items-center justify-between font-bold text-sm uppercase tracking-wide">
    <div className="flex items-center space-x-2">
      {icon}
      <span>{title}</span>
    </div>
    {rightElement}
  </div>
);

const getAccountStatusBadge = (account: StaffAccount | null) => {
  if (!account) {
    return (
      <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-gray-100 text-gray-500 border-gray-200 whitespace-nowrap shadow-sm w-[100px]">
        <ShieldOff size={12} className="mr-1.5" />
        Chưa có TK
      </span>
    );
  }
  if (account.accountStatus === 1) {
    return (
      <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-green-50 text-green-600 border-green-200 whitespace-nowrap shadow-sm w-[100px]">
        <ShieldCheck size={12} className="mr-1.5" />
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-red-50 text-red-600 border-red-200 whitespace-nowrap shadow-sm w-[100px]">
      <ShieldX size={12} className="mr-1.5" />
      Bị khóa
    </span>
  );
};

const getStaffStatusBadge = (status: number) => {
  if (status === 1) {
    return (
      <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-green-50 text-green-600 border-green-200 whitespace-nowrap shadow-sm w-[100px]">
        Hoạt động
      </span>
    );
  }
  if (status === 2) {
    return (
      <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-red-50 text-red-600 border-red-200 whitespace-nowrap shadow-sm w-[100px]">
        Ngừng vĩnh viễn
      </span>
    );
  }
  return (
    <span className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-orange-50 text-orange-600 border-orange-200 whitespace-nowrap shadow-sm w-[100px]">
      Không hoạt động
    </span>
  );
};

const getRoleBadge = (role: string) => {
  let displayRole = role;
  if (role === 'DRIVER') displayRole = 'Tài xế';
  if (role === 'OPERATOR') displayRole = 'Quản lý trạm';
  if (role === 'ADMIN') displayRole = 'Quản lý đơn vị';

  return (
    <span className="inline-flex justify-center items-center px-2.5 py-1.5 rounded-full text-[11px] font-bold border shadow-sm bg-transparent text-blue-600 border-blue-300 w-[110px]">
      {displayRole}
    </span>
  );
};

// ─── Dialogs ─────────────────────────────────────────────────────

// EIM role options (Keycloak roles)
const EIM_ROLE_OPTIONS = [
  { value: 'RSA_PARTNER_MANAGER', label: 'Quản lý đơn vị cứu hộ' },
  { value: 'RSA_STATION_MANAGER', label: 'Quản lý trạm cứu hộ' },
  { value: 'NCC_DRIVER', label: 'Tài xế' },
  { value: 'RSA_OPERATOR', label: 'Điều phối viên' },
  { value: 'RSA_ADMIN', label: 'Quản trị viên' },
  { value: 'RSA_CSKH', label: 'Chăm sóc khách hàng' },
];

// Multi-select EIM Role dropdown component
const EimRoleMultiSelect = ({ selectedRoles, onChange }: { selectedRoles: string[]; onChange: (roles: string[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRole = (value: string) => {
    if (selectedRoles.includes(value)) {
      onChange(selectedRoles.filter(r => r !== value));
    } else {
      onChange([...selectedRoles, value]);
    }
  };

  const removeRole = (value: string) => {
    onChange(selectedRoles.filter(r => r !== value));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border-2 rounded-lg px-4 py-2.5 text-xs font-bold outline-none transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${
          isOpen ? 'border-[#00A859] ring-4 ring-green-50' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedRoles.length === 0 ? (
            <span className="text-gray-300">Chọn vai trò...</span>
          ) : (
            selectedRoles.map(roleVal => {
              const role = EIM_ROLE_OPTIONS.find(r => r.value === roleVal);
              return role ? (
                <span
                  key={roleVal}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-[10px] font-black"
                >
                  {role.label}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRole(roleVal); }}
                    className="ml-1.5 hover:text-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ) : null;
            })
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {EIM_ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRoles.includes(role.value);
              return (
                <div
                  key={role.value}
                  onClick={() => toggleRole(role.value)}
                  className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition-all border-b border-gray-50 last:border-b-0 ${
                    isSelected
                      ? 'bg-green-50/80 hover:bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#00A859] border-[#00A859]'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                      {role.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{role.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Dialog: Thêm nhân viên
const AddStaffDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [createAccount, setCreateAccount] = useState(false);
  const [selectedEimRoles, setSelectedEimRoles] = useState<string[]>([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
        <div className="bg-[#00A859] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <UserPlus size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Thêm nhân viên mới</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Thông tin nhân sự */}
          <div>
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <Users size={14} />
              <span>Thông tin nhân sự</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nhập họ và tên..." className="border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nhập SĐT..." className="border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                <input type="email" placeholder="Nhập email..." className="border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Đối tác <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                    <option value="">Chọn đối tác...</option>
                    <option>Công ty TNHH ABC</option>
                    <option>Cứu hộ Sài Gòn</option>
                    <option>Cứu hộ Hà Nội</option>
                    <option>Gara Hải Phong</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Trạm cứu hộ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                    <option value="">Chọn trạm...</option>
                    <option>Trạm HN - Hoàng Mai</option>
                    <option>Trạm HCM - Bình Thạnh</option>
                    <option>Trạm Nghệ An</option>
                    <option>Trạm Hải Phòng</option>
                    <option>Trạm Bình Dương</option>
                    <option>Trạm Hà Đông</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Vai trò <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                    <option value="">Chọn vai trò...</option>
                    <option>Quản lý đơn vị</option>
                    <option>Quản lý trạm</option>
                    <option>Tài xế</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Loại hợp đồng</label>
                <div className="relative">
                  <select className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                    <option>Toàn thời gian</option>
                    <option>Thời vụ</option>
                    <option>Hợp đồng dịch vụ</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Tạo tài khoản đăng nhập */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="createAccount"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#00A859] focus:ring-[#00A859] cursor-pointer"
              />
              <label htmlFor="createAccount" className="text-xs font-black text-gray-700 uppercase tracking-widest cursor-pointer flex items-center space-x-2">
                <KeyRound size={14} />
                <span>Tạo tài khoản đăng nhập</span>
              </label>
            </div>

            {createAccount && (
              <div className="ml-7 p-3 bg-green-50/50 border border-green-100 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Username <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="vd: nguyen.van.an" className="border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300 bg-white" />
                  <p className="text-[10px] text-gray-400 font-medium">Tài khoản sẽ được tạo trên Keycloak SSO. Mật khẩu mặc định sẽ được gửi qua SĐT.</p>
                </div>

                {/* Vai trò EIM (Keycloak) */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Vai trò (EIM) <span className="text-red-500">*</span></label>
                  <EimRoleMultiSelect selectedRoles={selectedEimRoles} onChange={setSelectedEimRoles} />
                  <p className="text-[10px] text-gray-400 font-medium">Vai trò EIM là role trên hệ thống Keycloak SSO, quyết định quyền truy cập của nhân viên. Có thể chọn nhiều vai trò.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex space-x-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#00A859] text-white px-4 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            Lưu nhân viên
          </button>
        </div>
      </div>
    </div>
  );
};

// Dialog: Quản lý tài khoản
const ManageAccountDialog = ({ isOpen, onClose, staff, onLockClick, onUnlockClick }: { 
  isOpen: boolean; 
  onClose: () => void; 
  staff: StaffRecord | null;
  onLockClick?: () => void;
  onUnlockClick?: () => void;
}) => {
  if (!isOpen || !staff) return null;
  const acc = staff.account;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
        <div className="bg-[#00A859] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Shield size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">{acc ? 'Quản lý tài khoản' : 'Thông tin nhân viên'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Staff Info Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-[#00A859] rounded-full flex items-center justify-center text-white font-black text-lg">
              {staff.fullname.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-black text-gray-900 text-sm">{staff.fullname}</div>
              <div className="text-[11px] text-gray-500 font-bold">{staff.phone} • {staff.email}</div>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(staff.role)}
                {getAccountStatusBadge(staff.account)}
                {acc?.accountStatus === 1 && (
                  <button 
                    onClick={onLockClick}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Lock size={12} />
                    <span>Khóa TK</span>
                  </button>
                )}
                {acc?.accountStatus === 2 && (
                  <button 
                    onClick={onUnlockClick}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-green-500 text-white border border-green-500 hover:bg-green-600 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Unlock size={12} />
                    <span>Mở khóa</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Thông tin nhân viên */}
          <div>
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <Users size={14} />
              <span>Thông tin nhân viên</span>
            </h4>
            {(!acc || acc.accountStatus === 1) ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                  <input type="email" defaultValue={staff.email} className="border-2 border-gray-100 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                  <input type="tel" defaultValue={staff.phone} className="border-2 border-gray-100 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái</label>
                  <div className="relative">
                    <select defaultValue={staff.status === 1 ? 'active' : staff.status === 2 ? 'disabled' : 'inactive'} className="w-full border-2 border-gray-100 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="disabled">Ngừng vĩnh viễn</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Email" value={staff.email} />
                <InfoField label="Số điện thoại" value={staff.phone} />
                <InfoField label="Trạng thái" value={acc.accountStatus === 2 ? 'Không hoạt động' : 'Ngừng vĩnh viễn'} />
              </div>
            )}
          </div>

          {/* Section: Thông tin tài khoản - only show when account exists */}
          {acc && (
            <div>
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <KeyRound size={14} />
                <span>Thông tin tài khoản</span>
              </h4>
              {acc.accountStatus === 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                    <input type="text" defaultValue={acc.username} disabled className="border-2 border-gray-100 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-500 outline-none bg-gray-50 cursor-not-allowed transition-all" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Username" value={acc.username} />
                </div>
              )}
            </div>
          )}

          {/* Security - only show when account exists */}
          {acc && (
            <div>
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Shield size={14} />
                <span>Bảo mật & Khóa</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">

                <InfoField label="Ngày tạo TK" value={acc.createdAt} />
                {acc.lockedAt && <InfoField label="Thời điểm khóa" value={acc.lockedAt} highlight="red" />}
                {acc.lockedReason && <InfoField label="Lý do khóa" value={acc.lockedReason} highlight="red" />}
                {acc.unlockedAt && <InfoField label="Thời điểm mở khóa" value={acc.unlockedAt} highlight="green" />}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all">
            Đóng
          </button>

          {(!acc || acc.accountStatus === 1) && (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#00A859] text-white font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Lưu thông tin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Info field helper for dialogs
const InfoField = ({ label, value, mono, icon, highlight }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode; highlight?: 'red' | 'green' }) => {
  let bg = 'bg-gray-50 border-gray-100';
  if (highlight === 'red') bg = 'bg-red-50 border-red-100';
  if (highlight === 'green') bg = 'bg-green-50 border-green-100';

  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className={`${bg} border rounded-lg px-4 py-2.5 text-xs font-bold text-gray-700 flex items-center space-x-2`}>
        {icon}
        <span className={mono ? 'font-mono text-[10px]' : ''}>{value}</span>
      </div>
    </div>
  );
};

// Dialog: Cấp tài khoản
const CreateAccountDialog = ({ isOpen, onClose, staff }: { isOpen: boolean; onClose: () => void; staff: StaffRecord | null }) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
        <div className="bg-[#00A859] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <KeyRound size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Cấp tài khoản đăng nhập</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Staff preview */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-[#00A859] rounded-full flex items-center justify-center text-white font-black text-sm">
              {staff.fullname.charAt(0)}
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm">{staff.fullname}</div>
              <div className="text-[11px] text-gray-500 font-bold">{staff.phone} • {staff.station}</div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                Nhân viên này hiện chưa có tài khoản đăng nhập. Tạo tài khoản sẽ tự động đăng ký trên Keycloak SSO và gửi thông tin đăng nhập qua SĐT.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                defaultValue={staff.fullname.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}
                className="border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">SĐT nhận mật khẩu</label>
              <input
                type="tel"
                defaultValue={staff.phone}
                className="border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex space-x-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
            Hủy
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#00A859] text-white px-4 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound size={14} />
            <span>Tạo tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dialog: Khóa / Mở khóa tài khoản
const LockUnlockDialog = ({ isOpen, onClose, staff, action }: { isOpen: boolean; onClose: () => void; staff: StaffRecord | null; action: 'lock' | 'unlock' }) => {
  if (!isOpen || !staff) return null;
  const isLock = action === 'lock';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
        <div className={`${isLock ? 'bg-red-500' : 'bg-green-500'} p-4 flex items-center justify-between text-white`}>
          <div className="flex items-center space-x-3">
            {isLock ? <Lock size={20} /> : <Unlock size={20} />}
            <h3 className="font-bold text-sm uppercase tracking-wider">
              {isLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Staff preview */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className={`w-10 h-10 ${isLock ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center text-white font-black text-sm`}>
              {staff.fullname.charAt(0)}
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm">{staff.fullname}</div>
              <div className="text-[11px] text-gray-500 font-bold">
                @{staff.account?.username} • {staff.station}
              </div>
            </div>
          </div>

          {isLock ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Info size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-red-700 font-bold leading-relaxed">
                    Sau khi khóa, nhân viên sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa. Trạng thái tài khoản sẽ chuyển sang <strong>LOCKED</strong>.
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Lý do khóa <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Nhập lý do khóa tài khoản..."
                  rows={3}
                  className="border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all placeholder:text-gray-300 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Info size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-green-700 font-bold leading-relaxed">
                    Sau khi mở khóa, nhân viên sẽ có thể đăng nhập lại vào hệ thống. Trạng thái tài khoản sẽ chuyển sang <strong>ACTIVE</strong>.
                  </p>
                </div>
              </div>
              {staff.account?.lockedReason && (
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lý do khóa trước đó</label>
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-xs font-bold text-red-600">
                    {staff.account.lockedReason}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex space-x-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
            Hủy
          </button>
          <button
            onClick={onClose}
            className={`flex-1 ${isLock ? 'bg-red-500 shadow-red-100 hover:bg-red-600' : 'bg-green-500 shadow-green-100 hover:bg-green-600'} text-white px-4 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center space-x-2`}
          >
            {isLock ? <Lock size={14} /> : <Unlock size={14} />}
            <span>{isLock ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dialog: Điều chuyển công tác
const TransferDialog = ({ isOpen, onClose, staff }: { isOpen: boolean; onClose: () => void; staff: StaffRecord | null }) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
        <div className="bg-[#00A859] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
             <ArrowRightLeft size={20} />
             <h3 className="font-bold text-sm uppercase tracking-wider">Điều chuyển công tác</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Vị trí hiện tại */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Vị trí hiện tại <span className="text-red-500">*</span></label>
            <input type="text" readOnly value={staff.station} className="border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold bg-gray-50 text-gray-400 outline-none" />
          </div>

          {/* Mã trạm/Kho */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Mã trạm/Kho mới <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all appearance-none cursor-pointer">
                <option value="">Chọn trạm/kho...</option>
                <option>Trạm HN - Hoàng Mai</option>
                <option>Trạm HCM - Bình Thạnh</option>
                <option>Trạm Nghệ An</option>
                <option>Trạm Hải Phòng</option>
                <option>Trạm Bình Dương</option>
                <option>Trạm Hà Đông</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ngày hiệu lực */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Ngày hiệu lực <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" placeholder="Chọn ngày..." className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300" />
              <Calendar size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ngày hết hạn */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Ngày kết thúc</label>
            <div className="relative">
              <input type="text" placeholder="Chọn ngày..." className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300" />
              <Calendar size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Lý do điều chuyển */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Lý do điều chuyển <span className="text-red-500">*</span></label>
            <textarea placeholder="Nhập lý do điều chuyển..." rows={3} className="w-full border-2 border-gray-100 rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-[#00A859] focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300 resize-none" />
          </div>
        </div>

        <div className="p-6 border-t flex space-x-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#00A859] text-white px-4 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
          >
            <ArrowRightLeft size={14} />
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────

interface StaffManagement2Props {
  role?: 'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER';
}

const StaffManagement2: React.FC<StaffManagement2Props> = ({ role = 'OSA' }) => {
  const [currentPage] = useState(1);

  // Filter states
  const [selectedStation, setSelectedStation] = useState<string>('');

  // Base data: STATION role only sees DRIVER staff, OSA sees all
  const baseData = role === 'STATION'
    ? staffData.filter(s => s.role === 'DRIVER')
    : staffData;

  // Filtered data: when a station is selected, further filter by station
  const filteredData = selectedStation
    ? baseData.filter(s => s.station === selectedStation)
    : baseData;

  // Dialog states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isLockUnlockOpen, setIsLockUnlockOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [lockAction, setLockAction] = useState<'lock' | 'unlock'>('lock');
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const importDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (importDropdownRef.current && !importDropdownRef.current.contains(e.target as Node)) {
        setIsImportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTransfer = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setIsTransferOpen(true);
  };

  const handleManageAccount = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setIsManageAccountOpen(true);
  };

  const handleCreateAccount = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setIsCreateAccountOpen(true);
  };

  const handleLockAccount = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setLockAction('lock');
    setIsLockUnlockOpen(true);
  };

  const handleUnlockAccount = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setLockAction('unlock');
    setIsLockUnlockOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      {/* ── Search Filter Section ── */}
      <div className="border rounded-lg shadow-sm bg-white border-green-100 overflow-visible">
        <div className="rounded-t-lg overflow-hidden">
          <SectionHeader title="Tra cứu nhân viên" icon={<Search size={16} />} />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            {/* Row 1 */}
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Tên nhân viên</label>
              <input type="text" placeholder="Nhập tên..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] transition-all" />
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Số điện thoại</label>
              <input type="text" placeholder="Nhập SĐT..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] transition-all" />
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Username</label>
              <input type="text" placeholder="Nhập username..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] transition-all" />
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Email</label>
              <input type="text" placeholder="Nhập email..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] transition-all" />
            </div>

            {/* Row 2 */}
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Trạm cứu hộ</label>
              <div className="relative flex-1">
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="Trạm HN - Hoàng Mai">Trạm HN - Hoàng Mai</option>
                  <option value="Trạm HCM - Bình Thạnh">Trạm HCM - Bình Thạnh</option>
                  <option value="Trạm Nghệ An">Trạm Nghệ An</option>
                  <option value="Trạm Hải Phòng">Trạm Hải Phòng</option>
                  <option value="Trạm Bình Dương">Trạm Bình Dương</option>
                  <option value="Trạm Hà Đông">Trạm Hà Đông</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Vai trò</label>
              <div className="relative flex-1">
                <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] bg-white transition-all appearance-none cursor-pointer">
                  <option>Tất cả</option>
                  <option>Quản lý đơn vị</option>
                  <option>Quản lý trạm</option>
                  <option>Tài xế</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Trạng thái</label>
              <div className="relative flex-1">
                <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] bg-white transition-all appearance-none cursor-pointer">
                  <option>Tất cả</option>
                  <option>Hoạt động</option>
                  <option>Không hoạt động</option>
                  <option>Ngừng vĩnh viễn</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-28 text-xs font-bold text-gray-600 flex-shrink-0">Tài khoản</label>
              <div className="relative flex-1">
                <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-[#00A859] bg-white transition-all appearance-none cursor-pointer">
                  <option>Tất cả</option>
                  <option>Chưa có TK</option>
                  <option>Hoạt động</option>
                  <option>Bị khóa</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end mt-6 space-x-3">
            <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-md font-bold text-xs hover:bg-gray-200 transition-all shadow-sm">
              Xóa bộ lọc
            </button>
            <button className="flex items-center space-x-2 bg-[#00A859] text-white px-8 py-2 rounded-md font-bold text-xs hover:bg-green-700 transition-all shadow-md group">
              <Search size={14} className="group-hover:scale-110 transition-transform" />
              <span>Tìm kiếm</span>
            </button>
            <div className="relative" ref={importDropdownRef}>
              <button
                onClick={() => setIsImportDropdownOpen(!isImportDropdownOpen)}
                className="flex items-center space-x-2 bg-[#00A859] text-white px-6 py-2 rounded-md font-bold text-xs hover:bg-green-700 transition-all shadow-md group"
              >
                <FileSpreadsheet size={14} className="group-hover:scale-110 transition-transform" />
                <span>Import Excel</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isImportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isImportDropdownOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={() => { setIsImportDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-green-50 transition-all border-b border-gray-100"
                  >
                    <Download size={14} className="text-[#00A859]" />
                    <span>Tải template</span>
                  </button>
                  <button
                    onClick={() => { setIsImportDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-green-50 transition-all"
                  >
                    <Upload size={14} className="text-[#00A859]" />
                    <span>Import tài khoản</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-xs hover:bg-blue-700 transition-all shadow-md group"
            >
              <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
              <span>Thêm nhân viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Result Table Section ── */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white border-green-100">
        <SectionHeader
          title="Danh sách nhân viên"
          icon={<Users size={16} />}
          rightElement={
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-[10px] items-center flex font-black uppercase tracking-tight">
              {filteredData.length} bản ghi
            </span>
          }
        />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[12px] border-collapse min-w-[1300px]">
            <thead>
              {/* Grouped Header Row 1 */}
              <tr className="bg-green-50/40 text-gray-700 border-b">
                <th rowSpan={2} className="px-3 py-4 text-center w-12 font-black border-r border-b text-[10px]">STT</th>
                <th colSpan={6} className="px-4 py-2 text-center font-black border-r border-b bg-emerald-50/50 uppercase tracking-widest text-[9px] text-emerald-500">
                  Thông tin nhân sự
                </th>
                <th colSpan={2} className="px-4 py-2 text-center font-black border-r border-b bg-indigo-50/50 uppercase tracking-widest text-[9px] text-indigo-400">
                  Trạng thái
                </th>
                <th rowSpan={2} className="px-3 py-4 text-center w-36 font-black border-b text-[10px]">HÀNH ĐỘNG</th>
              </tr>
              {/* Grouped Header Row 2 */}
              <tr className="bg-green-50/10 text-gray-500 uppercase text-[9px] border-b">
                <th className="px-3 py-2.5 text-left border-r font-black">HỌ TÊN</th>
                <th className="px-3 py-2.5 text-left border-r font-black">SĐT</th>
                <th className="px-3 py-2.5 text-left border-r font-black w-32">USERNAME</th>
                <th className="px-3 py-2.5 text-center border-r font-black w-32">TÀI KHOẢN</th>
                <th className="px-3 py-2.5 text-left border-r font-black">TRẠM CỨU HỘ</th>
                <th className="px-3 py-2.5 text-center border-r font-black w-24">VAI TRÒ</th>
                <th className="px-3 py-2.5 text-center border-r font-black w-32 uppercase">Nhân viên</th>
                <th className="px-3 py-2.5 text-center border-r font-black w-24">TK EIM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((s, index) => (
                <tr key={s.id} className="hover:bg-green-50/20 transition-all border-b group">
                  {/* STT */}
                  <td className="px-3 py-4 text-center border-r font-black text-gray-400">{index + 1}</td>

                  {/* Thông tin nhân sự */}
                  <td className="px-3 py-4 border-r">
                    <span className="font-black text-gray-900 tracking-tight leading-none text-[12px] uppercase">{s.fullname}</span>
                  </td>
                  <td className="px-3 py-4 border-r text-gray-600 font-bold text-[11px]">{s.phone}</td>
                  <td className="px-3 py-4 border-r">
                    {s.account ? (
                      <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {s.account.username}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[11px] font-bold">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center border-r">{getAccountStatusBadge(s.account)}</td>
                  <td className="px-3 py-4 border-r font-bold text-[11px]">
                    {s.role === 'DRIVER' ? (
                      <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">{s.station}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center border-r">{getRoleBadge(s.role)}</td>
                  {/* Trạng thái hoạt động */}
                  <td className="px-3 py-4 text-center border-r">{getStaffStatusBadge(s.status)}</td>
                  <td className="px-3 py-4 text-center border-r">
                    {s.account ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-black border bg-green-50 text-green-600 border-green-200 whitespace-nowrap shadow-sm">
                        Đã tạo
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[11px] font-bold">—</span>
                    )}
                  </td>
                  
                  {/* Hành động */}
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-y-1">
                      {/* View */}
                      <button
                        onClick={() => handleManageAccount(s)}
                        className="text-blue-500 hover:scale-125 transition-all p-1.5 hover:bg-blue-50 rounded-full shadow-sm border border-transparent hover:border-blue-100"
                        title="Xem chi tiết"
                      >
                        <FileText size={14} />
                      </button>
                      {/* Transfer */}
                      <button
                        onClick={() => handleTransfer(s)}
                        className="text-orange-500 hover:scale-125 transition-all p-1.5 hover:bg-orange-50 rounded-full shadow-sm border border-transparent hover:border-orange-100"
                        title="Điều chuyển công tác"
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      {/* Account actions */}
                      {!s.account && (
                        <button
                          onClick={() => handleCreateAccount(s)}
                          className="text-amber-500 hover:scale-125 transition-all p-1.5 hover:bg-amber-50 rounded-full shadow-sm border border-transparent hover:border-amber-100"
                          title="Cấp tài khoản"
                        >
                          <KeyRound size={14} />
                        </button>
                      )}
                      {s.account?.accountStatus === 1 && (
                        <button
                          onClick={() => handleLockAccount(s)}
                          className="text-red-500 hover:scale-125 transition-all p-1.5 hover:bg-red-50 rounded-full shadow-sm border border-transparent hover:border-red-100"
                          title="Khóa tài khoản"
                        >
                          <Lock size={14} />
                        </button>
                      )}
                      {s.account?.accountStatus === 2 && (
                        <button
                          onClick={() => handleUnlockAccount(s)}
                          className="text-green-500 hover:scale-125 transition-all p-1.5 hover:bg-green-50 rounded-full shadow-sm border border-transparent hover:border-green-100"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Hiển thị 1 - {filteredData.length} / {filteredData.length} kết quả
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <button className="p-1.5 hover:bg-white rounded-md border border-gray-200 text-gray-300 transition-all hover:border-[#00A859] hover:text-[#00A859] group">
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#00A859] text-white font-black text-[11px] shadow-lg shadow-green-100 ring-2 ring-green-100">
                {currentPage}
              </button>
              <button className="p-1.5 hover:bg-white rounded-md border border-gray-200 text-gray-300 transition-all hover:border-[#00A859] hover:text-[#00A859] group">
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative group">
              <select className="border rounded-md px-3 py-1.5 text-[10px] bg-white outline-none font-black text-gray-600 appearance-none pr-8 cursor-pointer focus:border-[#00A859] transition-all shadow-sm group-hover:bg-gray-50">
                <option>10 / page</option>
                <option>20 / page</option>
                <option>50 / page</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 pointer-events-none text-gray-400 group-hover:text-[#00A859] transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AddStaffDialog isOpen={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)} />
      <ManageAccountDialog 
        isOpen={isManageAccountOpen} 
        onClose={() => setIsManageAccountOpen(false)} 
        staff={selectedStaff} 
        onLockClick={() => {
          if (selectedStaff) {
            handleLockAccount(selectedStaff);
          }
        }}
        onUnlockClick={() => {
          if (selectedStaff) {
            handleUnlockAccount(selectedStaff);
          }
        }}
      />
      <CreateAccountDialog isOpen={isCreateAccountOpen} onClose={() => setIsCreateAccountOpen(false)} staff={selectedStaff} />
      <LockUnlockDialog isOpen={isLockUnlockOpen} onClose={() => setIsLockUnlockOpen(false)} staff={selectedStaff} action={lockAction} />
      <TransferDialog isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} staff={selectedStaff} />
    </div>
  );
};

export default StaffManagement2;
