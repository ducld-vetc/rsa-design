import React from 'react';
import { Printer, X, Check } from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerType: string;
  customerName?: string;
  customerPhone?: string;
  mapAddress?: string;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  customerType,
  customerName,
  customerPhone,
  mapAddress
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header/Toolbar */}
        <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
          <h3 className="font-bold text-gray-700">Xem trước hóa đơn điện tử</h3>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700">
              <Printer size={14} /> <span>In hóa đơn</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1.5 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Content - Scrollable */}
        <div className="overflow-y-auto p-8 bg-gray-50 flex justify-center">
          <div className="bg-white p-8 shadow-lg w-full max-w-[800px] text-[13px] font-sans leading-snug relative" style={{ minHeight: '1000px' }}>
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-vetc-green font-bold text-lg">vetc <span className="text-black font-normal">Cứu Hộ</span></h1>
              </div>
              <div className="text-center">
                <h2 className="text-red-600 font-bold text-xl uppercase tracking-wide">HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h2>
                <p className="italic text-gray-600">Ngày 20 tháng 10 năm 2025</p>
              </div>
              <div className="text-right text-xs">
                <p>Ký hiệu: <span className="font-bold">1C25TRA</span></p>
                <p>Số: <span className="font-bold text-red-600 text-lg">401</span></p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mb-4 relative">
              <p className="mb-1">Đơn vị bán hàng: <span className="text-vetc-green font-bold text-base uppercase">CÔNG TY TNHH VETC RSA</span></p>
              <p className="mb-1">Mã số thuế: <span className="font-bold tracking-wider">0 1 1 1 1 1 9 3 2 1</span></p>
              <p className="mb-1">Địa chỉ: Tầng 14, tòa nhà Tasco, Lô HH2-2, đường Phạm Hùng, Phường Từ Liêm, Thành phố Hà Nội, Việt Nam</p>
              <p className="mb-1">Điện thoại:</p>
              {/* QR Code Placeholder */}
              <div className="absolute top-0 right-0">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=VETC_INVOICE_001" alt="QR Code" className="w-16 h-16" />
              </div>
            </div>

            <div className="border-t border-black my-2"></div>

            {/* Buyer Info */}
            <div className="mb-6 space-y-1">
              <div className="flex">
                <span className="w-40">Họ tên người mua hàng:</span>
                <span className="font-bold uppercase">{customerType === 'Doanh nghiệp' ? 'NGUYEN VAN A' : (customerName || 'NGUYEN VAN A')}</span>
              </div>
              <div className="flex">
                <span className="w-40">Đơn vị mua hàng:</span>
                <span className="font-bold">{customerType === 'Doanh nghiệp' ? 'CÔNG TY TNHH ABC' : ''}</span>
              </div>
              <div className="flex">
                <div className="flex-1 flex">
                  <span className="w-40">Mã số thuế:</span>
                  <span>{customerType === 'Doanh nghiệp' ? '0123456789' : ''}</span>
                </div>
                <div className="flex-1 flex">
                  <span className="w-24">Mã QHNS:</span>
                  <span></span>
                </div>
              </div>
              <div className="flex">
                <span className="w-40">Địa chỉ:</span>
                <span>{mapAddress || 'XÓM 6 YÊN NỘI, Xã Đồng Quang, H.Quốc Oai, Hà Nội'}</span>
              </div>
              <div className="flex">
                <div className="flex-1 flex">
                  <span className="w-40">Điện thoại:</span>
                  <span>{customerPhone || '0965826789'}</span>
                </div>
                <div className="flex-1 flex">
                  <span className="w-40">Hình thức thanh toán:</span>
                  <span>Chuyển khoản</span>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <table className="w-full border-collapse border border-black mb-4 text-center">
              <thead>
                <tr className="font-bold">
                  <th className="border border-black p-1 w-10">STT</th>
                  <th className="border border-black p-1">Tên hàng hóa, dịch vụ</th>
                  <th className="border border-black p-1 w-16">Đơn vị tính</th>
                  <th className="border border-black p-1 w-16">Số lượng</th>
                  <th className="border border-black p-1 w-24">Đơn giá</th>
                  <th className="border border-black p-1 w-16">Thuế suất</th>
                  <th className="border border-black p-1 w-24">Thành tiền (chưa thuế GTGT)</th>
                  <th className="border border-black p-1 w-24">Tiền thuế GTGT</th>
                  <th className="border border-black p-1 w-24">Thành tiền</th>
                </tr>
                <tr className="text-[10px] italic">
                  <th className="border border-black p-1">(1)</th>
                  <th className="border border-black p-1">(2)</th>
                  <th className="border border-black p-1">(3)</th>
                  <th className="border border-black p-1">(4)</th>
                  <th className="border border-black p-1">(5)</th>
                  <th className="border border-black p-1">(6)</th>
                  <th className="border border-black p-1">(7=4x5)</th>
                  <th className="border border-black p-1">(8=6x7)</th>
                  <th className="border border-black p-1">(9=7+8)</th>
                </tr>
              </thead>
              <tbody>
                {/* Hardcoded row based on image provided */}
                <tr>
                  <td className="border border-black p-2">1</td>
                  <td className="border border-black p-2 text-left font-bold text-gray-800">Gói cơ bản 10 dịch vụ - 51K58339</td>
                  <td className="border border-black p-2">Gói</td>
                  <td className="border border-black p-2">1</td>
                  <td className="border border-black p-2 text-right">238.094,29</td>
                  <td className="border border-black p-2">5 %</td>
                  <td className="border border-black p-2 text-right">238.094,29</td>
                  <td className="border border-black p-2 text-right">11.904,71</td>
                  <td className="border border-black p-2 text-right font-bold">249.999</td>
                </tr>
                {/* Empty rows filler if needed, but keeping it simple */}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={6} className="border border-black p-2 text-left">Tổng tiền:</td>
                  <td className="border border-black p-2 text-right">238.094,29</td>
                  <td className="border border-black p-2 text-right">11.904,71</td>
                  <td className="border border-black p-2 text-right">249.999</td>
                </tr>
              </tbody>
            </table>

            <div className="mb-6 font-bold">
              Tổng số tiền bằng chữ: <span className="italic font-normal">Hai trăm bốn mươi chín nghìn chín trăm chín mươi chín đồng chẵn./.</span>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-8 mb-16">
              <div className="text-center w-1/3">
                <p className="font-bold">Người mua hàng</p>
                <p className="italic text-xs">(Ký, ghi rõ họ tên)</p>
              </div>
              <div className="text-center w-1/3 relative">
                <p className="font-bold">Người bán hàng</p>
                <p className="italic text-xs">(Ký, ghi rõ họ tên)</p>

                {/* Signature Stamp Mock */}
                <div className="mt-8 relative inline-block border-2 border-red-500 p-2 text-left min-w-[200px]">
                  <p className="text-red-500 font-bold text-xs uppercase">Signature Valid</p>
                  <p className="text-red-500 text-xs">Ký bởi: CÔNG TY TNHH VETC RSA</p>
                  <p className="text-red-500 text-xs">Ký ngày: 20 tháng 10 năm 2025</p>
                  <div className="absolute bottom-2 right-2 text-green-600">
                    <Check size={24} strokeWidth={4} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs space-y-1 mt-20 pt-4 border-t border-gray-300 italic">
              <p>(Cần kiểm tra đối chiếu khi lập, giao, nhận hóa đơn)</p>
              <p>Tra cứu thông tin hóa đơn điện tử tại: <span className="underline">https://hoadondientu.vetc.com.vn</span>. Mã tra cứu: <span className="font-bold">4aPJb5wsaHpgS</span></p>
              <div className="mt-2 not-italic">
                Đơn vị cung cấp hóa đơn điện tử: CÔNG TY CỔ PHẦN VETC - MST: 0106858609 - Điện thoại:(84-24) 3 747 6666
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
