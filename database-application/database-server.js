const http = require("http");

const PORT = 8901;
const DATABASE_SIZE = 100000;
const NUM_SHARDS = 4;

// The "database" is simply an ordered list of media chunk metadata objects.
const orderedLists = Array.from({ length: NUM_SHARDS }, () => []);

// Create fake media segment data and populate the database with the results.
// (The "database" is simply an ordered list in memory above.)
function createFakeMediaSegmentsData() {
  // Initialize the media timeline cursor
  let timelineCursor = Date.now();
  const maxDuration = 10000;
  const minDuration = 5000;

  for (let i = 0; i < DATABASE_SIZE; i++) {
    const duration = Math.round(
      Math.random() * (maxDuration - minDuration) + minDuration
    );

    const segment = {
      duration,
      start: timelineCursor,
      end: timelineCursor + duration,
      index: i,
    };

    timelineCursor += duration;
    orderedLists[i % NUM_SHARDS].push(segment);
  }
}

const server = http.createServer((req, res) => {
  const base = `http://localhost:${server.address().port}`;
  const url = new URL(req.url, base);

  const response = { result: null };
  let status = 404;

  if (url.pathname === "/range") {
    status = 200;
    response.result = {
      start: orderedLists[0][0].start,
      end: orderedLists[NUM_SHARDS - 1][NUM_SHARDS - 1].end,
      length: orderedLists.flat(1).length,
    };
  } else if (url.pathname === "/query") {
    const segmentIndex = parseInt(url.searchParams.get("index"), 10);
    const shardIndex = segmentIndex % NUM_SHARDS;
    const result =
      orderedLists[shardIndex].find((shard) => shard.index === segmentIndex) ||
      null;

    if (result) {
      status = 200;
    }

    response.result = result;
  } else {
    response.result = null;
  }

  const message = JSON.stringify(response);

  // Simulate disk and network work loads with a timeout.
  setTimeout(() => {
    res.writeHead(status, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(message),
    });

    res.end(message);
  }, 10);
});

server.on("listening", () => {
  const { port } = server.address();
  console.log("Database server listening on port", port);
});

// Seed the database and start the server.
createFakeMediaSegmentsData();
server.listen(PORT);
