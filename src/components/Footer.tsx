import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5db3d2] text-white py-4 px-6 text-center text-sm">
      <p>
        © {new Date().getFullYear()} All Rights Reserved. Powered by{' '}
        <a 
          href="https://karimdigital.id" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
        >
          Karimdigital.id
        </a>
      </p>
    </footer>
  );
};

export default Footer;
