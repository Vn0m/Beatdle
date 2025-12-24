// client/src/components/NavMenu.tsx

import React from 'react';
import { Link } from 'react-router-dom';

// Define the props our component will accept
interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void; // Function to call when we want to close the menu
}

const NavMenu: React.FC<NavMenuProps> = ({ isOpen, onClose }) => {
  // Base styles for the menu
  const menuClasses = `
    fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-xl z-50
    transform transition-transform ease-in-out duration-300
  `;

  // Apply transform based on the isOpen prop
  const transformClass = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      {/* Background overlay - click to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40" 
          onClick={onClose}
        ></div>
      )}

      {/* The Menu Itself */}
      <div className={`${menuClasses} ${transformClass}`}>
        <nav className="flex flex-col p-6 space-y-4">
          {/* Close button inside the menu */}
          <button 
            onClick={onClose} 
            className="self-end text-white text-2xl mb-4"
          >
            &times;
          </button>
          
          <Link to="/" onClick={onClose} className="text-white text-lg p-2 rounded hover:bg-gray-700">Home</Link>
          <Link to="/daily" onClick={onClose} className="text-white text-lg p-2 rounded hover:bg-gray-700">Daily Game</Link>
          <Link to="/leaderboard" onClick={onClose} className="text-white text-lg p-2 rounded hover:bg-gray-700">Leaderboard</Link>
          {/* This links to our test profile for now */}
          <Link to="/profile/1" onClick={onClose} className="text-white text-lg p-2 rounded hover:bg-gray-700">Profile</Link>
        </nav>
      </div>
    </>
  );
};

export default NavMenu;