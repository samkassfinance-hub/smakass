import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Projects = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const projects = [
    {
      id: 1,
      title: "Samkass Finance Manager",
      tagline: "Scan. Track. Manage.",
      description: "A comprehensive SaaS platform for financial tracking and client management with real-world hostel food logistics system.",
      vision: "Build smart, scalable and impactful solutions through technology.",
      mission: "Solve real-world problems with clean code and entrepreneurial mindset.",
      technologies: ["Python", "Flask", "JavaScript", "Tailwind CSS", "PostgreSQL", "Supabase"],
      features: ["User & Admin Dashboard", "Food Item Tracking", "QR/Barcode System", "Inventory Management", "JWT Auth", "Razorpay Payments", "OTP Verification"],
      role: "Founder & Full Stack Developer",
      type: "SaaS Web App & PWA",
      status: "Live",
      website: "samkass.site",
      link: "https://samkass.site"
    },
    {
      id: 2,
      title: "AI Career Navigator",
      tagline: "Your Path to Success.",
      description: "An intelligent web platform that helps students choose the right career path by generating personalized roadmaps and identifying skill gaps through AI-powered guidance.",
      technologies: ["HTML5", "CSS3", "JavaScript", "AI Integration"],
      features: ["Career Roadmaps", "Skill Gap Analysis", "Personalized Guidance", "Step-by-Step Learning", "Interactive Dashboard"],
      role: "Full Stack & AI Logic Developer",
      type: "Web Application",
      status: "Live",
      website: "sleai.netlify.app",
      link: "https://sleai.netlify.app/"
    },
    {
      id: 3,
      title: "Animal Jump Adventure",
      tagline: "Jump. Survive. Score.",
      description: "A browser-based endless jumping game with animated animals, jump physics, collision detection, and an increasing difficulty system with full scoring mechanics.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
      features: ["Endless Jumping", "Jump Physics", "Collision Detection", "Score System", "Difficulty Scaling", "Responsive Design"],
      role: "Game Developer",
      type: "Browser Game",
      status: "Live",
      website: "mohanakannan098.github.io/jumping-game-using-animals-new",
      link: "https://mohanakannan098.github.io/jumping-game-using-animals-new/"
    }
  ];

  return (
    <section 
      ref={ref}
      id="projects"
      className="bg-white pt-24 pb-32 px-6 md:px-12 w-full relative overflow-hidden font-sans"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div data-aos="fade-up" className="mb-16 md:mb-24">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-8 shadow-sm bg-white">
            My Projects
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Live Projects & Deployments
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
            3 fully deployed web applications showcasing full-stack development, SaaS architecture, and creative problem-solving.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              data-aos="fade-up"
              data-aos-delay={idx * 150}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:border-[#ff2a2a] transition-all duration-500 hover:shadow-[0_25px_50px_rgba(255,42,42,0.15)] flex flex-col h-full"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff2a2a]/5 to-[#ff2a2a]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

              <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                {/* Header */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#ff2a2a]/10 text-[#ff2a2a] text-xs font-bold rounded-full mb-3">
                    {project.type}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-[#ff2a2a] transition-colors">
                    {project.title}
                  </h3>
                  {project.tagline && (
                    <p className="text-sm font-bold text-[#ff2a2a] italic mb-2">
                      "{project.tagline}"
                    </p>
                  )}
                  <span className="text-xs font-bold text-green-600 bg-green-100/50 px-2 py-1 rounded">
                    ✓ {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Vision & Mission for Samkass */}
                {project.vision && (
                  <div className="mb-4 p-3 bg-white/50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-1">Vision:</p>
                    <p className="text-xs text-gray-600">{project.vision}</p>
                  </div>
                )}

                {/* Role */}
                <p className="text-xs font-bold text-gray-700 mb-4 text-[#ff2a2a]">
                  Role: {project.role}
                </p>

                {/* Features for Samkass */}
                {project.features && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Key Features</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {project.features.slice(0, 4).map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 group-hover:border-[#ff2a2a] group-hover:text-[#ff2a2a] transition-all"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Website link for Samkass */}
                {project.website && (
                  <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-bold text-blue-700">
                      🌐 {project.website}
                    </p>
                  </div>
                )}

                {/* Button */}
                <motion.a
                  href={project.link}
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff2a2a] text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 text-sm mt-auto"
                >
                  {project.website ? "Visit Project" : "View Project"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-24 pt-16 border-t border-gray-200 grid grid-cols-3 gap-8">
          <motion.div 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="text-center"
          >
            <p className="text-4xl md:text-5xl font-black text-[#ff2a2a] mb-2">3</p>
            <p className="text-gray-600 font-bold">Live Projects</p>
          </motion.div>
          <motion.div 
            data-aos="fade-up" 
            data-aos-delay="400"
            className="text-center"
          >
            <p className="text-4xl md:text-5xl font-black text-[#ff2a2a] mb-2">14+</p>
            <p className="text-gray-600 font-bold">Certifications</p>
          </motion.div>
          <motion.div 
            data-aos="fade-up" 
            data-aos-delay="500"
            className="text-center"
          >
            <p className="text-4xl md:text-5xl font-black text-[#ff2a2a] mb-2">8.0</p>
            <p className="text-gray-600 font-bold">CGPA</p>
          </motion.div>
        </div>

        {/* Samkass Engineer's Mindset */}
        <div className="mt-24 pt-16 border-t border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">Engineer's Mindset</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Write Clean Code",
              "Build & Ship Fast",
              "Solve Real Problems",
              "Think Like a Founder",
              "Never Stop Learning",
              "Create Lasting Impact"
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-[#ff2a2a]/5 to-transparent border border-[#ff2a2a]/20 rounded-lg text-center">
                <p className="text-sm font-bold text-[#ff2a2a]">✓ {item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
