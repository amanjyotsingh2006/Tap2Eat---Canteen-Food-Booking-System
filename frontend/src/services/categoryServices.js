import api from "./api"

export const getAllCategory = async () => {
    const response = await api.get("/categories");
    return response.data;
}