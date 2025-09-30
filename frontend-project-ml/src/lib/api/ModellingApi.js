export const getElbow = async (token) => {
    const url = new URL(`${import.meta.env.VITE_API_PATH}/modelling`);
  
    return await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  };
export const getModels = async (token, k) => {
    const url = new URL(`${import.meta.env.VITE_API_PATH}/modelling/${k}`);
  
    return await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  };