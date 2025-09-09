import api from "./api";

export const getLast7DaysStats = async () =>{
    try{
        const response = await api.get("/stats/last-7-days");
        return response.data;
    }catch(error){
        console.error("Error fetching stats", error);
        throw error;
    }
};

export const  getCategoryStats = async() =>{
    try{
        const response = await api.get("/stats/by-category");
        return response.data;
    }catch(error){
        console.error("Error fetching stats", error);
        throw error;
    }
};

export const getStatusDistribution = async() =>{
    try{
        const response = await api.get("/stats/status-distirubtion");
        return response.data;
    }catch(error){
        console.error("Error fetching stats", error);
        throw error;
    }
};

export const getLast3MonthsStats = async() =>{
    try{
        const response = await api.get("/stats/last-3-months");
        return response.data;
    }catch(error){
        console.error("Error fetching data", error);
        throw error;
    }
};