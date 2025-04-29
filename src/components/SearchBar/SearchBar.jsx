import React, {useState, useEffect, useRef} from "react";
import {FiSearch} from "react-icons/fi";
import './SearchBar.css';
import { useNavigate } from "react-router-dom";

function SearchBar(){
    const [input, setInput] = useState('');
    const [players,setPlayers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const searchRef = useRef(null);

    const navigate = useNavigate();


    useEffect(() => {
        if (!input) {
          setPlayers([]);
          return;
        }
    
        const handler = setTimeout(() => {
          fetch(`http://localhost:5000/api/players/search/${input}`)
            .then((response) => response.json())
            .then((data) => setPlayers(data))
            .catch((error) => console.error("Error fetching data:", error));
        }, 300);
    
        //trebuie sa apelam clearTimeout pentru a nu face requesturi excesive daca utilizatorul scrie prea repede - discutie
        return () => clearTimeout(handler);
    }, [input]);

    useEffect(() => {
        const handleClickOutside = (e) =>{
            if(searchRef.current && !searchRef.current.contains(e.target)){
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    })
    
    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const handleClick = (id) =>{
        navigate(`/players/${id}`);
        setInput('');
    }

    return(
    <div>
        <div className="search-bar-wrapper" ref={searchRef}>
            <input
                type="text"
                placeholder="Search players"
                value={input}
                onChange={handleChange}
                onFocus={() => setIsDropdownOpen(true)}
                className="search-input"
            />
            <FiSearch className="search-icon" />
        </div>
        {isDropdownOpen && input && (
        <div className="dropdown-menu">
            {players.length > 0 ? ( //daca gasim rezultate
            <ul>
                {players.map((player) => (
                    <li key = {player.PLAYER_ID} className="dropdown-item" onMouseDown={() => handleClick(player.PLAYER_ID)}>
                        {player.PLAYER_NAME}
                    </li>
                ))}
            </ul>
            ) : (
            <div className="dropdown-item" style={{ color: "#888" , cursor: "default"}}>
                No players found
              </div>
              )
            }
        </div>
        )}
    </div>
    )
};

export default SearchBar;