import { $host } from "../api";

export interface User {
  id?:number,
  username: string;
  password?: string;
  email?: string;
  lastname: string;
}

export const getUser = async () => {
  try {
    const response = await $host.get("/user/all");
    return response.data;
  } catch (e) {
    return e;
  }
};

export const logoutUser = async () => {
  try {
    const response = await $host.get("/user/logout");
    return response.data;
  } catch (e) {
    return e;
  }
};

export const createUser = async (newUser: any) => {
  try {
    const response  = await $host.post("/user/create", newUser);
    return response;
  } catch (e) {
    return e;
    throw e;
  }
};


export const loginUser = async (logAUser: any) => {
   try {
    const response = await $host.post("/user/login", logAUser);
    return response;
  } catch (e) {
    return e;
    throw e;
  }
}; 