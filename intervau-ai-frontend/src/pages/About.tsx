import { Users, Target, Award, Zap, Heart, Globe } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We believe everyone deserves access to world-class interview preparation tools.'
    },
    {
      icon: Users,
      title: 'Candidate-Centric',
      description: 'Everything we build is focused on helping candidates succeed in their interviews.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage AI and modern technology to create intelligent, adaptive interview solutions.'
    },
    {
      icon: Heart,
      title: 'Empathy',
      description: 'We understand the anxiety and pressure of interviews and design with compassion.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We\'re committed to delivering the highest quality interview experience possible.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We\'re building a tool that helps people worldwide advance their careers.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'Former HR director with 10+ years of recruiting experience',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Co-Founder & CTO',
      bio: 'AI/ML engineer from leading tech companies',
    },
    {
      name: 'Emily Thompson',
      role: 'VP of Product',
      bio: 'Product leader focused on user-centered design',
    },
    {
      name: 'David Park',
      role: 'VP of Operations',
      bio: 'Operations expert with startup scaling experience',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Intervau.AI</h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize interview preparation with AI-powered coaching and real-time feedback.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Intervau.AI was born from a simple observation: most people don't practice interviews, and those who do lack quality feedback. We saw talented candidates stumble in interviews, not because they lacked skills, but because they hadn't practiced effectively.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Our founders combined expertise in recruiting, AI, and product design to create a platform that feels like practicing with an expert HR coach. Today, we're helping thousands of candidates ace their interviews and land their dream jobs.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We're also helping HR teams find the best talent more efficiently with intelligent live interview tools and comprehensive candidate assessment.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl h-96 flex items-center justify-center text-white">
              <div className="text-center">
                <Zap className="w-24 h-24 mx-auto mb-4" />
                <p className="text-xl font-semibold">AI-Powered Interview Mastery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all">
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-lg">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl border border-blue-200 p-8">
            <p className="text-4xl font-bold text-blue-600 mb-2">50K+</p>
            <p className="text-gray-700 font-semibold">Interviews Completed</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl border border-green-200 p-8">
            <p className="text-4xl font-bold text-green-600 mb-2">92%</p>
            <p className="text-gray-700 font-semibold">Success Rate</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl border border-cyan-200 p-8">
            <p className="text-4xl font-bold text-cyan-600 mb-2">150+</p>
            <p className="text-gray-700 font-semibold">Companies Using Intervau</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            We're hiring talented people who believe in our mission. If you want to help candidates succeed, we'd love to hear from you.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Open Positions
          </button>
        </div>
      </div>
    </div>
  );
}
