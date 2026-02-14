const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- SUCCESS CRITERIA #4: Fairness Control 1 (IP Rate Limiting) ---
// Prevents automated bot voting by limiting requests per IP[cite: 17, 18].
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: "Too many votes from this IP. Please try again in 15 minutes."
});

app.use(cors());
app.use(express.json());

// --- SUCCESS CRITERIA #5: Persistence (MongoDB Atlas) ---
// Securely connects to the cloud using your credentials[cite: 20, 21, 22].
const rawPassword = "Rishav251220";
const encodedPassword = encodeURIComponent(rawPassword);
const dbURI = `mongodb+srv://rk6854797_db_user:${encodedPassword}@cluster0.nrdu9kr.mongodb.net/pollDB?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbURI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
    console.log("👉 Go to MongoDB Atlas -> Network Access -> Add IP '0.0.0.0/0'");
  });

const Poll = mongoose.model('Poll', new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ text: String, votes: { type: Number, default: 0 } }],
  createdAt: { type: Date, default: Date.now }
}));

// --- SUCCESS CRITERIA #3: Real-Time Integration ---
// Emits updates to all connected clients when a vote happens[cite: 13, 14, 15].
io.on('connection', (socket) => {
  socket.on('join-poll', (id) => socket.join(id));
});

// Create Poll Route [cite: 8, 9, 10]
app.post('/api/polls', async (req, res) => {
  try {
    const poll = await new Poll(req.body).save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// Join by Link Route [cite: 11, 12]
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    poll ? res.json(poll) : res.status(404).send("Poll not found");
  } catch (err) {
    res.status(400).send("Invalid Poll ID");
  }
});

// Vote Route with Anti-Abuse [cite: 12, 17]
app.post('/api/polls/:id/vote', voteLimiter, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (poll) {
      poll.options[optionIndex].votes += 1;
      await poll.save();
      // Broadcast to specific room [cite: 14]
      io.to(req.params.id).emit('pollUpdated', poll); 
      res.json(poll);
    }
  } catch (err) {
    res.status(500).send("Voting error");
  }
});

server.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));