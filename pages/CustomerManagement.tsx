import React, { useEffect, useMemo, useState } from 'react';
import { Eye, FileSpreadsheet, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  CustomerRecord,
  INITIAL_CUSTOMERS,
  PURCHASE_ROLE_LABEL,
  PURCHASE_STATUS_LABEL,
  RESCUE_STATUS_LABEL,
} from '../data/customerManagementMockData';

const PAGE_SIZE = 10;

const formatMoney = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

const formatValidity = (activatedAt: string | null, expiredAt: string | null) => {
  if (activatedAt && expiredAt) return `${activatedAt} – ${expiredAt}`;
  if (activatedAt) return `Từ ${activatedAt}`;
  if (expiredAt) return `Đến ${expiredAt}`;
  return '—';
};

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  customerTiering: '',
  ecomCustomerId: '',
};

type FormState = typeof emptyForm;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [nameQuery, setNameQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [ecomQuery, setEcomQuery] = useState('');
  const [tierQuery, setTierQuery] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [appliedPhone, setAppliedPhone] = useState('');
  const [appliedEcom, setAppliedEcom] = useState('');
  const [appliedTier, setAppliedTier] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'packages' | 'rescues'>('info');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const name = appliedName.trim().toLowerCase();
    const phone = appliedPhone.trim();
    const ecom = appliedEcom.trim().toLowerCase();
    return customers.filter((customer) => {
      if (name && !(customer.name ?? '').toLowerCase().includes(name)) return false;
      if (phone && !customer.phone.includes(phone)) return false;
      if (ecom && !(customer.ecomCustomerId ?? '').toLowerCase().includes(ecom)) return false;
      if (appliedTier === 'VIP' && customer.customerTiering !== 'VIP') return false;
      if (appliedTier === 'NONE' && customer.customerTiering) return false;
      return true;
    });
  }, [customers, appliedName, appliedPhone, appliedEcom, appliedTier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [appliedName, appliedPhone, appliedEcom, appliedTier]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = customers.find((customer) => customer.customerId === selectedId) ?? null;

  const lookupEcomByPhone = () => {
    const phone = form.phone.trim();
    if (!phone) {
      setFormError('Nhập số điện thoại trước khi tra cứu Ecom.');
      return;
    }
    setFormError('');
    setIsLookingUp(true);
    window.setTimeout(() => {
      const matched = customers.find((customer) => customer.phone === phone && customer.ecomCustomerId)
        ?? customers.find((customer) => customer.phone === phone);
      setIsLookingUp(false);
      if (!matched) {
        setFormError('Không tìm thấy khách hàng với số điện thoại này trên Ecom.');
        return;
      }
      setForm((current) => ({
        ...current,
        phone,
        name: matched.name ?? '',
        email: matched.email ?? '',
        address: matched.address ?? '',
        ecomCustomerId: matched.ecomCustomerId ?? '',
      }));
    }, 500);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setEditingId(null);
    setFormMode('create');
  };

  const openEdit = (customer: CustomerRecord) => {
    setForm({
      name: customer.name ?? '',
      phone: customer.phone,
      email: customer.email ?? '',
      address: customer.address ?? '',
      customerTiering: customer.customerTiering ?? '',
      ecomCustomerId: customer.ecomCustomerId ?? '',
    });
    setFormError('');
    setEditingId(customer.customerId);
    setFormMode('edit');
  };

  const saveForm = () => {
    const phone = form.phone.trim();
    if (!phone) {
      setFormError('Số điện thoại là bắt buộc.');
      return;
    }
    const ecom = form.ecomCustomerId.trim();
    if (ecom && customers.some((customer) => customer.ecomCustomerId === ecom && customer.customerId !== editingId)) {
      setFormError('Mã khách hàng thương mại điện tử đã được dùng.');
      return;
    }

    const payload = {
      name: form.name.trim() || null,
      phone,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      customerTiering: form.customerTiering || null,
      ecomCustomerId: ecom || null,
    };

    if (formMode === 'create') {
      const nextId = Math.max(...customers.map((customer) => customer.customerId)) + 1;
      const created: CustomerRecord = {
        customerId: nextId,
        createdAt: new Date().toLocaleString('vi-VN', { hour12: false }),
        purchaseCount: 0,
        rescueCount: 0,
        purchases: [],
        rescues: [],
        ...payload,
      };
      setCustomers((prev) => [created, ...prev]);
      setSelectedId(nextId);
      setNotice(`Đã thêm khách hàng ${payload.name ?? phone}.`);
    } else if (editingId != null) {
      setCustomers((prev) =>
        prev.map((customer) => (customer.customerId === editingId ? { ...customer, ...payload } : customer)),
      );
      setSelectedId(editingId);
      setNotice('Đã cập nhật khách hàng.');
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.purchaseCount > 0 || deleteTarget.rescueCount > 0) {
      setNotice('Không xóa được khách hàng còn lịch sử mua gói hoặc lịch sử cứu hộ.');
      setDeleteTarget(null);
      return;
    }
    setCustomers((prev) => prev.filter((customer) => customer.customerId !== deleteTarget.customerId));
    if (selectedId === deleteTarget.customerId) setSelectedId(null);
    setNotice(`Đã xóa khách hàng ${deleteTarget.name ?? deleteTarget.phone}.`);
    setDeleteTarget(null);
  };

  const hasActiveFilters = Boolean(
    nameQuery.trim() || phoneQuery.trim() || ecomQuery.trim() || tierQuery || appliedName || appliedPhone || appliedEcom || appliedTier,
  );

  const applySearch = () => {
    setAppliedName(nameQuery);
    setAppliedPhone(phoneQuery);
    setAppliedEcom(ecomQuery);
    setAppliedTier(tierQuery);
    setPage(1);
  };

  const clearFilters = () => {
    setNameQuery('');
    setPhoneQuery('');
    setEcomQuery('');
    setTierQuery('');
    setAppliedName('');
    setAppliedPhone('');
    setAppliedEcom('');
    setAppliedTier('');
    setPage(1);
  };

  const exportExcel = () => {
    const rows = filtered.map((customer) => ({
      'Mã KH': customer.customerId,
      'Họ tên': customer.name ?? '',
      'Số điện thoại': customer.phone,
      Email: customer.email ?? '',
      'Mã Ecom': customer.ecomCustomerId ?? '',
      'Địa chỉ': customer.address ?? '',
      Hạng: customer.customerTiering ?? '',
      'Số gói': customer.purchaseCount,
      'Số đơn cứu hộ': customer.rescueCount,
      'Ngày tạo': customer.createdAt,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 'Mã KH': '' }]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Khach hang');
    XLSX.writeFile(book, 'danh-sach-khach-hang.xlsx');
  };

  const inputClass =
    'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Quản lý khách hàng</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-vetc-green text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700"
        >
          <Plus size={16} />
          Thêm khách hàng
        </button>
      </div>

      {notice && (
        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 flex items-center justify-between">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-blue-500">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="bg-vetc-green text-white px-4 py-2 flex items-center gap-2 font-bold text-sm uppercase tracking-wide">
          <Search size={16} />
          Tra cứu
        </div>
        <form
          className="p-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Họ tên</label>
              <input value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} placeholder="Nhập tên" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input value={phoneQuery} onChange={(e) => setPhoneQuery(e.target.value)} placeholder="Nhập số điện thoại" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mã Ecom</label>
              <input value={ecomQuery} onChange={(e) => setEcomQuery(e.target.value)} placeholder="Nhập mã Ecom" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hạng khách hàng</label>
              <select value={tierQuery} onChange={(e) => setTierQuery(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Tất cả</option>
                <option value="VIP">VIP</option>
                <option value="NONE">Chưa phân hạng</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={exportExcel}
              className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
            >
              <FileSpreadsheet size={16} />
              <span>Xuất Excel</span>
            </button>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center space-x-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded font-bold text-sm hover:border-vetc-green hover:text-vetc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
              >
                <Trash2 size={14} className="text-blue-500" />
                <span>Xóa lọc</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
        <div className="bg-vetc-green text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
          Danh sách khách hàng ({filtered.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center font-bold border-r w-12">STT</th>
                <th className="px-3 py-2 text-center font-bold border-r w-28">Thao tác</th>
                <th className="px-3 py-2 text-left font-bold border-r w-24">Mã KH</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Họ tên</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Số điện thoại</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Địa chỉ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-24">Hạng</th>
                <th className="px-3 py-2 text-right font-bold border-r w-20">Số gói</th>
                <th className="px-3 py-2 text-right font-bold border-r w-24">Số đơn cứu hộ</th>
                <th className="px-3 py-2 text-left font-bold w-36">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map((customer, index) => (
                <tr
                  key={customer.customerId}
                  className={selectedId === customer.customerId ? 'bg-green-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-3 py-2 text-center border-r">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-3 py-2 border-r">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" title="Xem chi tiết" onClick={() => { setDetailTab('info'); setSelectedId(customer.customerId); }} className="p-1.5 rounded hover:bg-white text-blue-600">
                        <Eye size={14} />
                      </button>
                      <button type="button" title="Sửa" onClick={() => openEdit(customer)} className="p-1.5 rounded hover:bg-white text-amber-600">
                        <Pencil size={14} />
                      </button>
                      <button type="button" title="Xóa" onClick={() => setDeleteTarget(customer)} className="p-1.5 rounded hover:bg-white text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r font-semibold text-gray-800">{customer.customerId}</td>
                  <td className="px-3 py-2 border-r font-semibold text-gray-800">{customer.name || '—'}</td>
                  <td className="px-3 py-2 border-r">{customer.phone}</td>
                  <td className="px-3 py-2 border-r text-gray-600">{customer.address || '—'}</td>
                  <td className="px-3 py-2 border-r">{customer.customerTiering || '—'}</td>
                  <td className="px-3 py-2 border-r text-right tabular-nums">{customer.purchaseCount}</td>
                  <td className="px-3 py-2 border-r text-right tabular-nums">{customer.rescueCount}</td>
                  <td className="px-3 py-2 text-gray-600">{customer.createdAt}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                    Không có khách hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
          <span>
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Trước
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Sau
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
              <p className="font-bold text-gray-800">Chi tiết khách hàng {selected.customerId}</p>
              <button type="button" onClick={() => setSelectedId(null)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="px-4 pt-3 border-b flex gap-1 shrink-0">
              {([
                ['info', 'Thông tin'],
                ['packages', `Lịch sử mua gói (${selected.purchaseCount})`],
                ['rescues', `Lịch sử cứu hộ (${selected.rescueCount})`],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDetailTab(id)}
                  className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px ${
                    detailTab === id ? 'border-vetc-green text-vetc-green' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto p-4">
          {detailTab === 'info' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <Info label="Số điện thoại" value={selected.phone} />
            <Info label="Họ tên" value={selected.name} />
            <Info label="Email" value={selected.email} />
            <Info label="Hạng" value={selected.customerTiering} />
            <Info label="Địa chỉ" value={selected.address} />
            <Info label="Mã Ecom" value={selected.ecomCustomerId} />
            <Info label="Ngày tạo" value={selected.createdAt} />
          </div>
          )}

          {detailTab === 'packages' && (
            <HistoryBlock
              title="Lịch sử mua gói"
              hint={`Hiển thị ${selected.purchases.length} gói gần nhất / tổng ${selected.purchaseCount} gói.`}
            >
              <table className="w-full text-xs border-collapse min-w-[980px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="px-3 py-2 text-left font-bold border-b">Mã mua gói</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Tên gói</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Biển số xe</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Trạng thái</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Vai trò</th>
                    <th className="px-3 py-2 text-right font-bold border-b">Giá cuối</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Thời gian hiệu lực</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.purchases.map((purchase) => (
                    <tr key={purchase.purchaseCode} className="border-b border-gray-100">
                      <td className="px-3 py-2 font-semibold">{purchase.purchaseCode}</td>
                      <td className="px-3 py-2">{purchase.packageName}</td>
                      <td className="px-3 py-2">{purchase.plate || '—'}</td>
                      <td className="px-3 py-2">{PURCHASE_STATUS_LABEL[purchase.status] ?? purchase.status}</td>
                      <td className="px-3 py-2">{PURCHASE_ROLE_LABEL[purchase.role]}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatMoney(purchase.finalPrice)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatValidity(purchase.activatedAt, purchase.expiredAt)}</td>
                      <td className="px-3 py-2">{purchase.voucherCode || '—'}</td>
                    </tr>
                  ))}
                  {selected.purchases.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-gray-400">Chưa có gói.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </HistoryBlock>
          )}

          {detailTab === 'rescues' && (
            <HistoryBlock
              title="Lịch sử cứu hộ"
              hint={`Hiển thị ${selected.rescues.length} đơn gần nhất / tổng ${selected.rescueCount} đơn.`}
            >
              <table className="w-full text-xs border-collapse min-w-[980px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="px-3 py-2 text-left font-bold border-b">Mã đơn</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Trạng thái</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Biển số xe</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Dịch vụ</th>
                    <th className="px-3 py-2 text-right font-bold border-b">Số tiền</th>
                    <th className="px-3 py-2 text-left font-bold border-b">Thời điểm tạo</th>
                    <th className="px-3 py-2 text-left font-bold border-b">OSA</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.rescues.map((rescue) => (
                    <tr key={rescue.rescueOrderCode} className="border-b border-gray-100 align-top">
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">{rescue.rescueOrderCode}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{RESCUE_STATUS_LABEL[rescue.status] ?? rescue.status}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{rescue.plate || '—'}</td>
                      <td className="px-3 py-2">{rescue.services || '—'}</td>
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{rescue.amount == null ? '—' : formatMoney(rescue.amount)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{rescue.createdAt}</td>
                      <td className="px-3 py-2">{rescue.osa || '—'}</td>
                    </tr>
                  ))}
                  {selected.rescues.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-400">Chưa có đơn cứu hộ.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </HistoryBlock>
          )}
            </div>
          </div>
        </div>
      )}

      {formMode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="font-bold text-gray-800">{formMode === 'create' ? 'Thêm khách hàng' : 'Sửa khách hàng'}</p>
              <button type="button" onClick={() => setFormMode(null)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Số điện thoại *</label>
                <div className="flex gap-2">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={lookupEcomByPhone}
                    disabled={isLookingUp}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded border border-vetc-green text-vetc-green text-sm font-bold hover:bg-green-50 disabled:opacity-50"
                  >
                    <Search size={14} className={isLookingUp ? 'animate-spin' : ''} />
                    {isLookingUp ? 'Đang tìm' : 'Tra cứu'}
                  </button>
                </div>
              </div>
              <Field label="Họ tên" value={form.name} placeholder="Nhập họ tên" onChange={(value) => setForm({ ...form, name: value })} />
              <Field label="Email" value={form.email} placeholder="Nhập email" onChange={(value) => setForm({ ...form, email: value })} />
              <div className="sm:col-span-2">
                <Field label="Địa chỉ" value={form.address} placeholder="Nhập địa chỉ" onChange={(value) => setForm({ ...form, address: value })} />
              </div>
              <Field label="Mã Ecom" value={form.ecomCustomerId} placeholder="Điền sau khi tra cứu Ecom" onChange={(value) => setForm({ ...form, ecomCustomerId: value })} />
              <div>
                <label className={labelClass}>Hạng</label>
                <select
                  value={form.customerTiering}
                  onChange={(e) => setForm({ ...form, customerTiering: e.target.value })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Chọn hạng khách hàng</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            {formError && <p className="px-4 pb-2 text-sm text-red-600">{formError}</p>}
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setFormMode(null)} className="px-4 py-2 border rounded text-sm font-semibold">
                Hủy
              </button>
              <button type="button" onClick={saveForm} className="px-4 py-2 rounded bg-vetc-green text-white text-sm font-bold">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 space-y-3">
            <p className="font-bold text-gray-800">Xóa khách hàng {deleteTarget.name ?? deleteTarget.phone}?</p>
            <p className="text-sm text-gray-600">
              {deleteTarget.purchaseCount > 0 || deleteTarget.rescueCount > 0
                ? `Khách này còn ${deleteTarget.purchaseCount} gói và ${deleteTarget.rescueCount} đơn cứu hộ. Hệ thống không xóa khách còn lịch sử.`
                : 'Khách hàng chưa có gói và chưa có đơn cứu hộ.'}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border rounded text-sm font-semibold">
                Hủy
              </button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white text-sm font-bold">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-bold uppercase text-gray-400">{label}</p>
    <p className="text-gray-800 break-all">{value || '—'}</p>
  </div>
);

const HistoryBlock: React.FC<{ title: string; hint: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <div>
    <h2 className="text-sm font-black text-gray-800 uppercase">{title}</h2>
    <p className="text-[11px] text-gray-500 mb-2">{hint}</p>
    <div className="overflow-x-auto border rounded">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: string; placeholder: string; onChange: (value: string) => void }> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400"
    />
  </div>
);

export default CustomerManagement;
