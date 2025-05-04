import {createContext, useState, useEffect} from "react";
import { auth } from "./firebaseConfig";

export const UserContext = createContext(null);


export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);
    
    console.log(user);

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
}

