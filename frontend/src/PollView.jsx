const handleVote = async (index) => {
  // Check if user already voted (Mechanism 2) [cite: 17, 19]
  if (localStorage.getItem(`voted_${pollId}`)) {
    alert("You have already voted on this poll!");
    return;
  }

  await axios.post(`http://localhost:5000/api/polls/${pollId}/vote`, { optionIndex: index });
  localStorage.setItem(`voted_${pollId}`, 'true'); // Save vote status locally 
};