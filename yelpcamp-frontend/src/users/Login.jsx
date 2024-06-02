import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const navigate = useNavigate()
    const [details, updateDetails] = useState({
        username: "",
        password: ""
    })
    const [error, updateError] = useState(null)
    const [loading, setLoading] = useState(false)


    const updateUserData = (e) => {
        updateDetails((prevData => {
            return { ...prevData, [e.target.name]: e.target.value }
        }))
    }
    const loginUser = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, details,
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        ).then(response => {
            if (response.data.success) {
                setLoading(false)
                navigate("/");
                window.location.reload();
            }
        }).catch(error => {
            setLoading(false)
            error && error.response && updateError(error.response.data.message)
        })
    }

    return (<>
        <div className="container d-flex justify-content-center align-items-center mb-5">
            <div className="row">
                <div className="col-md-6 offset-md-3 col-xl-4 offset-xl-4">
                    <div className="card shadow">
                        <img src="https://images.unsplash.com/photo-1571863533956-01c88e79957e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80"
                            alt="" className="card-img-top" />
                        <div className="card-body">
                            {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {error}
                            </div>}
                            <h5 className="card-title">Login</h5>
                            <form method="post" action={`${import.meta.env.VITE_API_BASE_URL}/login`} className="needs-validation" noValidate>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username">Username</label>
                                    <input className="form-control"
                                        value={details.username}
                                        type="text"
                                        id="username"
                                        name="username"
                                        required
                                        onChange={updateUserData} />
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password">Password</label>
                                    <input className="form-control"
                                        value={details.password}
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        onChange={updateUserData} />
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <button className="btn btn-success btn-block">Login</button>
                            </form>
                            {loading &&
                                <>
                                    <div className="spinner-grow" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p>loading please wait...</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div></>)
}