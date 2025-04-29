import { FiSettings } from "react-icons/fi"; 
import { auth } from "../firebaseConfig";
import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar/SearchBar";

function Header() {
  return (
    <header className="w-full bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <nav className="flex gap-6">
        <NavLink to="/" className="hover:text-gray-400">LOGO</NavLink>
        <NavLink to="/" className="hover:text-gray-400">Home</NavLink>
        <NavLink to="/news" className="hover:text-gray-400">News</NavLink>
      </nav>

      <div className="flex items-center gap-4">
        <SearchBar />
        <NavLink to="/settings">
          <FiSettings className="text-xl cursor-pointer hover:text-gray-400" />
        </NavLink>
        <button className="cursor-pointer hover:text-gray-400" onClick={() => signOut(auth)}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
