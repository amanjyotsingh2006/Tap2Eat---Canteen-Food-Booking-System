import api from "./api";

export const getAllFood = async () => {
    const response = await api.get("/foods");
    return response.data;
}