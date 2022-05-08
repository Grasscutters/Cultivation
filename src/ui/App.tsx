import React from 'react';
import logo from './logo.svg';
import './App.css';

function buttonFunctionality() {
  alert('Button clicked!');
}

function App() {
  return (
    <div className="App">
      <button onClick={buttonFunctionality}>Cool button</button>
    </div>
  );
}

export default App;
