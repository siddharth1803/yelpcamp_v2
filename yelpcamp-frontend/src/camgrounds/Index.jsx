import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from '../layer';
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, NavigationControl } from 'react-map-gl';

export default function Index() {
    const [campgrounds, updateCampgrounds] = useState([])
    const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2lkZGhhcnRoMTgwMyIsImEiOiJjbHZxanB4MGwwaDgwMnFxejVycDNldzdnIn0.d1-MhE1_CRUvWpA5zqDqJQ';
    const mapRef = useRef(null);
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get("username")
    const pno = queryParams.get("pno") ? queryParams.get("pno") : 1

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pno])

    let start = (pno - 1) * 10;

    const onClick = (event) => {

        if (!event.features || event.features.length === 0) {
            return;
        }

        const feature = event.features[0];
        const clusterId = feature.properties.cluster_id;

        if (clusterId) {
            const mapboxSource = mapRef.current.getSource('campgrounds');

            mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) {
                    return;
                }
                mapRef.current.easeTo({
                    center: feature.geometry.coordinates,
                    zoom,
                    duration: 500
                });
            });
        } else {
            const coordinates = feature.geometry.coordinates
            const popupContent = feature.properties.popup;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(mapRef.current.getMap());
        }
    };


    useEffect(() => {
        if (username) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/getCampgroundsByUser/${username}`)
                .then((resp) => {
                    updateCampgrounds(resp.data)
                }).catch((err) => {
                    console.log(err)
                    updateCampgrounds([])
                })
        }
        else {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds`)
                .then((resp) => {
                    updateCampgrounds(resp.data)
                }).catch((err) => {
                    console.log(err)
                    updateCampgrounds([])
                })
        }
    }, [username])

    const searchAction = (e) => {
        updateCampgrounds((prevVal) => {
            return prevVal.filter((val) => {
                return val.title.toLowerCase().search(e.target.value) != -1
            })
        })
    }
    let pages = Array(Math.ceil(campgrounds.length / 10)).fill(0)


    return (<div>
        <div style={{ height: "500px" }}>
            <Map
                initialViewState={{
                    latitude: 21,
                    longitude: 79,
                    zoom: 3.4
                }}
                mapStyle="mapbox://styles/mapbox/dark-v9"
                mapboxAccessToken={MAPBOX_TOKEN}
                interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
                onClick={onClick}
                ref={mapRef}
            >
                <Source
                    id="campgrounds"
                    type="geojson"
                    data={{ features: campgrounds }}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />
                    <Layer {...unclusteredPointLayer} />
                </Source>
                <NavigationControl />
            </Map>
        </div>
        <h1>All Campgrounds</h1>
        <div className="input-group mb-3">
            <input type="text" className="form-control" onChange={searchAction} placeholder="Search For Campgrounds" name="query" />
        </div>
        <div>
            {campgrounds.slice(start, start + 10).map((campground, index) => {
                return (<div key={index} className="card mb-3">
                    <div className="row">
                        <div className="col-md-3">
                            {campground.images && campground.images.length ?
                                <img className="img-fluid" src={campground.images[0].url} style={{ width: "300px", height: "200px", objectFit: "cover" }} />
                                :
                                <img src="https://res.cloudinary.com/ddldfbxee/image/upload/v1714835367/YelpCamp/xkojvq7atfgm7kzw50fm.jpg"
                                    style={{ width: "300px", height: "200px", objectFit: "cover" }} className="img-fluid" />}

                        </div>
                        <div className="col-md-8">
                            <div className="card-body">
                                <h5 className="card-title">
                                    {campground.title}
                                </h5>
                                <p className="card-text">
                                    {campground.description}
                                </p>
                                <p className="card-text">
                                    <small className="text-muted">
                                        {campground.location}
                                    </small>
                                </p>
                                <Link to={`/campground?id=${campground._id}`} state={campground} className="btn btn-primary">
                                    View {campground.title}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>)
            })}

            <div className="btn-toolbar" style={{ overflowX: "auto" }} role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group mr-2" role="group" aria-label="First group">
                    {
                        pages.map((item, index) => {
                            return (<Link key={index} to={username ? `/?username=${username}&pno=${index + 1}` : `/?pno=${index + 1}`} type="button"
                                className="btn btn-secondary">
                                {index + 1}
                            </Link>)
                        })
                    }
                </div>
            </div>
        </div>
    </div>)
}