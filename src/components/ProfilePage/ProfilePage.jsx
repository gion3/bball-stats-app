import { useContext } from "react";
import { UserContext } from "../../UserContext";
import "./ProfilePage.css";

const ProfilePage = () => {
    const user = useContext(UserContext);


    return (
        <div>
            <h1>Profile Page, {user.email}, {user.displayName}</h1>
        </div>
    );
};

export default ProfilePage;