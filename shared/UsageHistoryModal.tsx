
import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Check, UserX, ChevronRight } from 'lucide-react';

interface PackageDetail {
  stt: number;
  name: string;
  used: number;
  limit: number;
}

interface Package {
  id: string;
  name: string;
  plate?: string;
  details: PackageDetail[];
}

const PACKAGE_LIST: Package[] = [
  { 
    id: 'BASIC', 
    name: 'Gói cơ bản 10 dịch vụ', 
    plate: '30A-555.88',
    details: [
      { stt: 1, name: 'Kích bình ắc quy', used: 1, limit: 100 },
      { stt: 2, name: 'Sự cố kỹ thuật khác khiến xe không di chuyển', used: 0, limit: 100 },
      { stt: 3, name: 'Hỗ trợ 24/7, không giới hạn số lần sử dụng', used: 0, limit: 100 },
      { stt: 4, name: 'Miễn phí kéo xe trong phạm vi 100 km', used: 0, limit: 100 }
    ]
  },
  { 
    id: 'PREMIUM', 
    name: 'Gói nâng cao Premium', 
    plate: '29H-123.45',
    details: [
      { stt: 1, name: 'Kích bình ắc quy', used: 2, limit: 100 },
      { stt: 2, name: 'Thay lốp dự phòng', used: 1, limit: 100 },
      { stt: 3, name: 'Cứu hộ thủy kích', used: 0, limit: 10 },
      { stt: 4, name: 'Kéo xe không giới hạn khoảng cách', used: 0, limit: 100 }
    ]
  }
];

interface UsageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage: string;
  customerPlate: string;
  onApply: (pkg: string) => void;
}

const UsageHistoryModal: React.FC<UsageHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPackage, 
  customerPlate,
  onApply 
}) => {
  const [previewPackage, setPreviewPackage] = useState(currentPackage);

  useEffect(() => {
    if (isOpen) {
      setPreviewPackage(currentPackage);
    }
  }, [isOpen, currentPackage]);

  if (!isOpen) return null;

  const currentPackageInfo = PACKAGE_LIST.find(p => p.name === previewPackage);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-vetc-green text-white px-6 py-4 flex items-center justify-between font-black text-xl uppercase tracking-wider">
          <span>Số lần sử dụng</span>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-[#f8fcf9] p-4 rounded-xl border border-green-100 flex items-center space-x-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center text-vetc-green shadow-inner"><Info size={22} /></div>
              <div className="flex-1 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Đang hiển thị gói:</p>
                  <div className="relative">
                    <select value={previewPackage} onChange={(e) => setPreviewPackage(e.target.value)} className="bg-transparent text-lg font-black text-gray-800 outline-none w-full appearance-none pr-8">
                      {PACKAGE_LIST.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      <option value="Không có">Không có</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-0 top-1 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="text-right pl-4 border-l border-green-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Biển số xe</p>
                    <p className="text-lg font-black text-gray-800 uppercase tracking-wide">
                      {previewPackage === 'Không có' ? (customerPlate || '---') : currentPackageInfo?.plate || customerPlate}
                    </p>
                </div>
              </div>
            </div>
            <button onClick={() => { onApply(previewPackage); onClose(); }} className="bg-vetc-green text-white px-10 py-5 rounded-xl font-black text-sm shadow-xl hover:bg-green-700 active:scale-95 flex items-center space-x-2"><Check size={22} /><span>Áp dụng</span></button>
          </div>

          {previewPackage === 'Không có' ? (
            <div className="border rounded-xl shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3 text-gray-400">
               <UserX size={48} className="opacity-20" />
               <span className="font-bold text-lg text-gray-500">Không sử dụng gói cứu hộ</span>
            </div>
          ) : (
            <>
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f0f9f4] text-gray-600 font-bold text-xs uppercase border-b">
                    <tr><th className="px-6 py-3 w-16 text-center">STT</th><th className="px-6 py-3">Dịch vụ</th><th className="px-6 py-3 w-40 text-center">Sử dụng (Lần)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {currentPackageInfo?.details.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-center text-gray-400 font-bold">{d.stt}</td>
                          <td className="px-6 py-4 text-gray-800 font-bold">{d.name}</td>
                          <td className="px-6 py-4 text-center font-black text-gray-600 tracking-wider">{d.used}/{d.limit}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold px-2 uppercase tracking-tighter">
                <span>1-{currentPackageInfo?.details.length} của {currentPackageInfo?.details.length} dịch vụ</span>
                <div className="flex items-center space-x-5">
                  <div className="flex items-center space-x-1.5"><button className="p-1.5 border rounded-lg bg-white shadow-sm opacity-40"><ChevronRight size={16} className="rotate-180" /></button><span className="w-8 h-8 flex items-center justify-center bg-vetc-green text-white rounded-lg shadow-md">1</span><button className="p-1.5 border rounded-lg bg-white shadow-sm opacity-40"><ChevronRight size={16} /></button></div>
                  <div className="flex items-center space-x-2"><span className="text-[10px] text-gray-300">Hiển thị:</span><select className="border rounded-lg px-2 py-1 bg-white outline-none shadow-sm"><option>5 / Page</option></select></div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-center"><button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-16 py-2.5 rounded-xl font-black uppercase text-sm shadow-md transition-all active:scale-95">Đóng</button></div>
      </div>
    </div>
  );
};

export default UsageHistoryModal;
