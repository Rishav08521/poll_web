// Final Production Build

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = "https://poll-backend-f9nw.onrender.com";

// Create socket connection properly
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});

export default function PollView() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(localStorage.getItem(`voted_${id}`));
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/polls/${id}`);
        setPoll(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load poll.");
      }
    };

    fetchPoll();

    // Join poll room
    socket.emit('join-poll', id);

    // Listen for live updates
    socket.on('pollUpdated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    // Cleanup on unmount
    return () => {
      socket.off('pollUpdated');
    };

  }, [id]);

  const handleVote = async (index) => {
    if (voted) {
      return alert("You already voted!");
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/polls/${id}/vote`,
        { optionIndex: index }
      );

      setVoted(true);
      localStorage.setItem(`voted_${id}`, 'true');

    } catch (err) {
      console.error(err);
      alert("Voting failed. Try again.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!poll) return <p>Loading...</p>;

  // Calculate total votes for percentage
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div className="container poll-card">
      <h3>{poll.question}</h3>

      {poll.options.map((opt, i) => {
        const percentage = totalVotes
          ? ((opt.votes / totalVotes) * 100).toFixed(1)
          : 0;

        return (
          <div key={i} style={{ marginBottom: "15px" }}>
            <button
              disabled={voted}
              onClick={() => handleVote(i)}
            >
              {opt.text}
            </button>

            <div>
              {opt.votes} votes ({percentage}%)
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
