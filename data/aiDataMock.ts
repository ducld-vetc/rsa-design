
export interface AISuggestion {
  analysis: string;
  recommendedServices: {
    name: string;
    price: string;
  }[];
  solutionSteps: string;
}

export const AI_DATA_MOCK: Record<string, AISuggestion> = {
  "pin": {
    analysis: "Dựa trên mô tả, xe có khả năng cao bị hết điện bình ắc quy hoặc lỗi hệ thống sạc. Điện áp đo được (giả định) đang dưới mức 10.5V.",
    recommendedServices: [
      { name: "Kích bình ắc quy", price: "150,000" },
      { name: "Kiểm tra hệ thống điện", price: "50,000" }
    ],
    solutionSteps: "Tiến hành kích bình bằng thiết bị chuyên dụng. Sau khi nổ máy, để xe chạy không tải 15-20p để sạc bù. Khuyến nghị khách hàng kiểm tra lại độ bền của bình tại trạm."
  },
  "lốp": {
    analysis: "Lốp xe bị mất áp suất đột ngột, có dấu hiệu cán đinh hoặc rách thành lốp. Cần thay thế lốp dự phòng hoặc vá khẩn cấp.",
    recommendedServices: [
      { name: "Thay lốp dự phòng", price: "100,000" },
      { name: "Vá lốp khẩn cấp", price: "80,000" }
    ],
    solutionSteps: "Sử dụng kích thủy lực nâng xe, thay lốp dự phòng của khách. Kiểm tra áp suất các lốp còn lại để đảm bảo an toàn vận hành."
  },
  "ngập": {
    analysis: "Cảnh báo: Xe có dấu hiệu bị thủy kích. Tuyệt đối không được khởi động lại máy để tránh hư hỏng hoàn toàn động cơ.",
    recommendedServices: [
      { name: "Cứu hộ kéo xe (Towing)", price: "500,000" },
      { name: "Cứu hộ thủy kích chuyên sâu", price: "1,200,000" }
    ],
    solutionSteps: "Niêm phong nắp capo, thực hiện kéo xe về trạm bằng xe sàn trượt. Kiểm tra dầu máy và hệ thống hút gió trước khi xử lý chuyên sâu."
  },
  "mặc định": {
    analysis: "Hệ thống ghi nhận sự cố chưa xác định rõ nguyên nhân cơ bản. Cần thực hiện kiểm tra tổng quát tại hiện trường.",
    recommendedServices: [
      { name: "Sửa chữa tại chỗ (Mobile Mechanic)", price: "250,000" }
    ],
    solutionSteps: "Kỹ thuật viên kiểm tra lỗi qua cổng OBD-II, xác định các mã lỗi hệ thống và đưa ra phương án xử lý cụ thể cho khách hàng."
  }
};

export const analyzeIncident = (text: string): AISuggestion => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("pin") || lowerText.includes("ắc quy") || lowerText.includes("điện")) return AI_DATA_MOCK["pin"];
  if (lowerText.includes("lốp") || lowerText.includes("bánh") || lowerText.includes("đinh")) return AI_DATA_MOCK["lốp"];
  if (lowerText.includes("ngập") || lowerText.includes("nước") || lowerText.includes("thủy kích")) return AI_DATA_MOCK["ngập"];
  return AI_DATA_MOCK["mặc định"];
};
