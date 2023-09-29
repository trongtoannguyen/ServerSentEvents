const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const axios = require("axios");
const { Console } = require("console");

// Static folder
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/script"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Route cho SSE
//define route to send random number every 1 second
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  let totalBTC = 0;
  // Gửi sự kiện SSE đến máy khách mỗi giây
  setInterval(() => {
    let btcPrice =
      Math.floor((Math.random() * (28 - 16 + 1) + 16) * 1000) / 1000; //can use toFixed(3) to round to 3 decimal places
    let ethPrice =
      Math.floor((Math.random() * (3 - 1.6 + 1) + 1.6) * 1000) / 1000;
    totalBTC = totalBTC + btcPrice;
    // res.write(`data: ${}\n\n`);
    // stringify data to sent to client
    let data = JSON.stringify({
      btc: btcPrice,
      eth: ethPrice,
      totalBTC: totalBTC,
    });
    res.write(`data: ${data}\n\n`);
  }, 2000);
});

/**
 * url https://jsonplaceholder.typicode.com/todos/
 * define route to retrieve and send data from every 1 second
 */
app.get("/fetch", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  // Retrieve and sent sự kiện SSE đến máy khách mỗi giây
  setInterval(() => {
    let random = Math.floor(Math.random() * 10) + 1;
    try {
      axios
        .get("https://jsonplaceholder.typicode.com/comments/" + random)
        .then((data) => {
          console.log(data.data);
          data = JSON.stringify(data.data);
          res.write(`data: ${data}\n\n`);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }, 5000);
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
