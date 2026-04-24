import React, { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "HOME", href: "#home" },
    { name: "ABOUT ME", href: "#about" },
    { name: "WORK", href: "#work" },
    { name: "PROJECTS", href: "#projects" },
    { name: "EDUCATION", href: "#education" },
    { name: "SKILLS", href: "#skills" },
    { name: "CONTACT", href: "#contact" },
  ];

  const workExperience = [
    {
      company: "Accenture",
      position: "Software Engineer",
      duration: "Jan 2023 – Present",
      details: [
        "Engineered backend service using Python, AWS Lambda, and DynamoDB",
        "Resolved race conditions, improving system reliability and data consistency",
        "Conducted performance testing using Locust to improve scalability",
        "Built ReactJS components for better internal tooling experience",
        "Automated deployments via Terraform and CI/CD pipelines",
      ],
    },
  ];

  const projects = [
    {
      title: "MyDhira – AI-based Paper Trading Platform",
      date: "Dec 2025",
      description: "AI-powered paper trading platform enabling users to simulate trading strategies with portfolio tracking and analytics.",
      highlights: [
        "Built FastAPI REST APIs for trading and portfolio tracking",
        "Designed scalable backend architecture using immutable trade records",
        "Developed React + TypeScript dashboards for analytics",
      ],
      tech: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Python"],
      link: "https://github.com/xdominator365/smart-investor-platform",
    },
    {
      title: "Claim Getter Application (Accenture)",
      date: "Sep 2023",
      description: "Serverless microservice for efficient claim processing and prioritization.",
      highlights: [
        "Developed serverless microservice using Python and AWS Lambda",
        "Integrated DynamoDB and handled concurrency safely",
        "Improved claim processing efficiency and prioritization",
      ],
      tech: ["Python", "AWS Lambda", "DynamoDB", "AWS"],
      link: "#",
    },
  ];

  const skills = {
    Languages: ["Python", "Java", "JavaScript"],
    Frameworks: ["FastAPI", "React", "Express.js"],
    Tools: ["Git", "GitLab", "Dynatrace", "Datadog"],
    Platforms: ["AWS", "Linux"],
    Databases: ["PostgreSQL", "DynamoDB", "MongoDB"],
  };

  const certifications = [
    "AWS Certified Developer - Associate (2026 – 2029)",
    "Accenture Primer Assessment – INR 10,000 Award",
    "DSA Workshop (GeeksforGeeks)",
    "HackerRank 5-Star",
    "Kaggle Contributor",
    "Google Kickstart Participant",
  ];

  return (
    <div className="bg-white text-gray-900 font-sans scroll-smooth">

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <a href="#home" className="text-2xl font-bold text-blue-600">HY</a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="hover:text-blue-600 transition duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="flex flex-col space-y-4 px-6 py-4 text-sm font-medium">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-blue-600 transition"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            HELLO!<br />I AM<br />
            <span className="text-blue-600">HARSHIT</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Software Engineer | Backend Specialist | Python & AWS Expert
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="#about" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Learn More
            </a>
            <a href="#contact" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* About Me */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold mb-12">ABOUT ME</h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
              <p>
                I'm <span className="font-semibold text-gray-900">Harshit Yadav</span>, a Software Engineer with <span className="font-semibold">3+ years of experience</span> building scalable backend systems using <span className="font-semibold">Python and AWS</span>.
              </p>
              
              <p>
                My expertise spans <span className="font-semibold">concurrency handling, API design, and performance optimization</span>. I have a solid foundation in Data Structures & Algorithms, system design basics, and cloud development.
              </p>
              
              <p>
                Currently at <span className="font-semibold">Accenture</span> as a Software Engineer, where I build backend services, resolve complex race conditions, optimize system performance, and automate deployments.
              </p>

              <p>
                I'm passionate about solving complex problems through elegant, maintainable code. Beyond work, I actively contribute to open-source, participate in competitive programming, and continuously explore emerging technologies.
              </p>

              <div className="flex gap-6 pt-4">
                <a href="https://github.com/xdominator365" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                  GitHub →
                </a>
                <a href="https://linkedin.com/in/harshit-yadav" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                  LinkedIn →
                </a>
                <a href="https://leetcode.com/xdominator365" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                  LeetCode →
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-8 h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-8xl mb-4">👨‍💻</p>
              <p className="text-gray-600 text-lg font-medium">Software Engineer</p>
              <p className="text-gray-500 text-sm mt-2">Accenture | Python | AWS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section id="work" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-12">WORK</h2>
          
          <div className="space-y-12">
            {workExperience.map((job, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{job.position}</h3>
                    <p className="text-lg text-blue-600 font-medium">{job.company}</p>
                  </div>
                  <p className="text-gray-600 font-medium">{job.duration}</p>
                </div>
                
                <ul className="space-y-3">
                  {job.details.map((detail, i) => (
                    <li key={i} className="flex gap-4 text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Download Resume Button */}
          <div className="mt-12 text-center">
            <a 
              href="https://drive.google.com/file/d/1UEcYeihSsyZGsXPOiSD4CoujSeaCtgg7/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              📥 Download Resume
            </a>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold mb-12">PROJECTS</h2>
        
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                </div>
                <p className="text-gray-500 font-medium whitespace-nowrap">{project.date}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {project.highlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-blue-600">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              {project.link !== "#" && (
                <a 
                  href={project.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View on GitHub →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-12">SKILLS</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(skills).map(([category, skillsList]) => (
              <div key={category} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">CERTIFICATIONS</h3>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <ul className="space-y-3">
                {certifications.map((cert, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold mb-12">EDUCATION</h2>
        
        <div className="bg-white border-2 border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900">B.Tech in Information Technology</h3>
          <p className="text-lg text-blue-600 font-medium mt-2">Jaypee University of Information Technology</p>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4">
            <p className="text-gray-600">CGPA: <span className="font-bold text-gray-900">8.30</span></p>
            <p className="text-gray-500">2018 – 2022</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">CONTACT</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Let's create something amazing together. Feel free to reach out!
          </p>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <a href="mailto:yharshit178@gmail.com" className="flex items-center gap-3 text-lg text-blue-600 hover:text-blue-700 font-medium">
              📧 yharshit178@gmail.com
            </a>
            <a href="tel:+918318749400" className="flex items-center gap-3 text-lg text-blue-600 hover:text-blue-700 font-medium">
              📱 +91-8318749400
            </a>
          </div>

          <div className="flex gap-6 justify-center mt-8">
            <a href="https://github.com/xdominator365" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
              GitHub
            </a>
            <a href="https://linkedin.com/in/yd09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
              LinkedIn
            </a>
            <a href="https://leetcode.com/maverick_69" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
              LeetCode
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Harshit Yadav. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Crafted with ❤️ using React, Vite & Tailwind CSS
        </p>
      </footer>

    </div>
  );
}
