
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Navigation, Camera, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ImageUploadSection from '../shared/ImageUploadSection';

const ShareLocationForm: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [location, setLocation] = useState({
    address: '',
    lat: '',
    lng: ''
  });
  
  const [description, setDescription] = useState('- Hiện tượng: Xe không đề được, đề yếu.\n' +
      '- Khả năng di chuyển: Không di chuyển được.\n' +
      '- Dấu hiệu bất thường: Không có mùi khét, không rò rỉ.\n' +
      '- Phán đoán nguyên nhân: chưa rõ.\n' +
      '- Thời điểm: Đỗ qua đêm, sáng ra không nổ.');

  useEffect(() => {
    // Request geolocation on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({
            ...prev,
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            address: `Vị trí hiện tại (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Không thể lấy vị trí tự động. Vui lòng cấp quyền truy cập vị trí hoặc nhập thủ công.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Trình duyệt của bạn không hỗ trợ định vị.");
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Gửi thành công!</h2>
            <p className="text-gray-500">Thông tin vị trí và hình ảnh của bạn đã được gửi đến hệ thống cứu hộ VETC.</p>
          </div>
          <p className="text-sm text-gray-400">Bạn có thể đóng tab này ngay bây giờ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-vetc-green p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <Navigation size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Chia sẻ vị trí sự cố</h1>
              <p className="text-sm opacity-90">Mã đơn: {orderId || 'RS-PENDING'}</p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
            <MapPin size={160} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {/* Location Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-vetc-green mb-2">
              <MapPin size={18} />
              <h3 className="font-bold uppercase text-xs tracking-wider">Vị trí sự cố</h3>
            </div>
            
            {error && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start space-x-3 text-amber-700 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase">Địa chỉ / Tên vị trí</label>
                <input 
                  type="text"
                  required
                  value={location.address}
                  onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-vetc-green focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                  placeholder="Nhập địa chỉ hoặc tên địa danh..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase">Vĩ độ (Latitude)</label>
                  <input
                      type="text"
                      required
                      value={location.lat}
                      onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-vetc-green focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-mono"
                      placeholder="21.xxxxxx"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase">Kinh độ (Longitude)</label>
                  <input 
                    type="text"
                    required
                    value={location.lng}
                    onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-vetc-green focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-mono"
                    placeholder="105.xxxxxx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-vetc-green mb-2">
              <AlertCircle size={18} />
              <h3 className="font-bold uppercase text-xs tracking-wider">Mô tả tình trạng</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase">Chi tiết sự cố</label>
              <textarea 
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-vetc-green focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                placeholder="Mô tả tình trạng xe hiện tại, các dấu hiệu bất thường..."
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-vetc-green mb-2">
              <Camera size={18} />
              <h3 className="font-bold uppercase text-xs tracking-wider">Hình ảnh hiện trường</h3>
            </div>
            <ImageUploadSection onlyScene={true} />
          </div>

          {/* Footer / Submit */}
          <div className="p-6 bg-gray-50/50">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-vetc-green text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span>Gửi thông tin cứu hộ</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 px-8">
              Bằng cách gửi thông tin, bạn đồng ý chia sẻ vị trí chính xác để chúng tôi có thể hỗ trợ nhanh nhất.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareLocationForm;
