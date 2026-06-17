import axios from "axios";

const API_URL = "http://localhost:3000/hoc-sinh";

export const getAllHocSinh = () => {
  return axios.get(API_URL);
};

export const getHocSinhById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const updateHocSinh = (id, data) => {
  return axios.patch(`${API_URL}/${id}`, data);
};

export const deleteHocSinh = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};