import axiosInstance from "../utils/request";

export const signUp = async (data) => {
  return await axiosInstance.post("/user", data);
};

export const login = async (data) => {
  return await axiosInstance.post("/user/login", data);
};

export const searchUser = async (search) => {
  return await axiosInstance.get(`/user?search=${search}`);
};

export const checking = async () => {
  return await axiosInstance.get("/");
};
