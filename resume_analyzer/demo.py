"""
demo.py
-------
Self-contained demonstration with two sample resumes and two job descriptions.
Run:  python demo.py
No external packages required beyond the base install.
"""

import json, sys, pathlib, textwrap

# Add parent directory to path so resume_analyzer/ modules are importable
sys.path.insert(0, str(pathlib.Path(__file__).parent))

from main import analyze

# ─────────────────────────────────────────────────────────────────────────────
# SAMPLE DATA
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_RESUME_FULLSTACK = """\
JOHN DOE
Full Stack Software Engineer
Email: john.doe@email.com | GitHub: github.com/johndoe

TECHNICAL SKILLS
Programming Languages: JavaScript (5 years), TypeScript (3 years), Python (4 years), Java (2 years), SQL
Frontend: Expert in React and Redux. Proficient in Vue.js, Next.js. HTML5, CSS3, SASS, Tailwind CSS.
Backend: Senior Node.js developer with Express. NestJS, Django. RESTful API, GraphQL, Microservices.
Database: MongoDB, PostgreSQL, MySQL, Redis. Database design and query optimisation. NoSQL and SQL.
Cloud & DevOps: Expert in AWS (EC2, S3, Lambda). Docker, Kubernetes. CI/CD with GitHub Actions and Jenkins.
              Terraform for infrastructure as code. Azure and Google Cloud Platform experience.
Testing: TDD, Jest, Mocha, integration testing, E2E.
Tools: Git, GitHub, GitLab, Jira, Confluence, VS Code, IntelliJ, Postman, Figma.

PROFESSIONAL EXPERIENCE

Senior Full Stack Developer | Tech Solutions Inc. | 2021 – Present
• Led development of SaaS platform (100,000+ users) using React, TypeScript, Node.js.
• Microservices with Docker and Kubernetes — improved scalability 300%.
• Redis caching reduced API response time 60%.
• CI/CD pipeline with GitHub Actions: deployment time cut from 2 hours to 15 minutes.
• Expert in AWS cloud architecture.

Full Stack Developer | StartupHub | 2019 – 2021
• React, Redux, Node.js responsive web applications.
• RESTful APIs and GraphQL for mobile/web clients.
• MongoDB and PostgreSQL data persistence.
• WebSocket real-time features. Scrum methodology.

PROJECTS
E-Commerce Platform
Built full-stack e-commerce app using React, Node.js, Express, MongoDB.
Stripe integration, deployed to AWS EC2 + S3 + CloudFront.

Real-Time Chat Application
WebSocket messaging platform; JWT authentication. React, Node.js, Socket.io, PostgreSQL, Docker.

EDUCATION
Bachelor of Science in Computer Science | UC Berkeley | 2017 | GPA 3.8

CERTIFICATIONS
AWS Certified Solutions Architect (2022)
MongoDB Certified Developer (2021)
Google Cloud Professional Cloud Architect (2020)
"""

SAMPLE_RESUME_EE = """\
AHMED KHAN
Electrical Engineer
Email: ahmed.khan@email.com | Phone: +92-300-1234567

SUMMARY
Dedicated Electrical Engineer with 4 years of experience in embedded systems,
power electronics, and control systems. Proficient in MATLAB, Simulink, C, and C++.
Strong background in PCB design, FPGA programming, and PLC-based automation.

TECHNICAL SKILLS
Programming: C, C++, MATLAB, Python
EDA Tools: Altium Designer, Proteus, KiCad, LTspice
Embedded: Arduino, Raspberry Pi, STM32, AVR microcontrollers, UART, SPI, I2C
Simulation: MATLAB Simulink, ANSYS
Hardware: PCB Design, circuit design, analog electronics, digital electronics
Communication: UART, SPI, I2C, wireless networks
Control: PID Controller, control systems, motor control
Industrial: PLC, SCADA, power systems, power electronics

PROFESSIONAL EXPERIENCE

Embedded Systems Engineer | ProTech Pvt. Ltd. | 2020 – 2024
• Designed PCB layouts using Altium Designer for industrial control applications.
• Programmed STM32 microcontrollers in C/C++ for PID-based motor control.
• Developed MATLAB Simulink models for power system simulations.
• Integrated sensors via I2C and SPI protocols with Raspberry Pi and Arduino.
• Implemented SCADA systems for factory automation using PLC programming.

Junior Electrical Engineer | Power Grid Ltd. | 2019 – 2020
• Assisted in power systems analysis and transformer maintenance.
• Used LTspice for analog circuit simulation and validation.
• Worked with FPGA boards for digital signal processing tasks (VHDL).

PROJECTS
Smart Home Automation
  Arduino + Raspberry Pi IoT system with wireless sensor integration.
  MQTT protocol for communication. Python backend for data logging.

Motor Speed Controller
  PID controller design and implementation on STM32.
  MATLAB Simulink simulation and hardware validation.

EDUCATION
Bachelor of Science in Electrical Engineering | NUST | 2019

CERTIFICATIONS
Certified LabVIEW Associate Developer (2021)
PLC Programming Certification – Siemens (2022)
"""

