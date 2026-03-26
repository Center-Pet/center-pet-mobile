import React from 'react';
import './SearchBar.css';

const SearchBar = ({ placeholder = "Pesquisar...", onSearch }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder={placeholder}
        className="search-bar-input"
      />
      <button
        className="search-bar-button"
        onClick={onSearch}
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;