const socket = io();
const map = L.map("map").setView([0, 0], 13); // Default center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {}; // ✅ Store markers for all users
let isFirstLocationUpdate = true; // ✅ Prevents unnecessary resets

// ✅ Force Map to Render Immediately (Reduces Delay)
map.whenReady(() => {
    setTimeout(() => map.invalidateSize(), 100); // ✅ Faster load
});

// ✅ Immediately Fetch & Send Location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Your Location:", latitude, longitude);

            // ✅ Instantly set view before sending data
            map.setView([latitude, longitude], 18, { animate: true });

            // ✅ Send initial location to the server
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 2000, // ✅ Reduced timeout for fast response
            maximumAge: 500 // ✅ Cache to speed up reloading
        }
    );

    // ✅ Continuously update location
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // ✅ Only update the view once (prevents flickering)
            if (isFirstLocationUpdate) {
                map.setView([latitude, longitude], 25, { animate: true });
                isFirstLocationUpdate = false;
            }

            // ✅ Send live location updates
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// ✅ Receive Other Users' Locations & Update Markers
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (!markers[id]) {
        // ✅ If new user, add marker
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    } else {
        // ✅ Update existing marker position
        markers[id].setLatLng([latitude, longitude]);
    }
});

// ✅ Remove Markers When Users Disconnect
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove from map
        delete markers[id]; // Remove from list
    }
});
