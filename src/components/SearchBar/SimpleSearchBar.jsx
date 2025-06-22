import React from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SimpleSearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
    return (
        <div className="search-bar-wrapper">
            <input
                type="text"
                placeholder={placeholder || 'Search...'}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
            <FiSearch className="search-icon" />
        </div>
    );
};

export default SimpleSearchBar;
