
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FormData } from '../types';

interface CreateRescueOrderCompleteProps {
  data: FormData;
  onReset: () => void;
  onViewList: () => void;
}

const CreateRescueOrderComplete: React.FC<CreateRescueOrderCompleteProps> = ({ data, onReset, onViewList }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle2 size={48} className="text-vetc-green" />
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đã cập nhật thông tin cứu hộ</h2>
        <p className="text-red-500 font-bold text-xl uppercase tracking-wider">Mã đơn hàng: {data.orderId}</p>
      </div>

      <div className="flex space-x-4 pt-6">
        <button 
          onClick={onViewList}
          className="bg-vetc-green text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition-all shadow-md active:scale-95"
        >
          Xem danh sách đơn
        </button>
        <button 
          onClick={onReset}
          className="border border-vetc-green text-vetc-green px-6 py-2 rounded font-semibold hover:bg-green-50 transition-all active:scale-95"
        >
          Tạo đơn mới
        </button>
      </div>
    </div>
  );
};

export default CreateRescueOrderComplete;
