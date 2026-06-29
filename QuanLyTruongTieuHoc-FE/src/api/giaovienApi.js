import axios from 'axios';

const API_URL = 'http://localhost:3000/api/giaovien';

export const getLopChuNhiem = async (taiKhoanId) => {
  // Trả về thẳng response từ axios
  return await axios.get(`${API_URL}/${taiKhoanId}/lop-chu-nhiem`);
};