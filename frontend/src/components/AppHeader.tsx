import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import NavMenu from './NavMenu';
import { HelpCircle, Headphones, Clock, Search, Share2, Menu } from 'lucide-react';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <>
      <header className="w-full flex justify-center items-center bg-white border-b border-gray-200 font-sans">
        <nav className="w-full max-w-3xl grid grid-cols-3 items-center px-4 py-4">
          <div className="flex items-center">
            <button
              title="How to Play"
              className="flex items-center group cursor-pointer"
              onClick={() => setShowHowTo(true)}>
              <HelpCircle className="h-6 w-6 text-dark group-hover:text-primary-500 transition-colors" />
            </button>
          </div>

          <Link to="/" className="flex items-center justify-center group">
            <h1 className="text-3xl font-bold text-dark tracking-tight" style={{fontFamily: 'Georgia, Times, serif'}}>
              Beatdle
            </h1>
          </Link>

          <div className="flex items-center justify-end">
            <button
              title="Menu"
              className="flex items-center group cursor-pointer"
              onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6 text-dark group-hover:text-primary-500 transition-colors" />
            </button>
          </div>

          <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
            <DialogContent className="max-w-[85vw] sm:max-w-lg bg-white border-2 border-gray-300 text-dark font-sans shadow-lg rounded p-6 sm:p-8">
              <DialogTitle className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">How to Play</DialogTitle>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
                  <p className="text-sm sm:text-base">Listen to the audio snippet</p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
                  <p className="text-sm sm:text-base">You get 5 tries, each unlocks more audio</p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-center">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
                  <p className="text-sm sm:text-base">Type your guess and select from suggestions</p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-center">
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
                  <p className="text-sm sm:text-base">Share your results. New song daily!</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </nav>
      </header>

      <NavMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}/>
    </>
  );
};

export default AppHeader;
