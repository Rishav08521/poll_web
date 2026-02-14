import { useState } from 'react';
import axios from 'axios';

export default function PollCreator() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [link, setLink] = useState('');

  const createPoll = async () => {
    const formattedOptions = options.map(opt => ({ text: opt, votes: 0 }));
    const res = await axios.post('http://localhost:5000/api/polls', { question, options: formattedOptions });
    setLink(`${window.location.origin}/poll/${res.data._id}`); // Generate link [cite: 10]
  };

  return (
    <div className="container">
      <h2>Create a Poll</h2>
      <input placeholder="Question" onChange={e => setQuestion(e.target.value)} />
      {options.map((opt, i) => (
        <input key={i} placeholder={`Option ${i+1}`} onChange={e => {
          const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts);
        }} />
      ))}
      <button onClick={createPoll}>Create & Get Link</button>
      {link && <p>Share this: <input readOnly value={link} /></p>}
    </div>
  );
}