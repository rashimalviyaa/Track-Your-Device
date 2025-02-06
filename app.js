const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*", // Allow connections from any origin (Change if needed)
        methods: ["GET", "POST"]
    },
    pingInterval: 25000, // ✅ Sends a ping every 25 seconds (prevents disconnects)
    pingTimeout: 60000  // ✅ Disconnects only if no response in 60 seconds
});

// ✅ Serve static files correctly
app.use(express.static(path.join(__dirname, "public")));

// ✅ Setup EJS
app.set("view engine", "ejs");

// ✅ Handle Socket.io connection
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // ✅ Receive location from client & broadcast it
    socket.on("send-location", (data) => {
        console.log(`📍 Received location from ${socket.id}:`, data);
        io.emit("receive-location", { id: socket.id, ...data }); // Broadcast location
    });

    // ✅ Handle disconnection
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// ✅ Route to render the homepage
app.get("/", (req, res) => {
    res.render("index");
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
