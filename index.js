const express = require("express");
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);



io.on("connection", (socket) => {
  console.log("User connected");

  // Chat messages
  socket.on("sender-messege", (messege) => {
    io.emit("messege", messege);
  });

  // Music sync
  socket.on("play-song", (track) => {
    if (!track || !track.preview) return;
    io.emit("play-song", track);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});



app.get("/search", async (req, res) => {
  try {
    const song = req.query.song;

    if (!song) {
      return res.status(400).json({ error: "Song query missing" });
    }

    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(song)}&media=music&limit=6`
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
