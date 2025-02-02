import { toast } from "react-hot-toast";
import axios from "axios";
import { serialize } from 'object-to-formdata';
import { getLocalStorage } from "./local-storage";

export const post = async (url, obj) => {
    try {
        let formData = new FormData();
        let form_data_options = {
            indices: true,
        }
        formData = serialize(obj, form_data_options);
        let config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const { data: response } = await axios.post(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        return false;
    }
}
export const deleteItem = async (url, obj) => {
    try {
        const { data: response } = await axios.delete(url, obj);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.response?.data?.message);
        return false;
    }
}
export const put = async (url, obj) => {
    try {
        let formData = new FormData();
        let form_data_options = {
            indices: true,
        }
        formData = serialize(obj, form_data_options);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'withCredentials': true
            }
        };
        const { data: response } = await axios.put(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        return false;
    }
}
export const get = async (url, params) => {
    try {
        let query = new URLSearchParams(params).toString()

        const { data: response } = await axios.get(`${url}?${query}`);

        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        return false;
    }
}

const settingParams = async (table, type, params) => {
    let obj = { ...params };
    let keys = Object.keys(obj);

    return obj
}

export const apiManager = async (table, type, params) => {
    let obj = await settingParams(table, type, params);
    
    let base_url = '/api';
    if (type == 'get') {
        return get(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'list') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'create') {
        return post(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return put(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'delete') {
        return deleteItem(`${base_url}/${table}/${params?.id}`);
    }
}