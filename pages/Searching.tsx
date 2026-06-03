
import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Search, ShieldCheck, Zap, Edit3, ArrowLeft, Hash } from 'lucide-react';
import { FormData } from '../types';

interface SearchingProps {
  data: FormData;
  onComplete: () => void;
  onManualEntry: () => void;
  onBack: () => void;
}

const Searching: React.FC<SearchingProps> = ({ data, onComplete, onManualEntry, onBack }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Đang xác định vị trí phương tiện...",
    "Đang quét các đơn vị cứu hộ trong khu vực...",
    "Đang kiểm tra tính sẵn sàng của các đối tác...",
    "Đang tối ưu hóa quãng đường di chuyển...",
    "Đang áp dụng các hệ số điều chỉnh giá...",
    "Hoàn tất tìm kiếm trạm cứu hộ phù hợp nhất!"
  ];

  useEffect(() => {
    const duration = 10000; // Speed up search for better UX
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, intervalTime);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, duration / messages.length);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, [messages.length]);

  useEffect(() => {
    if (progress >= 100) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 min-h-[500px]">
      {/* Animated Radar Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-10 delay-700"></div>
        <div className="relative z-10 w-24 h-24 bg-white border-4 border-vetc-green rounded-full flex items-center justify-center shadow-lg">
          <MapPin size={40} className="text-vetc-green animate-bounce" />
        </div>
        
        {/* Floating Icons */}
        <div className="absolute -top-4 -right-8 animate-pulse text-blue-500">
           <Zap size={20} />
        </div>
        <div className="absolute top-1/2 -left-12 animate-bounce delay-300 text-orange-500">
           <Search size={20} />
        </div>
        <div className="absolute -bottom-4 -right-4 animate-pulse delay-500 text-vetc-green">
           <ShieldCheck size={20} />
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md w-full px-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Hash size={10} />
            <span>Mã đơn: {data.orderId}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đang kết nối đơn vị cứu hộ</h2>
          <p className="text-sm text-gray-500 animate-pulse h-5">
            {messages[messageIndex]}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-vetc-green h-full transition-all duration-100 ease-linear flex items-center justify-end px-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && (
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Khởi tạo</span>
          <span>{Math.round(progress)}%</span>
          <span>Hoàn tất</span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3 max-w-sm">
          <Loader2 className="text-blue-500 animate-spin mt-0.5 shrink-0" size={18} />
          <p className="text-xs text-blue-700 leading-relaxed">
            Hệ thống đang tự động chọn trạm cứu hộ dựa trên khoảng cách, loại xe và đánh giá hiệu quả phục vụ của đối tác.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Searching;
