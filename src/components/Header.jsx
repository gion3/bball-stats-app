import { FiSettings, FiUser } from "react-icons/fi"; 
import { auth } from "../firebaseConfig";
import { NavLink,useLocation } from "react-router-dom";
import SearchBar from "./SearchBar/SearchBar";
import { signOut } from "firebase/auth";
import logo from "../assets/logo_with_ball.png";
import logo2 from "../assets/logo_no_ball.png";

function Header() {
  const location = useLocation();
  if(location.pathname === "/landing") return null;
  return (
    <header className="w-full bg-gray-900 text-white py-3 px-6 flex justify-between items-center">
      <nav className="flex gap-6 items-center">
        <NavLink to="/"><img src={logo2} alt="HoopPanel" style={{height: "34px"}}></img></NavLink>
        <NavLink to="/" className="hover:text-gray-400">Home</NavLink>
        <NavLink to="/news" className="hover:text-gray-400">News</NavLink>
        {/*<NavLink to="/admin" className="hover:text-gray-400">Admin</NavLink>*/}
        <NavLink to="/my-team" className="hover:text-gray-400">MyTeam</NavLink>
        <NavLink to="/leagues" className="hover:text-gray-400">Leagues</NavLink>
      </nav>

      <div className="flex items-center gap-4">
        <SearchBar />
        <NavLink to="/settings">
          <FiSettings className="text-xl cursor-pointer hover:text-gray-400" />
        </NavLink>
        <NavLink to="/profile">
          <FiUser className="text-xl cursor-pointer hover:text-gray-400" />
        </NavLink>
        <button className="cursor-pointer hover:text-gray-400" onClick={() => signOut(auth)}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
