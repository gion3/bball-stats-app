import React, {useState} from "react";

function SearchBar({setPlayers}){
    const [input, setInput] = useState('');

    const fetchData = (value) => {
        fetch(`http://localhost:3000/api/players?player=${(value)}`)
            .then((response) => response.json())
            .then((data) => {
                setPlayers(data) // Logs the filtered player results
            })
            .catch((error) => console.error("Error fetching data:", error));
    };
    

    const handleChange = (value) =>{
        setInput(value);
        fetchData(value);
    }

    return(
        <div className="p-2 bg-white w-full">
            <input
                type="text"
                placeholder="Search players"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                className="border-none padding-5px border-radius-5px width-100%"
            /> 

        </div>
    )
};

export default SearchBar;