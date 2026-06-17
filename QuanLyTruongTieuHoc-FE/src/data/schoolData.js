export const navItems = [
  { label: 'Trang chủ', page: 'home' },
  { label: 'Giới thiệu', page: 'intro' },
  { label: 'Tra cứu', page: 'search' },
  { label: 'Thời khóa biểu', page: 'timetable' },
  { label: 'Tin tức', page: 'news' },
]

export const subjects = {
  toan: 'Toán',
  tiengviet: 'Tiếng Việt',
  tnxh: 'TN & XH',
  shlop: 'SH Lớp',
  theduc: 'Thể dục',
  tienganh: 'Tiếng Anh',
  amnhac: 'Âm nhạc',
  hdtn: 'HĐTN',
  tapdoc: 'Tập đọc',
  daoduc: 'Đạo đức',
  mythuat: 'Mỹ thuật',
  clb: 'Sinh hoạt CLB',
  luyentoan: 'Luyện Toán',
  luyenviet: 'Luyện Viết',
  kechuyen: 'Kể chuyện',
  vesinh: 'Vệ sinh Lớp',
}

export const morningRows = [
  ['toan', 'tiengviet', 'toan', 'tiengviet', 'toan'],
  ['tiengviet', 'tiengviet', 'tnxh', 'tiengviet', 'tiengviet'],
  ['shlop', 'theduc', 'tiengviet', 'toan', 'tienganh'],
  ['tienganh', 'toan', 'amnhac', 'theduc', 'hdtn'],
]

export const afternoonRows = [
  ['tapdoc', 'daoduc', 'tienganh', 'mythuat', 'clb'],
  ['luyentoan', 'luyenviet', 'kechuyen', 'luyenviet', 'shlop'],
  ['', '', '', '', 'vesinh'],
]

export const news = [
  {
    title: 'Rộn ràng Lễ hội Trăng Rằm - Thắp sáng ước mơ tuổi thơ của các con',
    date: '15 Tháng 8, 2026',
    category: 'Hoạt động ngoại khóa',
    image: 'news1.jpg',
    lead: 'Hòa chung không khí vui tươi của Tết Trung thu, trường Tiểu học Lạc Long Quân đã tổ chức chương trình Đêm hội Trăng Rằm với nhiều tiết mục múa lân, rước đèn và phá cỗ đầy ắp tiếng cười.',
  },
  {
    title: 'Thông báo lịch nghỉ Lễ Quốc khánh 2/9 và Lễ Khai giảng năm học mới',
    date: '28 Tháng 8, 2026',
    category: 'Thông báo',
    image: 'news2.jpg',
    lead: 'Kính gửi Quý phụ huynh, nhà trường xin trân trọng thông báo lịch nghỉ Lễ 2/9 và công tác chuẩn bị đón học sinh tựu trường.',
  },
  {
    title: 'Tuyên dương các tập thể, cá nhân "Người tốt - Việc tốt" tháng 8',
    date: '20 Tháng 8, 2026',
    category: 'Gương sáng',
    image: 'news3.jpg',
    lead: 'Nhà trường biểu dương những học sinh có hành động đẹp, biết sẻ chia và giúp đỡ bạn bè trong học tập cũng như sinh hoạt.',
  },
  {
    title: 'Khối 1 hào hứng với tiết học Mỹ thuật ngoài trời',
    date: '12 Tháng 8, 2026',
    category: 'Ngoại khóa',
    image: 'news4.jpg',
    lead: 'Thay vì ngồi trong lớp học, các thiên thần nhỏ Khối 1 đã có buổi sáng tạo sức sống tạo với cọ vẽ và những chiếc lá ngay tại sân trường.',
  },
]

export const students = [
  {
    name: 'Phạm Huyền Trang',
    id: 'HS2026001',
    grade: '1',
    className: '1A1',
    teacher: 'Trần Thị Nụ',
    image: 'hocsinh1.jpg',
  },
  {
    name: 'Nguyễn Văn Khánh',
    id: 'HS2026002',
    grade: '1',
    className: '1A1',
    teacher: 'Trần Thị Nụ',
    image: 'hocsinh2.webp',
  },
]

export const coreValues = [
  { title: 'Tôn trọng', image: 'hocsinh1.jpg', text: 'Tôn trọng sự khác biệt và nâng niu cảm xúc của từng học sinh.' },
  { title: 'Trách nhiệm', image: 'trucnhat.jpg', text: 'Rèn luyện ý thức tự giác và trách nhiệm với bản thân, gia đình.' },
  { title: 'Sáng tạo', image: 'hocsinhvetranh.jpg', text: 'Khuyến khích tư duy đổi mới và mạnh dạn thể hiện ý tưởng.' },
  { title: 'Hạnh phúc', image: 'hoatdongngoaikhoa.jpg', text: 'Tạo dựng môi trường học đường tích cực, lan tỏa niềm vui.' },
]
