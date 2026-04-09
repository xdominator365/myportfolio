import React from "react";

export default function App() {
  return (
    <div className="bg-gray-50 text-gray-900 font-sans scroll-smooth">

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Harshit</h1>
          <div className="space-x-6 text-sm hidden md:block">
            <a href="#about" className="hover:text-blue-600">About</a>
            <a href="#projects" className="hover:text-blue-600">Projects</a>
            <a href="#education" className="hover:text-blue-600">Education</a>
            <a href="#skills" className="hover:text-blue-600">Skills</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </nav>

      {/* About */}
      <section id="about" className="pt-28 pb-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
        <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
          Hi, I’m <span className="font-semibold">Harshit Yadav</span>, a Software Engineer with 2.5+ years of experience building scalable applications.
          I specialize in full-stack development with a focus on backend systems, clean architecture, and performance optimization.
        </p>

        <p className="mt-4 text-gray-600 max-w-2xl">
          Currently building an AI-powered investing platform with real-world trading simulations and intelligent automation.
        </p>
      </section>

      {/* Projects */}
      <section id="projects" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Projects</h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Project Card */}
            <div className="p-6 rounded-2xl shadow hover:shadow-xl transition duration-300">
              <h3 className="text-xl font-semibold">
                MyDhira – AI Trading Platform
              </h3>

              <p className="text-gray-600 mt-2">
                AI-powered paper trading platform that enables users to simulate strategies with portfolio tracking and automated decision-making.
              </p>

              <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                <li>Automated trading with RSI guardrails</li>
                <li>Portfolio tracking with P&L insights</li>
                <li>Immutable trade-based system design</li>
              </ul>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">FastAPI</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">React</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">PostgreSQL</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">Tailwind</span>
              </div>

              <a
                href="https://github.com/xdominator365/smart-investor-platform"
                target="_blank"
                className="inline-block mt-4 text-sm text-blue-600 hover:underline"
              >
                View on GitHub →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Education</h2>

        <div className="border-l-2 border-blue-500 pl-4">
          <p className="font-semibold text-lg">
            B.Tech in Computer Science
          </p>
          <p className="text-gray-600">Your College Name</p>
          <p className="text-sm text-gray-500">Year of Graduation: XXXX</p>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Skills</h2>

          <div className="grid md:grid-cols-4 gap-6 text-sm">

            <div>
              <h4 className="font-semibold mb-2">Languages</h4>
              <p>Java, Python, JavaScript</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <p>React, TypeScript, Tailwind</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Backend</h4>
              <p>FastAPI, Node.js, REST APIs</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Database & Tools</h4>
              <p>PostgreSQL, Git, Docker (basic)</p>
            </div>

          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Contact</h2>

        <div className="space-y-2 text-gray-700">
          <p>Email: your.email@example.com</p>
          <p>GitHub: github.com/xdominator365</p>
          <p>LinkedIn: linkedin.com/in/yourprofile</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Harshit Yadav
      </footer>

    </div>
  );
}
