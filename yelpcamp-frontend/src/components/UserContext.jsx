import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';



const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/userData`, {}, {
            headers: { "Content-Type": "application/json" }, withCredentials: true
        }).then((resp) => {
            if (resp.data.success) {
                setUser({ email: resp.data.email, userId: resp.data.userId, username: resp.data.username, loggedIn: true })
            }
        }).catch((error) => {
            console.log(error)
            setUser({})
        })
    }, [user.email])

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser({ loggedIn: false });
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
