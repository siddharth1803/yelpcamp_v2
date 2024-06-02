import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";

export default function Index() {
    const [loading, setLoading] = useState(false);
    const [campgrounds, updateCampgrounds] = useState([]);
    const [filteredCampgrounds, setFilteredCampgrounds] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get("username");
    const pno = queryParams.get("pno") ? queryParams.get("pno") : 1;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pno]);

    let start = (pno - 1) * 10;

    useEffect(() => {
        setLoading(true);
        if (username) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds/getCampgroundsByUser/${username}`)
                .then((resp) => {
                    setLoading(false);
                    updateCampgrounds(resp.data);
                    setFilteredCampgrounds(resp.data);
                }).catch((err) => {
                    setLoading(false);
                    updateCampgrounds([]);
                    setFilteredCampgrounds([]);
                });
        }
        else {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/campgrounds`)
                .then((resp) => {
                    setLoading(false);
                    updateCampgrounds(resp.data);
                    setFilteredCampgrounds(resp.data);
                }).catch((err) => {
                    setLoading(false);
                    updateCampgrounds([]);
                    setFilteredCampgrounds([]);
                });
        }
    }, [username]);


    const searchAction = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = campgrounds.filter((val) => {
            return val.title.toLowerCase().includes(searchTerm)
                || val.location.toLowerCase().includes(searchTerm)
                || val.description.toLowerCase().includes(searchTerm);
        });
        setFilteredCampgrounds(filtered);
    };


    // let pages = Array(Math.ceil(campgrounds.length / 10)).fill(0);
    let pages = Array(Math.ceil(filteredCampgrounds.length / 10)).fill(0);

    let mapContainer = useRef(null);
    let map = useRef(null);

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    useEffect(() => {
        if (!map.current && mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [79, 21],
                zoom: 3.5
            });

            map.current.on('load', () => {
                if (!map.current.getSource('campgrounds')) {
                    map.current.addSource('campgrounds', {
                        type: 'geojson',
                        data: { features: filteredCampgrounds },
                        cluster: true,
                        clusterMaxZoom: 14,
                        clusterRadius: 50
                    });
                }

                map.current.addControl(new mapboxgl.NavigationControl());

                if (!map.current.getLayer('clusters')) {
                    map.current.addLayer({
                        id: 'clusters',
                        type: 'circle',
                        source: 'campgrounds',
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-color': [
                                'step',
                                ['get', 'point_count'],
                                '#00BCD4',
                                10,
                                '#2196F3',
                                30,
                                '#3F51B5'
                            ],
                            'circle-radius': [
                                'step',
                                ['get', 'point_count'],
                                15,
                                10, //pt
                                20,
                                30, //pt 
                                25
                            ]
                        }
                    });
                }

                if (!map.current.getLayer('cluster-count')) {
                    map.current.addLayer({
                        id: 'cluster-count',
                        type: 'symbol',
                        source: 'campgrounds',
                        filter: ['has', 'point_count'],
                        layout: {
                            'text-field': ['get', 'point_count_abbreviated'],
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        }
                    });
                }

                if (!map.current.getLayer('unclustered-point')) {
                    map.current.addLayer({
                        id: 'unclustered-point',
                        type: 'circle',
                        source: 'campgrounds',
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-color': '#11b4da',
                            'circle-radius': 4,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff'
                        }
                    });
                }

                // inspect a cluster on click
                map.current.on('click', 'clusters', (e) => {
                    const features = map.current.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    });
                    const clusterId = features[0].properties.cluster_id;
                    map.current.getSource('campgrounds').getClusterExpansionZoom(
                        clusterId,
                        (err, zoom) => {
                            if (err) return;

                            map.current.easeTo({
                                center: features[0].geometry.coordinates,
                                zoom: zoom
                            });
                        }
                    );
                });

                map.current.on('click', 'unclustered-point', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const text = e.features[0].properties.popup;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(text)
                        .addTo(map.current);
                });

                map.current.on('mouseenter', 'clusters', () => {
                    map.current.getCanvas().style.cursor = 'pointer';
                });
                map.current.on('mouseleave', 'clusters', () => {
                    map.current.getCanvas().style.cursor = '';
                });
            });
        }

        if (map.current.getSource('campgrounds')) {
            map.current.getSource('campgrounds').setData({ features: filteredCampgrounds });
        }

    }, [filteredCampgrounds]);

    return (
        <>
            {loading && (
                <div className="m-5">
                    <img
                        src="https://gifdb.com/images/high/buffering-loading-please-wait-icon-thinking-man-xgqfxx8mjavh8fr2.webp"
                        style={{ display: "block", margin: "auto" }}
                    />
                </div>
            )}
            <div ref={mapContainer} style={{ height: "500px" }} className="mb-5" />

            <h1>All Campgrounds</h1>
            <div className="input-group mb-3">
                <input type="text" className="form-control" onChange={searchAction} placeholder="Search For Campgrounds" name="query" />
            </div>
            <div>
                {filteredCampgrounds.slice(start, start + 10).map((campground, index) => {
                    return (
                        <div key={index} className="card mb-3">
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
                        </div>
                    );
                })}

                <div className="btn-toolbar" style={{ overflowX: "auto" }} role="toolbar" aria-label="Toolbar with button groups">
                    <div className="btn-group mr-2" role="group" aria-label="First group">
                        {
                            pages.map((item, index) => {
                                return (
                                    <Link key={index} to={username ? `/?username=${username}&pno=${index + 1}` : `/?pno=${index + 1}`} type="button"
                                        className="btn btn-secondary">
                                        {index + 1}
                                    </Link>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
