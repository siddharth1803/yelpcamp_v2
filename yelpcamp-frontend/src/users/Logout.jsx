import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import UserContext from "../components/UserContext";


export default function Logout() {
    const navigate = useNavigate()
    const { logout } = useContext(UserContext);


    useEffect(() => {
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`, {},
            { headers: { "Content-Type": "application/json" }, withCredentials: true })
            .then((resp) => {
                if (resp.data.success) {
                    logout()
                    navigate("/")
                }
            }).catch((resp) => {
                console.log(resp)
            })
    }, [])
}