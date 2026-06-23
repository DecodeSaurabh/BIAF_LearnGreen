import React from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import Header from './components/Header';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <FileUploader />
      </main>
    </div>
  );
}

export default App;