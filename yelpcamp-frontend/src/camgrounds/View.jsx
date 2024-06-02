import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Rating } from "@mui/material";
import Map, { Marker, NavigationControl } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import UserContext from "../components/UserContext";

export default function ViewCamp() {
    const { user } = useContext(UserContext)

    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id")
    const [campground, updateCampground] = useState([])
    const [allRatings, updateAllRatings] = useState([])
    const [rating, setRating] = useState(0);
    const mapRef = useRef(null);
    const [body, updateBody] = useState("")

    const performDelete = (e) => {
        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${id}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        }).then((resp) => {
            if (resp.data.success) {
                navigate("/");
            }
        }).catch((resp) => {
            console.log(resp);
        });
    }

    const addComment = (e) => {
        e.preventDefault()
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${id}/reviews`, { body, rating },
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        ).then(response => {
            if (response.data.success) {
                updateBody("")
                setRating(0)
                updateAllRatings(rating => {
                    const newRatings = [...rating]
                    newRatings.push(response.data.review)
                    return newRatings
                })
            }
        }).catch(error => {
            console.log(error)
        })
    }

    const deleteComment = (e, reviewId) => {

        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${id}/reviews/${reviewId}`,
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        ).then(response => {
            if (response.data.success) {
                updateAllRatings(prevRatings => {
                    return prevRatings.filter(review => {
                        return review._id != reviewId
                    })
                })
            }
        }).catch(error => {
            console.log(error)
        })
    }

    const onClick = (e, lang, lat) => {
        new mapboxgl.Popup()
            .setLngLat([lang, lat])
            .setHTML(
                `<h5>${campground.title}</h5><p>${campground.location}</p>`
            )
            .addTo(mapRef.current.getMap());
    }

    useEffect(() => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${id}`, {
        })
            .then((resp) => {
                setLoading(false)
                updateCampground(resp.data)
                updateAllRatings(resp.data.reviews)
            }).catch((err) => {
                console.log(err)
                updateCampground([])
            })
    }, [id])
    return (<>
        {loading && (
            <div className="m-5" >
                <img
                    src="https://i.giphy.com/dgZYnH2enJ1h6ZBoic.webp"
                    style={{ display: "block", margin: "auto" }}
                />
            </div>
        )}
        <div className="container row mt-2">
            <div className="col-6 ">
                <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner ">
                        {campground.images && campground.images.map((img, i) => {
                            return (<div key={i} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
                                <img src={img.url} className="d-block w-100" style={{ width: "300px", height: "400px", objectFit: "cover" }}
                                    alt="" />
                            </div>)
                        })}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls"
                        data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls"
                        data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>

                </div>
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">
                            {campground.title}
                        </h5>
                        <p className="card-text">
                            {campground.description}
                        </p>
                    </div>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item text-muted">
                            {campground.location}
                        </li>
                        <li className="list-group-item">Author:
                            <Link
                                to={`/?username=${campground.author ? campground.author.username : ""}`}>
                                {campground.author && campground.author.username}
                            </Link>
                        </li>
                        <li className="list-group-item"> ₹{campground.price}/night</li>
                    </ul>
                    {user.loggedIn && campground.author && user.userId == campground.author._id && <div className="card-body">
                        <Link to={`/edit?id=${campground._id}`} className="card-link btn btn-info" >Edit</Link>
                        <button onClick={performDelete} className="btn btn-danger">Delete</button>

                    </div>}
                    <div className="card-footer text-muted">
                        2 days ago
                    </div>
                </div>
            </div>
            <div className="col-6">
                {campground.geometry && <Map
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    initialViewState={{
                        longitude: campground.geometry.coordinates[0],
                        latitude: campground.geometry.coordinates[1],
                        zoom: 8,

                    }}
                    ref={mapRef}
                    style={{ width: 600, height: 400 }}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    onClick={(e) => onClick(e, campground.geometry.coordinates[0], campground.geometry.coordinates[1])}

                >
                    <Marker
                        longitude={campground.geometry.coordinates[0]} latitude={campground.geometry.coordinates[1]} anchor="bottom" >
                        <img src="https://res.cloudinary.com/ddldfbxee/image/upload/v1717253478/YelpCamp/pointer_b27hac.svg"
                            style={{ width: "30px", height: "30px" }} />
                    </Marker>
                    <NavigationControl />
                </Map>}

                {user.loggedIn && <><h2>Leave a Review</h2>
                    <form onSubmit={addComment} className="mb-3 needs-validation">
                        <div>
                            <label className="form-label" htmlFor="review">Rating</label><br />
                            <Rating
                                name="simple-controlled"
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue);
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="body">Review</label>
                            <textarea className="form-control" name="body" id="body" cols="30" rows="3"
                                required value={body} onChange={(e) => updateBody(e.target.value)}></textarea>
                            <div className="valid-feedback">
                                Looks good!
                            </div>
                        </div>
                        <button className="btn btn-success">Submit</button>
                    </form></>}

                {allRatings.map((review, index) => {
                    return (<div key={index}>
                        <div className="card mb-3 ">
                            <div className="card-body">
                                <h5 className="card-title">By: {review.author.username}
                                </h5>
                                <p>
                                    <Rating name="read-only" value={review.rating} readOnly />
                                </p>
                                <p className="card-text">Review: {review.body}
                                </p>
                                {
                                    user.loggedIn && user.userId == review.author._id && <button onClick={(e) => deleteComment(e, review._id)} className="btn btn-sm btn-danger">Delete</button>
                                }

                            </div>
                        </div>
                    </div>)
                })}
            </div>
        </div>

    </>)
}