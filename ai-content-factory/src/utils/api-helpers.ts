import axios from 'axios';

export const fetchData = async (url: string, config?: object) => {
    try {
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const postData = async (url: string, data: object, config?: object) => {
    try {
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const putData = async (url: string, data: object, config?: object) => {
    try {
        const response = await axios.put(url, data, config);
        return response.data;
    } catch (error) {
        console.error('Error putting data:', error);
        throw error;
    }
};

export const deleteData = async (url: string, config?: object) => {
    try {
        const response = await axios.delete(url, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
};