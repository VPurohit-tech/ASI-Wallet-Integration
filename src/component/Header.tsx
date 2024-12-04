import React from 'react';
import { Disclosure } from '@headlessui/react';

const Header: React.FC = () => {
  return (
    <Disclosure as="nav" className="bg-transparent border-b border-gray-300">
      <div className="mx-auto sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo and Company Name */}
          <div className="flex flex-1 items-center sm:justify-start">
            <div className="flex items-center">
              <span className="ml-3 text-dark font-bold text-xl">
                ASI Wallet Integration
              </span>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Header;
