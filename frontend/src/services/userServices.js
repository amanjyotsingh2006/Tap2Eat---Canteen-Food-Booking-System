import api from "./api";

export const getAllUser = async () => {
    const response = await api.get("/users");
    return response.data;
}