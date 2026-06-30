import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-[#d4d4d4] py-16 px-6 md:px-12 w-full font-mono text-[10px] md:text-xs tracking-widest flex flex-col justify-between min-h-[50vh]">
      
      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full font-medium">
        <div className="flex flex-col gap-1">
          <p>Full Stack Development</p>
          <p>Game Development</p>
          <p>AI Integration</p>
        </div>
        
        <div className="flex flex-col gap-1 md:items-center">
          <p>B.E. Electrical & Electronics Engineering</p>
          <a href="#work" className="underline hover:text-white transition-colors mt-1 underline-offset-4 decoration-1">View Projects</a>
        </div>
        
        <div className="flex flex-col gap-1 md:items-end">
          <p>Coimbatore, India</p>
          <p>Available Now</p>
        </div>
      </div>

      {/* Middle Huge Text */}
      <div className="w-full flex justify-center items-center py-20 md:py-24 overflow-hidden">
        <h2 className="text-[18vw] md:text-[16vw] leading-none font-sans font-bold tracking-tighter lowercase select-none text-[#f4f4f4] w-full text-center">
          MOHANAKANNAN S
        </h2>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full items-end font-medium">
        <div className="flex flex-col gap-6">
          <a href="#contact" className="underline hover:text-white transition-colors underline-offset-4 decoration-1 font-bold">Contact</a>
          <p className="text-white/60 font-mono text-[9px] md:text-[10px]">
            &copy; {new Date().getFullYear()} MOHANAKANNAN S | Built with React
          </p>
        </div>
        
        <div className="flex flex-col gap-1 md:items-center">
          <a href="mailto:mohansampath098@gmail.com" className="underline hover:text-white transition-colors underline-offset-4 decoration-1 lowercase">mohansampath098@gmail.com</a>
          <a href="tel:+917904987242" className="underline hover:text-white transition-colors underline-offset-4 decoration-1">+91 7904987242</a>
        </div>
        
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex gap-3">
            <a href="https://github.com/mohansampath098-ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors underline-offset-4 decoration-1">GitHub</a>
            <a href="https://linkedin.com/in/mohanakannan098" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors underline-offset-4 decoration-1">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
