
import React from 'react';
import { CheckCircle, Hash } from 'lucide-react';
import { FormData } from '../types';

interface RescueConfirmationProps {
  data: FormData;
  onNext: () => void;
  onBack: () => void;
}

const RescueConfirmation: React.FC<RescueConfirmationProps> = ({ data, onNext, onBack }) => {
  const SummaryBlock = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-800 text-sm border-b pb-1 uppercase tracking-tight">{title}</h3>
      {children}
    </div>
  );

  const SummaryItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex text-sm">
      <span className="text-gray-500 w-48 shrink-0">{label}:</span>
      <span className="text-gray-800 font-bold">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-vetc-green text-white px-4 py-2 rounded-t-lg flex items-center justify-between font-medium">
        <div className="flex items-center space-x-2">
          <CheckCircle size={18} />
          <span>Xác nhận thông tin đơn hàng</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/20 text-xs backdrop-blur-sm border border-white/30">
          <Hash size={10} />
          <span className="font-bold tracking-tight">Mã đơn: {data.orderId}</span>
        </div>
      </div>
      
      <div className="p-6 border rounded-b-lg space-y-8 bg-gray-50/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <SummaryBlock title="Thông tin khách hàng & Xe">
            <SummaryItem label="Tên khách hàng" value={data.customer.name} />
            <SummaryItem label="Số điện thoại" value={data.customer.phone} />
            <SummaryItem label="Biển số xe" value={data.customer.plate} />
            <SummaryItem label="Gói dịch vụ" value={data.customer.servicePackage} />
            <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
              <SummaryItem label="Số khung (VIN)" value={data.customer.vin} />
              <SummaryItem label="Hãng xe" value={data.customer.vehicleBrand} />
              <SummaryItem label="Dòng xe" value={data.customer.vehicleLine} />
              <SummaryItem label="Trọng tải / Chỗ" value={`${data.customer.payload} Tấn / ${data.customer.seats} Chỗ`} />
            </div>
          </SummaryBlock>

          <SummaryBlock title="Thông tin cứu hộ">
            <SummaryItem label="Người nhận cứu hộ" value={data.assistance.rescueName} />
            <SummaryItem label="SĐT nhận cứu hộ" value={data.assistance.rescuePhone} />
            <SummaryItem label="Địa chỉ hiện trường" value={data.assistance.address} />
            <SummaryItem label="Tỉnh/Thành" value={data.assistance.city} />
            <SummaryItem label="Kinh độ / Vĩ độ" value={`${data.assistance.lng} / ${data.assistance.lat}`} />
            <SummaryItem label="Ghi chú" value={data.assistance.note || "Không có"} />
          </SummaryBlock>

          <SummaryBlock title="Dịch vụ cứu hộ">
            <SummaryItem 
              label="Dịch vụ yêu cầu" 
              value={
                <div className="flex flex-wrap gap-1">
                  {data.service.serviceIds.map(id => (
                    <span key={id} className="bg-green-100 text-green-800 text-[11px] px-2 py-0.5 rounded border border-green-200 font-bold uppercase">
                      {id}
                    </span>
                  )) || '-'}
                </div>
              } 
            />
            <SummaryItem label="Số lượng" value={data.service.quantity} />
            <SummaryItem label="Mô tả sự cố" value={data.service.description} />
          </SummaryBlock>

          <SummaryBlock title="Ước tính (Tạm tính)">
             <div className="p-4 bg-white border-2 border-vetc-green rounded-xl shadow-sm text-center">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Số tiền cần thanh toán</p>
                <p className="text-3xl font-black text-red-600">{data.pricing.estimatedPrice} đ</p>
             </div>
          </SummaryBlock>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-8 py-2 rounded-xl font-bold hover:bg-gray-600 transition-all shadow-md"
        >
          Quay lại chỉnh sửa
        </button>
        <button 
          onClick={onNext}
          className="bg-vetc-green text-white px-12 py-3 rounded-xl font-black hover:bg-green-700 transition-all shadow-lg active:scale-95 uppercase tracking-wide"
        >
          Hoàn tất & Tạo đơn cứu hộ
        </button>
      </div>
    </div>
  );
};

export default RescueConfirmation;
