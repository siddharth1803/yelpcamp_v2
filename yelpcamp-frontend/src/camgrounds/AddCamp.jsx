import axios from "axios"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function AddCamp() {
    const [campData, updateCampData] = useState({
        title: "",
        location: "",
        price: "",
        description: "",
        images: []

    })
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)


    const updateDetails = (e) => {
        updateCampData(prevVal => {
            return { ...prevVal, [e.target.name]: e.target.value }
        })
    }
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        updateCampData(prevVal => {
            return { ...prevVal, [name]: files };
        });
    }
    const createCamp = (e) => {
        e.preventDefault()
        let formData = new FormData();
        for (const key in campData) {
            if (key === 'images') {
                for (let i = 0; i < campData.images.length; i++) {
                    formData.append('images', campData.images[i]);
                }
            }
            else {
                formData.append(key, campData[key]);
            }
        }
        setLoading(true)
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/campgrounds`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        }).then((resp) => {
            if (resp.data.success) {
                setLoading(false)
                navigate(`/campground?id=${resp.data.campground.id}`);
            }
        }).catch((resp) => {
            setLoading(false)
            console.log(resp);
        });
    }

    return (<>
        <div className="row">
            <h1 className="text-center">New Campground</h1>
            <div className="col-6 offset-3">
                <form onSubmit={createCamp}>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="title">Title</label>
                        <input onChange={updateDetails} autoFocus className="form-control" type="text" id="title" name="title" value={campData.title} required />
                        <div className="valid-feedback">Looks Good</div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="location">Location</label>
                            <input onChange={updateDetails} className="form-control" type="text" id="location" name="location" value={campData.location} required />
                            <div className="valid-feedback">Looks Good</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="price">Campground Price</label>
                            <div className="input-group">
                                <span className="input-group-text" id="price-label">₹</span>
                                <input onChange={updateDetails} type="number" step="any" className="form-control" id="price" placeholder="0.00"
                                    aria-label="price" aria-describedby="price-label" name="price" required value={campData.price} />
                                <div className="valid-feedback">Looks Good</div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="description">Description</label>
                            <textarea onChange={updateDetails} className="form-control" type="text" id="description" value={campData.description} name="description"
                                required></textarea>
                            <div className="valid-feedback">Looks Good</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="image">Add Images</label>
                            <input className="form-control" type="file" id="image" name="images" required multiple onChange={handleFileChange} />
                            <div className="valid-feedback">Looks Good</div>
                        </div>

                        <div className="mb-3">
                            <button className="btn btn-success">Add Campground</button>
                        </div>
                    </div>
                </form>
                {loading &&
                    <>
                        <div class="spinner-grow" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>loading please wait...</p>
                    </>
                }
                <Link to="/">All Campgrounds</Link>
            </div>
        </div>
    </>)
}