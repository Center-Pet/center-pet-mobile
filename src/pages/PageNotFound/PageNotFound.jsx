import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';

const PageNotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">Página não encontrada</h1>
      <p className="not-found-subtitle">
        Que tal ir ao{' '}
        <Link to="/home" className="home-link">
          início
        </Link>
        ?
      </p>
    </div>
  );
};

export default PageNotFound;