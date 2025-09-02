import api from "./axios";

export const login = async (email, password) => {
  const { data } = await api.post("/login", { email, password });
  localStorage.setItem("token", data.token);
  return data;
};

export const authGoogle = async (token) => {
    console.log("authGoogle token:", token);
  const response = await api.post("/auth/google", { token });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const signup = async (userData) => {
  const { data } = await api.post("/signup", userData);
  localStorage.setItem("token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getProfile = async () => {
  const { data } = await api.get("/signup");
  return data;
};
