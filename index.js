const express = require("express");
const { createServer } = require("node:http");  // making request to http for making the connection succesfully
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

//io=input-output making communication between sockets
const io = new Server(server);

//making connection
io.on("connection", (socket) => {  //socket = client
 socket.on("sender-messege",(messege)=>{
    console.log('A new user messege',messege);
    io.emit("messege",messege);
    
 })
});

app.use(express.static(path.join(__dirname, "public")));

server.listen(3000, () => {
  console.log("server running at port 3000"); 
}); 
