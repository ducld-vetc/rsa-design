
import React, { useState } from 'react';
import { Search, FileSpreadsheet, Edit, Plus, Info, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface OrderManagementProps {
  onViewDetails?: (orderId: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const SectionHeader = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 rounded-t-lg flex items-center space-x-2 font-medium text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search Section */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Mã đơn hàng</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Số điện thoại</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Biển số xe</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>
            
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Dịch vụ</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Đối tác</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Trạm cứu hộ</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Trạng thái đơn hàng</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-32 text-xs font-semibold text-gray-600">Trạng thái yêu cầu</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex-1 flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600">Từ ngày <span className="text-red-500">*</span></label>
                <div className="relative flex-1">
                  <input type="text" defaultValue="01/02/2026" className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-8" />
                  <Calendar size={14} className="absolute right-2 top-2 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600 text-right pr-4">Đến ngày <span className="text-red-500">*</span></label>
                <div className="relative flex-1">
                  <input type="text" defaultValue="28/02/2026" className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-8" />
                  <Calendar size={14} className="absolute right-2 top-2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button className="flex items-center space-x-2 bg-vetc-green text-white px-6 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
              <Search size={16} />
              <span>Tìm kiếm</span>
            </button>
            <button className="flex items-center space-x-2 bg-vetc-green text-white px-6 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
              <FileSpreadsheet size={16} />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-4 py-3 text-center w-12 font-bold">STT</th>
                <th className="px-4 py-3 text-center w-24 font-bold">Thao tác</th>
                <th className="px-4 py-3 text-left w-48 font-bold">Mã đơn hàng</th>
                <th colSpan={4} className="px-4 py-1 text-center font-bold border-l bg-gray-100/50">Thông tin đơn hàng</th>
                <th className="px-4 py-3 text-left font-bold border-l">Khách hàng</th>
              </tr>
              <tr className="bg-gray-50 border-b text-gray-500 text-[10px] uppercase">
                <th colSpan={3}></th>
                <th className="px-4 py-2 text-left border-l">Dịch vụ</th>
                <th className="px-4 py-2 text-center">Số lượng</th>
                <th className="px-4 py-2 text-right">Phí NCC</th>
                <th className="px-4 py-2 text-left">Trạng thái yêu cầu</th>
                <th className="px-4 py-2 text-left border-l">Trạng thái đơn hàng</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-center">1</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => onViewDetails?.('RS1HNO2602020001')}
                      className="text-orange-500 hover:scale-125 transition-transform p-1 hover:bg-orange-50 rounded-full"
                      title="Xem chi tiết"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-gray-800">RS1HNO2602020001</span>
                    <div className="flex space-x-1">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold">Đơn gói</span>
                      <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold">PORTAL</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 border-l">
                  <div className="max-w-[150px] leading-relaxed">
                    Miễn phí kéo xe trong phạm vi 100 km
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-medium">1</td>
                <td className="px-4 py-4 text-right font-bold text-gray-700">110.000 đ</td>
                <td className="px-4 py-4">
                  <span className="text-green-600 font-medium">Tạo đơn thành công</span>
                </td>
                <td className="px-4 py-4 border-l">
                  <div className="text-red-500 font-medium leading-relaxed">
                    Quá thời gian chờ đối tác nhận đơn
                  </div>
                </td>
                <td className="px-4 py-4">
                   <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Người mua:</span>
                      <span className="font-bold text-gray-800 uppercase">TRAN DINH LAN ANH</span>
                    </div>
                    <span className="text-gray-500">0960123123</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            1-1 của 1 đơn hàng
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 cursor-not-allowed"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-vetc-green text-white font-bold text-xs shadow-sm">1</button>
              <button className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 cursor-not-allowed"><ChevronRight size={16} /></button>
            </div>
            <select className="border rounded px-2 py-1 text-xs bg-white outline-none">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
