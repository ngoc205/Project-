import api from './axiosClient';

export const getLopChuNhiem = async (taiKhoanId) => {
  return await api.get(`/api/giaovien/${taiKhoanId}/lop-chu-nhiem`);
};
