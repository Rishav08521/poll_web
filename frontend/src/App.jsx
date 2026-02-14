import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PollCreator from './components/PollCreator';
import PollView from './components/PollView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Success Criteria #1: Creation [cite: 8] */}
        <Route path="/" element={<PollCreator />} />
        {/* Success Criteria #2: Join by Link [cite: 11] */}
        <Route path="/poll/:id" element={<PollView />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;