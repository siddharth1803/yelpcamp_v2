import { useContext } from "react";
import { Link } from "react-router-dom"
import UserContext from "./UserContext";

export default function Navbar() {
    const { user } = useContext(UserContext);
    return (<>
        <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">YelpCamp</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link className="nav-link active" to="/">Campgrounds</Link>
                        {
                            user.loggedIn && <Link className="nav-link active" to="/new">New Campground</Link>
                        }
                    </div>
                    <div className="navbar-nav ms-auto">
                        {
                            !user.loggedIn && <><Link className="nav-link active" to="/register">Register</Link>
                                <Link className="nav-link active" to="/login">Login</Link></>
                        }
                        {user.loggedIn && <Link className="nav-link active" to="/logout">Logout</Link>}
                    </div>
                </div>
            </div>
        </nav></>)
}