import axios from "axios";

export const UploadDataset = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${import.meta.env.VITE_API_PATH}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,
    },
  });

  // langsung return JSON dari backend
  return res.data;
};

// services/datasetService.js
export const datasetList = async (token) => {
  const url = new URL(`${import.meta.env.VITE_API_PATH}/dataset`);

  return await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
};
export const deleteDataset = async (token) => {
  const url = new URL(`${import.meta.env.VITE_API_PATH}/dataset/delete`);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
};