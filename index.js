const express = require("express");
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

let currentTrack = null;

io.on("connection", (socket) => {

  console.log("User connected");
  
socket.on("searching", () => {
  socket.broadcast.emit("searching");
});

socket.on("stop-searching", () => {
  socket.broadcast.emit("stop-searching");
});
 
 socket.on("typing", () => {
  socket.broadcast.emit("typing");
});

  socket.on("stop-typing", () => {
    socket.broadcast.emit("stop-typing");
  });


  if (currentTrack) {
    socket.emit("play-song", currentTrack);
  }


  socket.on("sender-messege", (data) => {

    if (typeof data === "string") {
      io.emit("messege", data);
      return;
    }

    if (data && data.text) {
      io.emit("messege", data);
    }
  });

  
  socket.on("play-song", (track) => {
    if (!track || !track.preview) return;

    currentTrack = track;
    io.emit("play-song", track);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

});


app.get("/search", async (req, res) => {
  try {
    const song = req.query.song;
    if (!song) return res.status(400).json({ error: "Song query missing" });

    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(song)}&media=music&limit=12`
    );

    const data = await response.json();

    const tracks = data.results
      .filter(track => track.previewUrl)
      .map(track => ({
        title: track.trackName,
        artist: track.artistName,
        preview: track.previewUrl,
        image: track.artworkUrl100
      }));

    res.json(tracks);

  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
