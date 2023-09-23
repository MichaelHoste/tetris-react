import React    from 'react';
import ReactDOM from 'react-dom/client';
import Tetris   from './Tetris';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Tetris />
  </React.StrictMode>
);
