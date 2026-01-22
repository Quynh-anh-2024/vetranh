import { CurriculumData, Topic, Lesson, GradeLevel } from '../types';

// Raw CSV Data provided by user
const CSV_DATA = `subject,series,grade,topic_no,topic_title,lesson_no,lesson_title,source_ref
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,1,Mĩ thuật trong nhà trường,1,Mĩ thuật trong nhà trường,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,2,Sáng tạo từ những chấm màu,1,Sáng tạo từ những chấm màu,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,3,Nét vẽ của em,1,Nét vẽ của em,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,4,Sáng tạo từ những hình cơ bản,1,Sáng tạo từ những hình cơ bản,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,5,Màu cơ bản trong mĩ thuật,1,Màu cơ bản trong mĩ thuật,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,6,Sáng tạo từ những khối cơ bản,1,Sáng tạo từ những khối cơ bản,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,7,"Hoa, quả",1,"Hoa, quả",SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,8,Người thân của em,1,Người thân của em,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 1,9,Em là học sinh lớp 1,1,Em là học sinh lớp 1,SGK Mĩ thuật 1
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,1,Mĩ thuật trong cuộc sống,1,Mĩ thuật trong cuộc sống,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,2,Sự thú vị của nét,1,Sự thú vị của nét,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,3,Sự kết hợp của các hình cơ bản,1,Sự kết hợp của các hình cơ bản,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,4,Những mảng màu yêu thích,1,Những mảng màu yêu thích,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,5,Sự kết hợp thú vị của khối,1,Sự kết hợp thú vị của khối,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,6,Sắc màu thiên nhiên,1,Sắc màu thiên nhiên,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,7,Gương mặt thân quen,1,Gương mặt thân quen,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,8,Bữa cơm gia đình,1,Bữa cơm gia đình,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,9,Thầy cô của em,1,Thầy cô của em,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 2,10,Đồ chơi từ tạo hình con vật,1,Đồ chơi từ tạo hình con vật,SGK Mĩ thuật 2
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,1,Bài 1: Em yêu mĩ thuật,1,Bài 1: Em yêu mĩ thuật,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,2,Bài 2: Hoa văn trên trang phục của một số dân tộc,1,Bài 2: Hoa văn trên trang phục của một số dân tộc,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,3,Bài 3: Màu sắc em yêu,1,Bài 3: Màu sắc em yêu,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,4,Bài 4: Vẻ đẹp của khối,1,Bài 4: Vẻ đẹp của khối,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,5,"Bài 5: Một số vật liệu sử dụng trong thực hành, sáng tạo mĩ thuật",1,"Bài 5: Một số vật liệu sử dụng trong thực hành, sáng tạo mĩ thuật",SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,6,Bài 6: Biết ơn thầy cô,1,Bài 6: Biết ơn thầy cô,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,7,Bài 7: Cảnh vật quanh em,1,Bài 7: Cảnh vật quanh em,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,8,Bài 8: Chân dung người thân trong gia đình,1,Bài 8: Chân dung người thân trong gia đình,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,9,Bài 9: Sinh hoạt trong gia đình,1,Bài 9: Sinh hoạt trong gia đình,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 3,10,Bài 10: An toàn giao thông,1,Bài 10: An toàn giao thông,SGK Mĩ thuật 3
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,1,Vẻ đẹp trong điêu khắc đình làng Việt Nam,1,Vẻ đẹp trong điêu khắc đình làng Việt Nam,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,2,Một số dạng không gian trong tranh dân gian Việt Nam,1,Một số dạng không gian trong tranh dân gian Việt Nam,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,3,Cảnh đẹp quê hương,1,Cảnh đẹp quê hương,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,4,Vẻ đẹp trong cuộc sống,1,Vẻ đẹp trong cuộc sống,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,5,Những kỉ niệm đẹp,1,Những kỉ niệm đẹp,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,6,Môi trường yêu dấu,1,Môi trường yêu dấu,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,7,Môi trường xanh - sạch - đẹp,1,Môi trường xanh - sạch - đẹp,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 4,8,Quê hương thanh bình,1,Quê hương thanh bình,SGK Mĩ thuật 4
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,1,"Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề",1,"Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề",SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,2,Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam,1,Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam,SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,3,Gia đình,1,Gia đình,SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,4,Những hoạt động yêu thích ở trường em,1,Những hoạt động yêu thích ở trường em,SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,5,Những việc làm bình dị mà cao quý trong cuộc sống,1,Những việc làm bình dị mà cao quý trong cuộc sống,SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,6,Cảnh sắc quê hương,1,Cảnh sắc quê hương,SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,7,"Việt Nam - đất nước, con người",1,"Việt Nam - đất nước, con người",SGK Mĩ thuật 5
Mĩ thuật,Kết nối tri thức với cuộc sống,Lớp 5,8,Vì một thế giới hòa bình,1,Vì một thế giới hòa bình,SGK Mĩ thuật 5`;

const parseCSV = (csv: string): CurriculumData => {
  const lines = csv.trim().split('\n');
  const data: CurriculumData = {};

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    // Handle quotes in CSV (e.g. "Hoa, quả")
    const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Simple split fallback if regex fails or specific structure
    // Since input is consistent, we can do a simpler split but need to handle "Hoa, qua"
    // Let's use a robust splitting strategy for simple CSV
    let row: string[] = [];
    let inQuote = false;
    let currentToken = '';
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(currentToken.trim());
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    row.push(currentToken.trim());

    // Mapping based on CSV columns:
    // 0: Subject, 1: Series, 2: Grade (Lớp X), 3: Topic No, 4: Topic Title
    // 5: Lesson No, 6: Lesson Title, 7: Source
    if (row.length < 7) continue;

    const gradeStr = row[2]; // "Lớp 1"
    const grade = parseInt(gradeStr.replace(/\D/g, ''));
    if (isNaN(grade)) continue;

    if (!data[grade]) {
      data[grade] = { grade, topics: [] };
    }

    const topicNo = parseInt(row[3]);
    const topicName = row[4].replace(/"/g, '');
    
    let topic = data[grade].topics.find(t => t.no === topicNo);
    if (!topic) {
      topic = {
        id: `G${grade}_T${topicNo}`,
        no: topicNo,
        name: topicName,
        lessons: []
      };
      data[grade].topics.push(topic);
    }

    const lessonNo = parseInt(row[5]);
    const lessonName = row[6].replace(/"/g, '');
    
    // Avoid duplicate lessons
    if (!topic.lessons.find(l => l.name === lessonName)) {
      topic.lessons.push({
        id: `G${grade}_T${topicNo}_L${lessonNo}`,
        no: lessonNo,
        name: lessonName,
        sourceRef: row[7]
      });
    }
  }
  return data;
};

export const CURRICULUM = parseCSV(CSV_DATA);