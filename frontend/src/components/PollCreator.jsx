// Final Production Build

import { useState } from 'react';
import axios from 'axios';

export default function PollCreator() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = "https://poll-backend-f9nw.onrender.com";

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const createPoll = async () => {
    setError('');

    if (!question.trim()) {
      return setError("Question is required.");
    }

    if (options.some(opt => !opt.trim())) {
      return setError("All options must be filled.");
    }

    try {
      setLoading(true);

      const formattedOptions = options.map(opt => ({
        text: opt,
        votes: 0
      }));

      const res = await axios.post(
        `${BACKEND_URL}/api/polls`,
        { question, options: formattedOptions }
      );

      const pollLink = `${window.location.origin}/poll/${res.data._id}`;
      setLink(pollLink);

    } catch (err) {
      console.error(err);
      setError("Failed to create poll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Create a Poll</h2>

      <input
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {options.map((opt, i) => (
        <input
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => handleOptionChange(e.target.value, i)}
        />
      ))}

      <button onClick={addOption}>
        + Add Option
      </button>

      <button onClick={createPoll} disabled={loading}>
        {loading ? "Creating..." : "Create & Get Link"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {link && (
        <div>
          <p>Share this link:</p>
          <input readOnly value={link} />
        </div>
      )}
    </div>
  );
}
