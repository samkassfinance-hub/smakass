import React, { useRef, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";

const ProjectCard = ({ number, title, description, link, tags, aosDelay }) => {
  const ref = useRef(null);

  return (
    <div 
      ref={ref}
      data-aos="fade-up" 
      data-aos-delay={aosDelay}
      className="w-full md:w-96 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 z-10 cursor-pointer group"
    >
      <span className="text-4xl font-black text-[#ff2a2a] opacity-30 mb-2">{number}</span>
      <h3 className="text-2xl font-black mb-3 text-gray-900 group-hover:text-[#ff2a2a] transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 bg-[#ff2a2a]/10 text-[#ff2a2a] rounded-full text-xs font-bold">
            {tag}
          </span>
        ))}
      </div>

      <a 
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff2a2a] text-white font-bold rounded-full hover:bg-red-700 transition-all duration-300 group/btn"
      >
        View Live
        <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
  );
};

const Services = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });

  const projects = [
    {
      number: "01",
      title: "Animal Jump Adventure",
      description: "Browser-based endless jumping game with player-controlled animated animals, physics-based collisions, scoring system, and progressive difficulty.",
      link: "https://mohanakannan098.github.io/jumping-game-using-animals-new/",
      tags: ["HTML5", "CSS3", "JavaScript", "Game Dev"]
    },
    {
      number: "02",
      title: "Samkass Finance Manager",
      description: "Professional responsive website with clean UI/UX design, fully responsive layout across all devices, and smooth animations for financial management.",
      link: "https://samkass.site",
      tags: ["HTML5", "CSS3", "JavaScript", "Responsive"]
    },
    {
      number: "03",
      title: "AI Career Navigator",
      description: "Intelligent educational platform that generates personalized career roadmaps, identifies skill gaps, and provides step-by-step guidance powered by AI.",
      link: "https://sleai.netlify.app/login.html",
      tags: ["HTML5", "CSS3", "JavaScript", "AI"]
    }
  ];

  return (
    <section 
      id="services"
      ref={containerRef}
      className="bg-white pt-24 pb-32 px-6 md:px-12 w-full relative overflow-hidden font-sans"
    >
      <div className="max-w-7xl mx-auto">
        
        <div data-aos="fade-up" className="mb-20 text-center">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-6 shadow-sm bg-white">
            My Projects
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Building Digital Experiences
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Here are some of my recent projects showcasing my expertise in frontend development, game development, and AI integration.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch flex-wrap">
          {projects.map((project, idx) => (
            <ProjectCard
              key={idx}
              number={project.number}
              title={project.title}
              description={project.description}
              link={project.link}
              tags={project.tags}
              aosDelay={idx * 200}
            />
          ))}
        </div>

        <div 
          data-aos="fade-up" 
          data-aos-delay="600"
          className="mt-20 text-center"
        >
          <p className="text-gray-600 font-semibold mb-6">Want to see more of my work?</p>
          <a 
            href="https://github.com/mohansampath098-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-[#ff2a2a] transition-all duration-300 group"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View GitHub Profile
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Services;
