import { VietnameseIdea } from '../types';

// Dữ liệu mẫu cứng cho các bài học cụ thể
const SPECIFIC_IDEAS: Record<string, VietnameseIdea[]> = {
  "Bữa cơm gia đình": [
    {
      id: "meal_1",
      name: "Gia đình quây quần",
      composition: "4 người (Bố, mẹ, 2 con)",
      details: "Mâm cơm tròn, bát đũa, nồi cơm",
      context: "Phòng ăn ấm cúng",
      level: "Vừa"
    },
    {
      id: "meal_2",
      name: "Chuẩn bị bữa ăn",
      composition: "Mẹ và bé",
      details: "Mẹ bày thức ăn, bé so đũa",
      context: "Góc bếp gọn gàng",
      level: "Thấp"
    },
    {
      id: "meal_3",
      name: "Góc bàn ăn (Cận cảnh)",
      composition: "Chỉ có bàn ăn và tay người",
      details: "Đĩa cá, bát canh, đĩa rau xanh",
      context: "Nhìn từ trên xuống",
      level: "Cao"
    },
    {
      id: "meal_4",
      name: "Tranh tô màu (Line Art)",
      composition: "Gia đình đang ăn",
      details: "Nét viền đen rõ ràng, không tô màu",
      context: "Nền trắng hoàn toàn",
      level: "Thấp"
    },
    {
      id: "meal_5",
      name: "Bữa cơm ngày Tết",
      composition: "Đại gia đình (Ông bà, bố mẹ, cháu)",
      details: "Bánh chưng, hoa đào, dưa hấu",
      context: "Phòng khách trang trí Tết",
      level: "Cao"
    }
  ]
};

// Hàm sinh ý tưởng chung dựa trên tên bài học nếu chưa có dữ liệu mẫu
export const getIdeasForLesson = (lessonName: string): VietnameseIdea[] => {
  // 1. Nếu có dữ liệu mẫu cụ thể (match chính xác hoặc gần đúng)
  const exactMatch = Object.keys(SPECIFIC_IDEAS).find(k => lessonName.includes(k));
  if (exactMatch) {
    return SPECIFIC_IDEAS[exactMatch];
  }

  // 2. Sinh dữ liệu chung (Generic Fallback)
  return [
    {
      id: "gen_1",
      name: "Minh họa trực tiếp",
      composition: "Nhân vật chính ở giữa",
      details: `Thể hiện rõ chủ đề ${lessonName}`,
      context: "Đơn giản, ít chi tiết phụ",
      level: "Thấp"
    },
    {
      id: "gen_2",
      name: "Hoạt động nhóm",
      composition: "Nhóm học sinh/bạn bè",
      details: "Đang cùng nhau tìm hiểu/vui chơi",
      context: "Sân trường hoặc lớp học",
      level: "Vừa"
    },
    {
      id: "gen_3",
      name: "Phong cảnh liên quan",
      composition: "Góc nhìn rộng",
      details: "Cây cối, nhà cửa, thiên nhiên",
      context: "Không gian mở, tươi sáng",
      level: "Vừa"
    },
    {
      id: "gen_4",
      name: "Tranh tô màu đơn giản",
      composition: "Nét vẽ viền đen (Line Art)",
      details: "Các hình khối cơ bản, dễ tô",
      context: "Nền trắng",
      level: "Thấp"
    },
    {
      id: "gen_5",
      name: "Sáng tạo chi tiết",
      composition: "Góc nhìn cận cảnh",
      details: "Tập trung vào vật thể chính",
      context: "Trang trí họa tiết bắt mắt",
      level: "Cao"
    }
  ];
};