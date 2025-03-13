import { FiSettings } from "react-icons/fi"; 
import { auth } from "../firebaseConfig";

function Header() {
  return (
    <header className="w-full bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <nav className="flex gap-6">
        <a href="/" className="hover:text-gray-400">LOGO</a>
        <a href="/" className="hover:text-gray-400">Home</a>
        <a href="#" className="hover:text-gray-400">Squad</a>
        <a href="#" className="hover:text-gray-400">News</a>
      </nav>

      <div className="flex items-center gap-4">
        <FiSettings className="text-xl cursor-pointer hover:text-gray-400" />
        <button className="cursor-pointer hover:text-gray-400" onClick={() => signOut(auth)}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
