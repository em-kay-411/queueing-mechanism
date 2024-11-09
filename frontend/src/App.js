import './App.css';
import Home from './components/Home';
import Waiting from './components/Waiting';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/waiting' element={<Waiting/>} />
        </Routes>
      </div>
    </BrowserRouter>


  );
}

export default App;
