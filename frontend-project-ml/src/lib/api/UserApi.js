export const UserLogin = async ({username, password})=>{
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/login`,{
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        })
    })
}
export const UserLogout = async (token) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/logout`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
        },
    });
};
export const UserDetail = async(token) =>{
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/me`,{
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
};
export const UserDetailMng = async(token, username) =>{
  return await fetch(`${import.meta.env.VITE_API_PATH}/users/${username}`,{
      method: "GET",
      headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
      },
  });
};
export const UserUpdateProfile = async (token,{name}) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/updateSelf`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
      }),
    });
  };
  export const UserUpdateProfilePwd = async (token,{password}) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/updateSelf`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        password,
      }),
    });
  };
  export const UserList = async (
    token,
    { name, username}
  ) => {
    const url = new URL(`${import.meta.env.VITE_API_PATH}/users/allUser`)
    if(name) url.searchParams.append('name', name)
    if(username) url.searchParams.append('username', username)
    url.searchParams
    return await fetch(url, {
      method:"GET",
      headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
    });
  };
  export const MngUpdateName = async (token, username,{name}) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/update/${username}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
      }),
    });
  };
  export const MngUpdate = async (token, username,{name,password}) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/update/${username}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        password,
      }),
    });
  };
  export const MngCreate = async (token,{ username, password, name }) => {
    return await fetch(`${import.meta.env.VITE_API_PATH}/users`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username,
        password,
        name,
      }),
    });
  };
  export const MngDel = async (token, username)=>{
    return await fetch(`${import.meta.env.VITE_API_PATH}/users/${username}`, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  }