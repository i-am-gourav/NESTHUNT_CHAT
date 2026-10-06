mapboxgl.accessToken = mapToken;

if (!mapToken || mapToken.trim() === "" || mapToken === "undefined") {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-fallback d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center bg-light border rounded">
                <i class="fa-solid fa-map-location-dot fa-2x mb-2 text-danger"></i>
                <h6 class="fw-bold mb-1">Interactive Map Preview</h6>
                <p class="text-muted small mb-0">Please set <code>MAP_TOKEN</code> in your <code>.env</code> file to load the Mapbox map.</p>
            </div>
        `;
    }
} else {
    // Check if listing has valid geometry coordinates
    const hasCoordinates =
        listing &&
        listing.geometry &&
        Array.isArray(listing.geometry.coordinates) &&
        listing.geometry.coordinates.length === 2 &&
        typeof listing.geometry.coordinates[0] === "number" &&
        typeof listing.geometry.coordinates[1] === "number";

    if (hasCoordinates) {
        initMap(listing.geometry.coordinates);
    } else {
        // Fallback: Geocode on the fly using Mapbox Geocoding API if geometry is not yet stored
        const locationQuery = `${listing.location || ""}, ${listing.country || ""}`.trim();
        if (locationQuery) {
            fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    locationQuery
                )}.json?access_token=${mapToken}&limit=1`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.features && data.features.length > 0) {
                        initMap(data.features[0].geometry.coordinates);
                    } else {
                        // Default fallback coordinates (e.g. New Delhi [77.2090, 28.6139])
                        initMap([77.2090, 28.6139]);
                    }
                })
                .catch((err) => {
                    console.error("Geocoding lookup error:", err);
                    initMap([77.2090, 28.6139]);
                });
        } else {
            initMap([77.2090, 28.6139]);
        }
    }
}

function initMap(coordinates) {
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 9
    });

    // Add navigation controls (zoom & rotation)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Create marker popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="map-popup-card">
            <h6 class="fw-bold mb-1">${listing.title || "Listing"}</h6>
            <p class="text-muted small mb-1">${listing.location || ""}, ${listing.country || ""}</p>
            <p class="small text-danger fw-semibold mb-0">Exact location provided after booking</p>
        </div>
    `);

    // Add marker
    new mapboxgl.Marker({ color: "#fe424d" })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);
}
