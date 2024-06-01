import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
    const navigate = useNavigate()
    const [details, updateDetails] = useState({
        username: "",
        password: "",
        email: ""
    })
    const [error, updateError] = useState(null)
    const [loading, setLoading] = useState(false)


    const updateUserData = (e) => {
        updateDetails((prevData => {
            return { ...prevData, [e.target.name]: e.target.value }
        }))
    }

    const registerUser = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, details,
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        ).then(response => {
            if (response.data.success) {
                updateError(null)
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
                            {error && <div className="alert alert-danger" role="alert">
                                {error}
                            </div>}
                            <h5 className="card-title">Register</h5>
                            <form onSubmit={registerUser} className="needs-validation" noValidate>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username">Username</label>
                                    <input className="form-control" type="text" id="username" name="username" required
                                        value={details.username} onChange={updateUserData} />
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="email">Email</label>
                                    <input className="form-control" type="email" id="email" name="email" required value={details.email} onChange={updateUserData} />
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password">Password</label>
                                    <input className="form-control" type="password" id="password" name="password" required value={details.password} onChange={updateUserData} />
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <button className="btn btn-success btn-block">Register</button>
                            </form>
                            {loading &&
                                <>
                                    <div class="spinner-grow" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p>loading please wait...</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}