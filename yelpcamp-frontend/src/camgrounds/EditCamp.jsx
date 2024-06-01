import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditCamp() {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id")
    const [campground, updateCampground] = useState({})
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${id}`, {
        })
            .then((resp) => {
                let campData = resp.data
                updateCampground({
                    _id: campData._id,
                    title: campData.title,
                    description: campData.description,
                    price: campData.price,
                    location: campData.location,
                    currImages: campData.images,
                    deleteImages: [],
                    images: []
                })
            }).catch((err) => {
                console.log(err)
                updateCampground({})
            })
    }, [])

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        updateCampground(prevVal => {
            return { ...prevVal, [name]: files };
        });
    }
    const updateCampData = (e) => {
        updateCampground(prevVal => {
            return { ...prevVal, [e.target.name]: e.target.value }
        })
    }

    const updateDeleteImages = (e) => {
        const value = e.target.value;
        updateCampground(prevVal => {
            const newData = { ...prevVal };
            if (e.target.checked) {
                if (!newData.deleteImages.includes(value)) {
                    newData.deleteImages.push(value);
                }
            } else {
                newData.deleteImages = newData.deleteImages.filter(image => image !== value);
            }
            return newData;
        });
    };

    const editCampGround = (e) => {
        e.preventDefault()
        let formData = new FormData();
        for (const key in campground) {
            if (key === "currImages")
                continue
            if (key === 'images') {
                for (let i = 0; i < campground.images.length; i++) {
                    formData.append('images', campground.images[i]);
                }
            }
            else if (key == "deleteImages") {
                for (let i = 0; i < campground.deleteImages.length; i++) {
                    formData.append('deleteImages', campground.deleteImages[i]);
                }
            }
            else {
                formData.append(key, campground[key]);
            }
        }
        setLoading(true)
        axios.put(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/${campground._id}`, formData, {
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
        {Object.keys(campground).length && <div className="row">
            <h1 className="text-center">Edit Campground</h1>
            <div className="col-6 offset-3">

                <form noValidate onSubmit={editCampGround}
                    className="needs-validation">
                    <div className="mb-3">
                        <label className="form-label" htmlFor="title">Title</label>
                        <input onChange={updateCampData} className="form-control" type="text" id="title" name="title"
                            value={campground.title} required />
                        <div className="valid-feedback">Looks Good</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="location">Location</label>
                        <input onChange={updateCampData} className="form-control" type="text" id="location" name="location"
                            value={campground.location} required />
                        <div className="valid-feedback">Looks Good</div>
                    </div>
                    <div className="mb-3">
                        <label onChange={updateCampData} className="form-label" htmlFor="price">Campground Price</label>
                        <div className="input-group">
                            <span className="input-group-text" id="price-label">₹</span>
                            <input type="text" className="form-control" id="price" placeholder="0.00" aria-label="price"
                                aria-describedby="price-label" name="price" value={campground.price} onChange={updateCampData}
                                required />
                            <div className="valid-feedback">Looks Good</div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="description">Description</label>
                        <textarea onChange={updateCampData} className="form-control" type="text" id="description"
                            name="description" value={campground.description} required></textarea>
                        <div className="valid-feedback">Looks Good</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="image">Add Images</label>
                        <input onChange={handleFileChange} className="form-control" type="file" id="image" name="images" multiple />
                        <div className="valid-feedback">Looks Good</div>
                    </div>

                    <div className="mb-3 d-flex">
                        {campground.currImages.map((img, index) => {
                            return (<div className="m-2" key={index}><img src={img.url} style={{ width: "150px", height: "150px" }} />
                                <div className="form-check">
                                    <input onChange={updateDeleteImages} type="checkbox" value={img.filename} id={index} name="deleteImages"
                                    />
                                    <label htmlFor={index}>Delete</label>

                                </div></div>)
                        })}
                    </div>

                    <div className="mb-3">
                        <button className="btn btn-info">Update Campground</button>
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
                <a href="/">Back To Campground</a>

            </div>
        </div>}
    </>)
}