import axios from "axios";

const API_URL = "http://localhost:3000/can-bo";

export const getAllCanBo = () => {
  return axios.get(API_URL);
};

export const getCanBoById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const searchCanBo = (keyword) => {
  return axios.get(`${API_URL}/search?keyword=${keyword}`);
};

export const createCanBo = (data) => {
  return axios.post(API_URL, data);
};

export const updateCanBo = (id, data) => {
  return axios.patch(`${API_URL}/${id}`, data);
};