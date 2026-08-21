import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, Info, KeyRound, Lock, Plus, RefreshCw, Search, Unlock } from 'lucide-react';
import * as XLSX from 'xlsx';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import { FileDrop, PartnerModal, partnerBtnBrand, partnerBtnNeutral } from '../components/PartnerModal';
import {
  ORG_NODES,
  PARTNER_STAFF,
  ROLE_LABEL,
  STAFF_WORK_STATUS_LABEL,
  STATION_OPTIONS,
  nextStaffCode,
  orgName,
  registerStaff,
  staffAccountLabel,
  staffDocsOf,
  staffUsername,
  staffWorkStatusOf,
  updateStaff,
  type PartnerPersona,
  type PartnerRole,
  type PartnerStaffRecord,
} from '../data/partnerRescueMockData';

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

const fieldClass = 'flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white';

const IMPORT_HEADERS = [
  'Họ tên',
  'Mã NV',
  'CCCD',
  'SĐT',
  'Email',
  'Địa chỉ',
  'Vai trò',
  'Đơn vị',
  'Trạm',
  'Báo giá',
  'Cứu hộ',
] as const;

type ImportPreviewRow = {
  fullname: string;
  code: string;
  cccd: string;
  phone: string;
  email: string;
  address: string;
  role: PartnerRole;
  orgNodeId: string;
  stationId: string | null;
  canQuote: boolean;
  canRescue: boolean;
  accountCreateFailed: boolean;
  error?: string;
};

const ROLE_BY_LABEL: Record<string, PartnerRole> = Object.fromEntries(
  (Object.entries(ROLE_LABEL) as [PartnerRole, string][]).map(([k, v]) => [v.toLowerCase(), k])
);

const cell = (row: Record<string, unknown>, ...keys: string[]) => {
  const map = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v]));
  for (const key of keys) {
    const v = map[key.toLowerCase()];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const isBlankImportRow = (row: Record<string, unknown>) =>
  Object.values(row).every((v) => String(v ?? '').trim() === '');

const parseBool = (raw: string, fallback = false) => {
  const v = raw.trim().toLowerCase();
  if (!v) return fallback;
  return v === 'có' || v === 'co' || v === '1' || v === 'true' || v === 'yes';
};

const parseRole = (raw: string): PartnerRole | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return 'NVCH';
  if (ROLE_BY_LABEL[v]) return ROLE_BY_LABEL[v];
  const key = v.toUpperCase();
  if (key in ROLE_LABEL) return key as PartnerRole;
  return null;
};

const parseOrg = (raw: string): string | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  return ORG_NODES.find((n) => n.id === raw.trim() || n.name.toLowerCase() === v || n.name.toLowerCase().includes(v))?.id ?? null;
};

const parseStation = (raw: string): string | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  return STATION_OPTIONS.find((s) => s.id === raw.trim() || s.name.toLowerCase() === v || s.name.toLowerCase().includes(v))?.id ?? null;
};

const parseImportRows = (rows: Record<string, unknown>[], existingCodes: Set<string>): ImportPreviewRow[] =>
  rows.filter((row) => !isBlankImportRow(row)).map((row) => {
    const fullname = cell(row, 'Họ tên', 'Ho ten', 'fullname');
    const code = cell(row, 'Mã NV', 'Ma NV', 'code');
    const phone = cell(row, 'SĐT', 'SDT', 'Điện thoại', 'phone');
    const role = parseRole(cell(row, 'Vai trò', 'Vai tro', 'role'));
    const orgNodeId = parseOrg(cell(row, 'Đơn vị', 'Don vi'));
    const stationId = parseStation(cell(row, 'Trạm', 'Tram', 'Trạm cứu hộ'));
    let error = '';
    if (!fullname) error = 'Thiếu họ tên';
    else if (code && existingCodes.has(code.toLowerCase())) error = 'Mã NV đã tồn tại';
    else if (!role) error = 'Vai trò không hợp lệ';
    else if (!orgNodeId) error = 'Không khớp đơn vị';
    return {
      fullname,
      code,
      cccd: cell(row, 'CCCD') || '—',
      phone,
      email: cell(row, 'Email'),
      address: cell(row, 'Địa chỉ', 'Dia chi') || '—',
      role: role ?? 'NVCH',
      orgNodeId: orgNodeId ?? '',
      stationId,
      canQuote: parseBool(cell(row, 'Báo giá', 'Bao gia')),
      canRescue: parseBool(cell(row, 'Cứu hộ', 'Cuu ho'), true),
      accountCreateFailed: !phone,
      error: error || undefined,
    };
  });

