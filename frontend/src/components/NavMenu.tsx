import React from 'react';
import { Link } from 'react-router-dom';
import { X, Music, Award, User, Users, Plus } from 'lucide-react';

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ isOpen, onClose }) => {
  const menuClasses = `
    fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 border-l border-gray-200
    transform transition-transform ease-in-out duration-300
  `;

  const transformClass = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-30 z-40" onClick={onClose}></div>
      )} 
      <div className={`${menuClasses} ${transformClass}`}>
        <nav className="flex flex-col p-6 font-sans">
          <button 
            onClick={onClose} 
            className="self-end text-dark mb-6 hover:text-primary-500 transition-colors"
            aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
          
          <div className="space-y-2">
            <Link 
              to="/daily" 
              onClick={onClose} 
              className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Music className="h-5 w-5" />
              Daily Challenge
            </Link>
            
            <Link 
              to="/create-lobby" 
              onClick={onClose} 
              className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Plus className="h-5 w-5" />
              Create Lobby
            </Link>
            
            <Link 
              to="/join-lobby" 
              onClick={onClose} 
              className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5" />
              Join Lobby
            </Link>
            
            <div className="border-t border-gray-200 my-4"></div>
            
            <Link 
              to="/leaderboard" 
              onClick={onClose} 
              className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Award className="h-5 w-5" />
              Leaderboard
            </Link>
            
            <Link 
              to="/profile/1" 
              onClick={onClose} 
              className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5" />
              Profile
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavMenu;