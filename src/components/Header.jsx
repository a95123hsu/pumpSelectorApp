import React from 'react';

const Header = ({ language, setLanguage, getText }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <a href="https://www.hungpump.com/" tabIndex={0} aria-label="Go to homepage">
                <img 
                  src={`/images/logo.gif?v=${new Date().getTime()}`}
                  alt="Hung Pump Logo" 
                  className="h-12 md:h-16 object-contain" 
                />
              </a>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-700">
              {getText("Hung Pump", language)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select Language"
            >
              <option value="English">English</option>
              <option value="繁體中文">繁體中文</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);