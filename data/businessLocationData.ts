export const PROVINCE_WARDS: Record<string, string[]> = {
  'Hà Nội': ['Quận Hai Bà Trưng', 'Quận Long Biên', 'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Thanh Xuân'],
  'TP. Hồ Chí Minh': ['Phường Long Bình', 'Quận Bình Thạnh', 'Quận 1', 'TP. Thủ Đức'],
  'Vĩnh Phúc': ['Phường Phúc Thắng', 'Thành phố Phúc Yên'],
  'Hải Phòng': ['Quận Hồng Bàng', 'Quận Ngô Quyền'],
  'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê'],
};

export const PROVINCES = Object.keys(PROVINCE_WARDS);

export const getWardsByProvince = (province: string): string[] => PROVINCE_WARDS[province] ?? [];
