import axios from "axios";

export const $host = axios.create({
    baseURL: 'https://localhost:8082/api',
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
})