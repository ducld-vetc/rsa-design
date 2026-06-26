export interface BusinessRecord {
  id: number;
  code: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  taxId: string;
  customerGroup: 'OEM' | 'Tài chính' | 'Bảo hiểm' | 'Khác';
  customerType: 'B2B' | 'Phân phối' | 'Chiến lược';
  parentEnterprise: string | null;
  customerTier: 'Tiêu chuẩn' | 'VIP' | 'Hợp đồng';
  status: 'active' | 'inactive';
  updatedAt: string;
  updatedBy: string;
  createdAt: string;
  createdBy: string;
}

const BASE_MOCK_BUSINESSES: BusinessRecord[] = [
  {
    id: 1,
    code: 'DN001',
    name: 'CÔNG TY TNHH DỊCH VỤ VETC',
    address: 'Tầng 12, Tòa nhà VETC Tower, 18 Tam Trinh, Hai Bà Trưng, Hà Nội',
    contactName: 'NGUYỄN VĂN MINH',
    contactPhone: '0243 123 4567',
    contactEmail: 'minh.nv@vetc.com.vn',
    taxId: '0101234567',
    customerGroup: 'OEM',
    customerType: 'B2B',
    parentEnterprise: null,
    customerTier: 'VIP',
    status: 'active',
    updatedAt: '25/08/2025 14:30:12',
    updatedBy: 'admin_vetc',
    createdAt: '15/01/2025 09:00:00',
    createdBy: 'system',
  },
  {
    id: 2,
    code: 'DN002',
    name: 'FORD VIỆT NAM',
    address: 'Lô B2, KCN Long Bình, Phường Long Bình, TP. Thủ Đức, TP. HCM',
    contactName: 'TRẦN THỊ HƯƠNG',
    contactPhone: '0283 456 7890',
    contactEmail: 'huong.tt@ford.com.vn',
    taxId: '0309876543',
    customerGroup: 'OEM',
    customerType: 'Chiến lược',
    parentEnterprise: 'FORD MOTOR COMPANY',
    customerTier: 'Hợp đồng',
    status: 'active',
    updatedAt: '24/08/2025 16:45:00',
    updatedBy: 'rsa_test1',
    createdAt: '20/02/2025 10:15:30',
    createdBy: 'admin_vetc',
  },
  {
    id: 3,
    code: 'DN003',
    name: 'TOYOTA VIỆT NAM',
    address: 'Phường Phúc Thắng, Thành phố Phúc Yên, Vĩnh Phúc',
    contactName: 'LÊ VĂN ĐỨC',
    contactPhone: '0211 567 8901',
    contactEmail: 'duc.lv@toyota.com.vn',
    taxId: '2500123456',
    customerGroup: 'OEM',
    customerType: 'Chiến lược',
    parentEnterprise: 'TOYOTA MOTOR CORPORATION',
    customerTier: 'Hợp đồng',
    status: 'active',
    updatedAt: '23/08/2025 11:20:45',
    updatedBy: 'rsa_test1',
    createdAt: '10/03/2025 08:30:00',
    createdBy: 'admin_vetc',
  },
  {
    id: 4,
    code: 'DN004',
    name: 'HONDA VIỆT NAM',
    address: 'KCN Phúc Thắng, Phường Phúc Thắng, Vĩnh Phúc',
    contactName: 'PHẠM THỊ LAN',
    contactPhone: '0211 678 9012',
    contactEmail: 'lan.pt@honda.com.vn',
    taxId: '2500654321',
    customerGroup: 'OEM',
    customerType: 'Phân phối',
    parentEnterprise: 'HONDA MOTOR CO., LTD.',
    customerTier: 'VIP',
    status: 'active',
    updatedAt: '22/08/2025 09:10:22',
    updatedBy: 'hieund2',
    createdAt: '05/04/2025 14:00:00',
    createdBy: 'admin_vetc',
  },
  {
    id: 5,
    code: 'DN005',
    name: 'CÔNG TY TNHH ABC LOGISTICS',
    address: 'Số 45 Nguyễn Xiển, Thanh Xuân, Hà Nội',
    contactName: 'HOÀNG VĂN NAM',
    contactPhone: '0901 234 567',
    contactEmail: 'nam.hv@abc-logistics.vn',
    taxId: '0108765432',
    customerGroup: 'Khác',
    customerType: 'B2B',
    parentEnterprise: null,
    customerTier: 'Tiêu chuẩn',
    status: 'inactive',
    updatedAt: '20/08/2025 17:00:00',
    updatedBy: 'admin_vetc',
    createdAt: '01/06/2025 11:30:00',
    createdBy: 'rsa_test1',
  },
];

export const MOCK_BUSINESSES: BusinessRecord[] = Array.from({ length: 126 }, (_, index) => {
  const base = BASE_MOCK_BUSINESSES[index % BASE_MOCK_BUSINESSES.length];
  const id = index + 1;
  return {
    ...base,
    id,
    code: `DN${String(id).padStart(3, '0')}`,
    name: index < BASE_MOCK_BUSINESSES.length ? base.name : `${base.name} - CN ${id}`,
    taxId: `${base.taxId.slice(0, -3)}${String(id).padStart(3, '0')}`,
  };
});

export const getBusinessById = (id: number): BusinessRecord | undefined =>
  MOCK_BUSINESSES.find((b) => b.id === id);
