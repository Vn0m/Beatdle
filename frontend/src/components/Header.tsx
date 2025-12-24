// client/src/components/Header.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import NavMenu from './NavMenu'; // Import our new menu

const Header: React.FC = () => {
  // State to control if the navigation menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center p-4 bg-gray-800">
        {/* Profile Link */}
        <Link to="/profile/1" title="View Profile">
          <FaUserCircle size={40} className="text-gray-400 hover:text-white transition-colors" />
        </Link>
        
        {/* Hamburger Button to open the menu */}
        <button onClick={() => setIsMenuOpen(true)} title="Open menu">
          <div className="text-3xl text-white">☰</div>
        </button>
      </header>

      {/* Render the NavMenu, passing it the state and the function to close it */}
      <NavMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
};

export default Header;