JD_FULLSTACK = """\
We are looking for a Senior Full Stack Developer.

Requirements:
- 5+ years experience with JavaScript and TypeScript
- Strong proficiency in React and Node.js
- Experience with RESTful API design and GraphQL
- MongoDB, PostgreSQL database experience
- Docker and Kubernetes for containerisation
- AWS cloud services (EC2, S3, Lambda)
- CI/CD pipeline experience (GitHub Actions or Jenkins)
- Agile / Scrum methodology

Preferred:
- Experience with Next.js or NestJS
- Kafka or RabbitMQ message queuing
- Terraform infrastructure as code
- Redis caching experience
"""

JD_EE = """\
Hiring: Embedded Systems Engineer

Requirements:
- Proficiency in C and C++ programming for microcontrollers
- Experience with MATLAB and Simulink for system modelling
- FPGA development using VHDL or Verilog
- PCB design using Altium Designer or KiCad
- Embedded systems: Arduino, Raspberry Pi, STM32
- PLC and SCADA system experience
- Knowledge of communication protocols: UART, SPI, I2C
- Signal processing and control systems design

Preferred:
- IoT technologies and wireless sensor networks
- Python scripting for automation
- LabVIEW for instrumentation
"""


# ─────────────────────────────────────────────────────────────────────────────
# RUN DEMO
# ─────────────────────────────────────────────────────────────────────────────

def print_result(label: str, result: dict) -> None:
    print("\n" + "═" * 70)
    print(f"  {label}")
    print("═" * 70)
    print(f"  Match Score : {result['match_score']} / 100")
    print(f"  Breakdown   :")
    b = result["breakdown"]
    print(f"    Skills Match     : {b['skills_match']:.1f}%")
    print(f"    Experience Match : {b['experience_match']:.1f}%")
    print(f"    Keyword Match    : {b['keyword_match']:.1f}%")

    print(f"\n  Extracted Skills ({len(result['extracted_skills'])}):")
    for s in result["extracted_skills"][:15]:
        bar = "█" * (s["level"] // 10) + "░" * (10 - s["level"] // 10)
        print(f"    {s['name']:<26} [{bar}] {s['level']:>2}%  {s['category']}")

    if result["matched_skills"]:
        matched = ", ".join(result["matched_skills"][:8])
        print(f"\n  ✅ Matched JD Skills: {matched}")

    if result["missing_skills"]:
        missing = ", ".join(result["missing_skills"][:6])
        print(f"  ⚠️  Missing Skills   : {missing}")

    if result["skill_gaps"]:
        print(f"\n  🔴 Skill Gaps:")
        for gap in result["skill_gaps"][:4]:
            rec = textwrap.shorten(gap["recommendation"], 80, placeholder="...")
            print(f"    [{gap['priority']:8s}] {gap['skill']}")
            print(f"              → {rec}")

    if result["partial_matches"]:
        print(f"\n  ≈  Partial Matches  :")
        for pm in result["partial_matches"][:2]:
            resume_part = ", ".join(str(x) for x in pm["resume_skills"][:3])
            print(f"    {pm['group']}: resume has [{resume_part}]")

    rs = result["resume_sections"]
    print(f"\n  Resume Sections Detected:")
    print(f"    Experience: {rs['experience_count']} | Projects: {rs['project_count']} "
          f"| Certs: {rs['certification_count']} | Education: {rs['education_count']}")


if __name__ == "__main__":
    tests = [
        ("Full-Stack Resume × Full-Stack JD",
         SAMPLE_RESUME_FULLSTACK, "Senior Full Stack Developer", JD_FULLSTACK),

        ("Electrical Engineer Resume × EE JD",
         SAMPLE_RESUME_EE, "Embedded Systems Engineer", JD_EE),

        ("Full-Stack Resume × EE JD  (Expected LOW score)",
         SAMPLE_RESUME_FULLSTACK, "Embedded Systems Engineer", JD_EE),

        ("Full-Stack Resume (No JD — General Score)",
         SAMPLE_RESUME_FULLSTACK, "", ""),
    ]

    all_results = {}
    for label, resume, title, jd in tests:
        res = analyze(resume, job_title=title, job_description=jd)
        print_result(label, res)
        all_results[label] = res

    # Save JSON
    with open("demo_results.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)

    print("\n\n  Full JSON saved to demo_results.json\n")