const downloadStaffTemplate = () => {
  const sample = [
    {
      'Họ tên': 'Nguyễn Văn Demo',
      'Mã NV': '',
      'CCCD': '001080012345',
      'SĐT': '0912 345 678',
      'Email': 'demo.nv@carpla.vn',
      'Địa chỉ': 'Hoàng Mai',
      'Vai trò': 'Nhân viên cứu hộ',
      'Đơn vị': 'Trạm Hoàng Mai',
      'Trạm': 'Trạm Hoàng Mai',
      'Báo giá': 'Không',
      'Cứu hộ': 'Có',
    },
    {
      'Họ tên': 'Trần Thị Lỗi SSO',
      'Mã NV': '',
      'CCCD': '001080054321',
      'SĐT': '',
      'Email': '',
      'Địa chỉ': 'Hà Đông',
      'Vai trò': 'Nhân viên cứu hộ',
      'Đơn vị': 'Trạm Hà Đông',
      'Trạm': 'Trạm Hà Đông',
      'Báo giá': 'Không',
      'Cứu hộ': 'Có',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: [...IMPORT_HEADERS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachNV');
  XLSX.writeFile(wb, 'mau_import_nhan_vien.xlsx');
};

const accountBadgeClass = (s: PartnerStaffRecord) => {
  if (s.accountCreateFailed) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (!s.hasAccount) return 'bg-gray-50 text-gray-500 border-gray-200';
  if (s.accountLocked) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-green-50 text-green-700 border-green-200';
};

const PartnerStaff: React.FC = () => {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [staffList, setStaffList] = useState<PartnerStaffRecord[]>([...PARTNER_STAFF]);
  const [q, setQ] = useState('');
  const [code, setCode] = useState('');
  const [contact, setContact] = useState('');
  const [roleFilter, setRoleFilter] = useState<PartnerRole | ''>('');
  const [orgFilter, setOrgFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importError, setImportError] = useState('');
  const [lockOf, setLockOf] = useState<PartnerStaffRecord | null>(null);
  const [retryOf, setRetryOf] = useState<PartnerStaffRecord | null>(null);
  const [resetOf, setResetOf] = useState<PartnerStaffRecord | null>(null);
  const [notice, setNotice] = useState('');

  const canManage = persona.role !== 'NVCH' && persona.role !== 'KT';

  const rows = useMemo(() => {
    let list = staffList.filter((s) => {
      if (persona.stationIds.length === 0) return true;
      if (s.stationId) return persona.stationIds.includes(s.stationId);
      if (persona.role === 'GDCN' || persona.role === 'QLVUNG') {
        return s.orgNodeId === 'cn-hn' || s.orgNodeId === 'vung-hn';
      }
      if (persona.role === 'GDM') {
        return ['mien-bac', 'cn-hn', 'cn-hp', 'vung-hn', 'vung-hp'].includes(s.orgNodeId);
      }
      return false;
    });
    if (persona.role === 'NVCH') list = list.filter((s) => s.id === 's6');
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((x) => x.fullname.toLowerCase().includes(s));
    }
    if (code.trim()) {
      const s = code.toLowerCase();
      list = list.filter((x) => x.code.toLowerCase().includes(s));
    }
    if (contact.trim()) {
      const s = contact.toLowerCase().replace(/\s/g, '');
      list = list.filter((x) =>
        staffUsername(x.code).includes(s) || x.phone.toLowerCase().replace(/\s/g, '').includes(s)
      );
    }
    if (roleFilter) list = list.filter((x) => x.role === roleFilter);
    if (orgFilter) list = list.filter((x) => x.orgNodeId === orgFilter);
    if (stationFilter) list = list.filter((x) => x.stationId === stationFilter);
    return list;
  }, [persona, staffList, q, code, contact, roleFilter, orgFilter, stationFilter]);

  const patchStaff = (id: string, patch: Partial<PartnerStaffRecord>) => {
    updateStaff(id, patch);
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportRows([]);
    setImportError('');
  };

  const onImportFile = async (file: File | null) => {
    setImportFile(file);
    setImportRows([]);
    setImportError('');
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        setImportError('File không có sheet dữ liệu.');
        return;
      }
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }).filter((row) => !isBlankImportRow(row));
      if (json.length === 0) {
        setImportError('Không có dòng dữ liệu. Dùng file mẫu để xem cột bắt buộc.');
        return;
      }
      const existing = new Set(staffList.map((s) => s.code.toLowerCase()));
      const parsed = parseImportRows(json, existing);
      const seen = new Set<string>();
      parsed.forEach((r) => {
        const key = r.code.toLowerCase();
        if (r.code && seen.has(key) && !r.error) r.error = 'Trùng mã NV trong file';
        if (r.code) seen.add(key);
      });
      setImportRows(parsed);
    } catch {
      setImportError('Không đọc được file. Chỉ hỗ trợ .xlsx, .xls, .csv.');
    }
  };

  const confirmImport = () => {
    const valid = importRows.filter((r) => !r.error);
    if (valid.length === 0) return;
    const created: PartnerStaffRecord[] = valid.map((r, i) => {
      const org = ORG_NODES.find((n) => n.id === r.orgNodeId);
      const stationId = r.stationId || (org?.isStation ? r.orgNodeId : null);
      const seq = Number(nextStaffCode().replace(/\D/g, '')) + i;
      return {
        id: `s-imp-${Date.now()}-${i}`,
        code: r.code || `CP-${String(seq).padStart(4, '0')}`,
        fullname: r.fullname,
        phone: r.phone || '—',
        cccd: r.cccd,
        address: r.address,
        role: r.role,
        orgNodeId: r.orgNodeId,
        stationId,
        licenseType: '—',
        licenseIssued: '—',
        licenseExpiry: '—',
        craneCert: false,
        hasAccount: !r.accountCreateFailed,
        canQuote: r.canQuote,
        canRescue: r.canRescue,
        email: r.email,
        accountCreateFailed: r.accountCreateFailed,
        workStatus: 'active',
      };
    });
    created.slice().reverse().forEach(registerStaff);
    setStaffList((prev) => [...created, ...prev]);
    closeImport();
    const failed = created.filter((s) => s.accountCreateFailed).length;
    setNotice(
      failed > 0
        ? `Đã nạp ${created.length} nhân viên. ${failed} người lỗi tạo tài khoản SSO — dùng Retry trên danh sách.`
        : `Đã nạp ${created.length} nhân viên.`
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Quản lý nhân viên</h1>

      <PartnerScopeBar persona={persona} onChange={setPersona} />

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Họ tên</label>
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nguyễn Văn A" className={fieldClass} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Mã NV</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CP-0201" className={fieldClass} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Username / SĐT</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="cp.0201 hoặc 0906" className={fieldClass} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Vai trò</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as PartnerRole | '')} className={fieldClass}>
                <option value="">Tất cả</option>
                {(Object.keys(ROLE_LABEL) as PartnerRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Đơn vị</label>
              <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className={fieldClass}>
                <option value="">Tất cả</option>
                {ORG_NODES.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Trạm cứu hộ</label>
              <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)} className={fieldClass}>
                <option value="">Tất cả</option>
                {STATION_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    className="flex items-center space-x-2 border border-vetc-green bg-white text-vetc-green px-5 py-2 rounded font-bold text-sm hover:bg-green-50 transition-all shadow-sm"
                  >
                    <Download size={16} />
                    <span>Import Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/partner/staff/new')}
                    className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    <span>Thêm nhân viên</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button type="button" className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
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
          <table className="w-full text-xs border-collapse min-w-[1080px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                <th className="px-3 py-2 text-center w-36 font-bold border-r">Hành động</th>
                <th className="px-3 py-2 text-left font-bold border-r">Nhân viên</th>
                <th className="px-3 py-2 text-left font-bold border-r">Vai trò</th>
                <th className="px-3 py-2 text-left font-bold border-r">Đơn vị / Trạm</th>
                <th className="px-3 py-2 text-left font-bold border-r">SĐT</th>
                <th className="px-3 py-2 text-center font-bold border-r">Tài khoản</th>
                <th className="px-3 py-2 text-left font-bold">Bằng / chứng chỉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((s, index) => (
                <tr key={s.id} className="hover:bg-gray-50/80 align-top">
                  <td className="px-3 py-3 text-center border-r text-gray-600">{index + 1}</td>
                  <td className="px-3 py-3 border-r">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/partner/staff/${s.id}`)}
                        className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Info size={15} />
                      </button>
                      {canManage && s.hasAccount && (
                        <button
                          type="button"
                          onClick={() => setResetOf(s)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                          title="Reset mật khẩu"
                        >
                          <KeyRound size={15} />
                        </button>
                      )}
                      {canManage && s.hasAccount && !s.accountLocked && (
                        <button
                          type="button"
                          onClick={() => setLockOf(s)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Khóa tài khoản"
                        >
                          <Lock size={15} />
                        </button>
                      )}
                      {canManage && s.hasAccount && s.accountLocked && (
                        <button
                          type="button"
                          onClick={() => setLockOf(s)}
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock size={15} />
                        </button>
                      )}
                      {canManage && s.accountCreateFailed && (
                        <button
                          type="button"
                          onClick={() => setRetryOf(s)}
                          className="text-amber-600 hover:bg-amber-50 p-1 rounded transition-colors"
                          title="Retry tạo tài khoản"
                        >
                          <RefreshCw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r">
                    <div className="font-bold text-gray-800">{s.fullname}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{s.code} · {staffUsername(s.code)}</div>
                    {staffWorkStatusOf(s) !== 'active' && (
                      <span className="mt-1 inline-flex rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-black text-amber-700">
                        {STAFF_WORK_STATUS_LABEL[staffWorkStatusOf(s)]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 border-r">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-green-50 text-green-700 border-green-200">
                      {ROLE_LABEL[s.role]}
                    </span>
                  </td>
                  <td className="px-3 py-3 border-r font-medium text-gray-700">
                    {s.stationId ? orgName(s.stationId) : orgName(s.orgNodeId)}
                  </td>
                  <td className="px-3 py-3 border-r text-gray-700">{s.phone}</td>
                  <td className="px-3 py-3 border-r text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${accountBadgeClass(s)}`}>
                      {staffAccountLabel(s)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-700">
                    {(() => {
                      const names = staffDocsOf(s.id).map((d) => d.type);
                      return names.length > 0 ? names.join(' · ') : <span className="text-gray-400">—</span>;
                    })()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-gray-400">Không có nhân viên trong phạm vi đăng nhập</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PartnerModal
        open={!!lockOf}
        title={lockOf?.accountLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        icon={lockOf?.accountLocked ? <Unlock size={20} /> : <Lock size={20} />}
        onClose={() => setLockOf(null)}
        footer={(
          <>
            <button type="button" onClick={() => setLockOf(null)} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={() => {
                if (!lockOf) return;
                const nextLocked = !lockOf.accountLocked;
                patchStaff(lockOf.id, { accountLocked: nextLocked });
                setLockOf(null);
                setNotice(nextLocked ? `Đã khóa tài khoản ${lockOf.fullname}.` : `Đã mở khóa tài khoản ${lockOf.fullname}.`);
              }}
              className={partnerBtnBrand}
            >
              Xác nhận
            </button>
          </>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">
          {lockOf?.accountLocked
            ? `Mở khóa SSO cho ${lockOf?.fullname} (${lockOf ? staffUsername(lockOf.code) : ''})?`
            : `Khóa tài khoản ${lockOf?.fullname}? Người dùng sẽ không đăng nhập app được đến khi mở khóa.`}
        </p>
      </PartnerModal>

      <PartnerModal
        open={!!resetOf}
        title="Reset mật khẩu"
        icon={<KeyRound size={20} />}
        onClose={() => setResetOf(null)}
        footer={(
          <>
            <button type="button" onClick={() => setResetOf(null)} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={() => {
                if (!resetOf) return;
                setNotice(`Đã gửi mật khẩu mới tới ${resetOf.phone}.`);
                setResetOf(null);
              }}
              className={partnerBtnBrand}
            >
              Gửi mật khẩu mới
            </button>
          </>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">
          Reset mật khẩu SSO của <strong>{resetOf?.fullname}</strong> và gửi thông tin đăng nhập mới qua SĐT <strong>{resetOf?.phone}</strong>.
        </p>
      </PartnerModal>

      <PartnerModal
        open={!!retryOf}
        title="Retry tạo tài khoản"
        icon={<RefreshCw size={20} />}
        onClose={() => setRetryOf(null)}
        footer={(
          <>
            <button type="button" onClick={() => setRetryOf(null)} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={() => {
                if (!retryOf) return;
                patchStaff(retryOf.id, { hasAccount: true, accountCreateFailed: false, accountLocked: false });
                setRetryOf(null);
                setNotice(`Tạo tài khoản SSO thành công cho ${retryOf.fullname}. Thông tin đã gửi qua SĐT.`);
              }}
              className={partnerBtnBrand}
            >
              Gọi lại SSO
            </button>
          </>
        )}
      >
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          Lần gọi Keycloak/SSO trước đó bị lỗi. Retry tạo lại tài khoản và gửi mật khẩu qua SĐT.
        </p>
        <p className="text-[12px] font-semibold text-gray-700">
          {retryOf?.fullname} · {retryOf ? staffUsername(retryOf.code) : ''} · {retryOf?.phone}
        </p>
      </PartnerModal>

      <PartnerModal
        open={importOpen}
        title="Import Excel nhân viên"
        icon={<FileSpreadsheet size={20} />}
        wide
        xl
        onClose={closeImport}
        footer={(
          <>
            <button type="button" onClick={closeImport} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={importRows.filter((r) => !r.error).length === 0}
              className={partnerBtnBrand}
            >
              Nạp {importRows.filter((r) => !r.error).length} nhân viên
            </button>
          </>
        )}
      >
        <p className="mb-3 text-[11px] text-gray-500">
          Tải file mẫu, điền danh sách rồi upload. Mã NV trống thì hệ thống tự cấp. Dòng thiếu SĐT vẫn nạp hồ sơ nhưng <strong>tạo tài khoản SSO sẽ lỗi</strong> — dùng Retry trên danh sách.
        </p>
        <button
          type="button"
          onClick={downloadStaffTemplate}
          className="mb-4 inline-flex items-center gap-1.5 rounded border border-vetc-green px-3 py-1.5 text-[11px] font-bold text-vetc-green hover:bg-green-50"
        >
          <Download size={14} /> Tải file mẫu
        </button>
        <FileDrop accept=".xlsx,.xls,.csv" file={importFile} hint="xlsx, xls, csv" onFile={(f) => { void onImportFile(f); }} />
        {importError && <p className="mt-3 text-[12px] font-semibold text-red-600">{importError}</p>}
        {importRows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-2 py-1.5 whitespace-nowrap">Họ tên</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">SĐT</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Vai trò</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Đơn vị</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Tài khoản</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {importRows.map((r, i) => (
                  <tr key={`${r.fullname}-${i}`} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 font-bold whitespace-nowrap">{r.fullname || '—'}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.phone || '—'}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{ROLE_LABEL[r.role]}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.orgNodeId ? orgName(r.orgNodeId) : '—'}</td>
                    <td className={`px-2 py-1.5 font-bold whitespace-nowrap ${r.accountCreateFailed ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {r.error ? '—' : r.accountCreateFailed ? 'Lỗi tạo TK' : 'Sẽ cấp TK'}
                    </td>
                    <td className={`px-2 py-1.5 font-bold whitespace-nowrap ${r.error ? 'text-red-600' : 'text-emerald-600'}`}>
                      {r.error ?? 'Hợp lệ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PartnerModal>

      <PartnerModal
        open={!!notice}
        title="Thông báo"
        icon={<FileSpreadsheet size={20} />}
        onClose={() => setNotice('')}
        footer={(
          <button type="button" onClick={() => setNotice('')} className={partnerBtnBrand}>Đóng</button>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">{notice}</p>
      </PartnerModal>
    </div>
  );
};

export default PartnerStaff;
