import { Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/login.component';
import SignUp from './components/signup.component';
import './App.css';
import InventoryItems from './components/InventoryItems';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/InventoryItems" element={<InventoryItems />} />
      </Routes>
    </div>
  );
}

export default App;