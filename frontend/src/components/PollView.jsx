import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

export default function PollView() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(localStorage.getItem(`voted_${id}`));

  useEffect(() => {
    axios.get(`http://localhost:5000/api/polls/${id}`).then(res => setPoll(res.data));
    socket.emit('join-poll', id);
    socket.on('pollUpdated', updatedPoll => setPoll(updatedPoll));
    return () => socket.off('pollUpdated');
  }, [id]);

  const handleVote = async (index) => {
    // Fairness Mechanism 2: Browser Local Storage [cite: 17, 18]
    if (voted) return alert("Already voted!");
    await axios.post(`http://localhost:5000/api/polls/${id}/vote`, { optionIndex: index });
    setVoted(true);
    localStorage.setItem(`voted_${id}`, 'true');
  };

  if (!poll) return <p>Loading...</p>;

  return (
    <div className="container poll-card">
      <h3>{poll.question}</h3>
      {poll.options.map((opt, i) => (
        <div key={i}>
          <button disabled={voted} onClick={() => handleVote(i)}>{opt.text}</button>
          <span>{opt.votes} votes</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(opt.votes / 10 || 1) * 10}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}