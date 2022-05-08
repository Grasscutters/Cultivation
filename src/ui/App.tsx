import React from 'react';
import logo from './logo.svg';
import './App.css';

// Major Components
import Topbar from './components/TopBar'

function App() {
  return (
    <div className="App">
      <Topbar />
      <button onClick={() => console.log("cum")}>Cool button</button>
    </div>
  );
}

export default App;
