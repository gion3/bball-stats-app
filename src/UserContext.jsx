import {createContext, useContext,useState, useEffect} from "react";
import axios from "axios";
import { auth } from "./firebaseConfig";

export const GlobalContext = createContext(null);


export const GlobalProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);

    
    // Load current game date
    const fetchCurrentDate = async () => {
    try {
            const res = await axios.get("/api/global-date");
            setCurrentDate(res.data.current_game_date);
        } catch (err) {
            console.error("Failed to fetch current date", err);
        }
    };

    const updateCurrentDate = async (newDate) => {
        try {
          await axios.put("/api/global-date", { current_game_date: newDate });
          setCurrentDate(newDate);
        } catch (err) {
          console.error("Failed to update date", err);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        fetchCurrentDate();
    }, []);

    console.log(user);

    return (
        <GlobalContext.Provider value={{currentDate, setCurrentDate: updateCurrentDate, user }}>
            {children}
        </GlobalContext.Provider>
    );
}

