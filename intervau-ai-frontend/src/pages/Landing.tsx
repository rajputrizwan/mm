import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles,
  Video,
  BarChart3,
  Code,
  Briefcase,
  DollarSign,
  Palette,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Mic,
  Eye,
  MessageSquare,
  Award,
  Clock,
  Zap,
  Shield,
  Database,
  Layers,
  User,
  Star,
  ThumbsUp,
  Building2,
  Rocket,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../router";

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const jobRoles = [
    {
      icon: Code,
      title: "Software Engineer",
      description:
        "Technical coding interviews with algorithm and system design focus",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Briefcase,
      title: "Product Manager",
      description: "Strategy, roadmap, and stakeholder management scenarios",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: DollarSign,
      title: "Sales Executive",
      description: "Client communication, negotiation, and closing techniques",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Palette,
      title: "UX Designer",
      description:
        "Design thinking, portfolio reviews, and case study discussions",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Users,
      title: "HR Manager",
      description: "Behavioral, leadership, and people management interviews",
      color: "from-blue-600 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "Data Analyst",
      description: "SQL, analytics, and business intelligence assessments",
      color: "from-teal-600 to-cyan-600",
    },
  ];

  const faqs = [
    {
      question: "How does Intervau.AI analyze my interview performance?",
      answer:
        "Our AI analyzes multiple dimensions including speech patterns, confidence levels, communication clarity, technical accuracy, body language, and eye contact. We use advanced machine learning models to provide real-time feedback and comprehensive post-interview reports.",
    },
    {
      question: "Can I practice for specific job roles?",
      answer:
        "Yes! Intervau.AI supports role-specific interview preparation for software engineering, product management, sales, design, HR, data analytics, and more. Each role has tailored questions and evaluation criteria.",
    },
    {
      question: "Is my interview data secure and private?",
      answer:
        "Absolutely. We use enterprise-grade encryption for all video and audio data. Your interviews are private by default and only accessible to you. HR teams can only access interviews you explicitly share or interviews conducted through their organization.",
    },
    {
      question: "How accurate is the AI feedback?",
      answer:
        "Our AI models are trained on thousands of real interviews and continuously improved. While no AI is perfect, our feedback correlates highly with professional interview coaches. We recommend using it as a practice tool alongside other preparation methods.",
    },
    {
      question: "Can HR teams use this for live candidate interviews?",
      answer:
        "Yes! HR teams can conduct live video interviews through our platform with real-time AI analysis. The system provides instant insights on candidate performance, helping make more informed hiring decisions.",
    },
    {
      question: "What equipment do I need?",
      answer:
        "You just need a computer or mobile device with a webcam, microphone, and stable internet connection. Our platform works in modern web browsers without requiring any downloads or installations.",
    },
    {
      question: "Can I track my improvement over time?",
      answer:
        "Yes! Your dashboard shows performance trends, skill progression, and improvement metrics across all your practice sessions. You can identify strengths and areas for growth with detailed analytics.",
    },
  ];

  const renderHomeSection = () => (
    <>
      <div id="home" className="text-center mb-32 pt-12 scroll-mt-20">
        <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Interview Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          Master Your Interviews with
          <span className="block mt-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Artificial Intelligence
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Intervau.AI transforms interview preparation and talent evaluation
          through advanced AI analysis. Get real-time feedback, detailed
          performance insights, and data-driven improvement strategies.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              10K+
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Active Users
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              50K+
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Interviews Completed
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              92%
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Success Rate
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              4.9/5
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              User Rating
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-32">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            For Candidates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Practice with AI-powered mock interviews that analyze your
            responses, body language, and communication skills in real-time.
          </p>
          <ul className="space-y-4">
            {[
              "Unlimited AI mock interviews",
              "Detailed performance reports",
              "Resume skill extraction",
              "Interview history tracking",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
              >
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                <span className="text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            For HR Teams
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Streamline your hiring process with AI-generated candidate insights,
            automated screening, and comprehensive evaluation tools.
          </p>
          <ul className="space-y-4">
            {[
              "Manage job positions",
              "AI candidate analysis",
              "Live interview tools",
              "Performance dashboards",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
              >
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                <span className="text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-white mb-32 shadow-2xl">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powered by Advanced AI
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-12 leading-relaxed">
            Our proprietary algorithms analyze speech patterns, confidence
            levels, communication clarity, and non-verbal cues to provide
            actionable insights.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-4 hover:bg-white/30 transition-colors">
                <Video className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="font-bold text-xl mb-2">Video Analysis</h4>
              <p className="text-blue-100">
                Real-time body language and facial expression insights
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-4 hover:bg-white/30 transition-colors">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="font-bold text-xl mb-2">Performance Metrics</h4>
              <p className="text-blue-100">
                Comprehensive scoring across multiple dimensions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-4 hover:bg-white/30 transition-colors">
                <TrendingUp className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="font-bold text-xl mb-2">Growth Tracking</h4>
              <p className="text-blue-100">
                Monitor improvement over time with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose Intervau.AI?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            The most comprehensive AI-powered interview preparation platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Instant Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Get immediate feedback after every session. No waiting, no delays.
              Start improving right away.
            </p>
          </div>

          <div className="text-center p-8">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              100% Private
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your practice sessions are completely confidential. Practice
              without pressure or judgment.
            </p>
          </div>

          <div className="text-center p-8">
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              See measurable improvement with detailed analytics and performance
              trends over time.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See what our users say about their experience with Intervau.AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
              "Intervau.AI helped me land my dream job! The AI feedback was
              spot-on and helped me improve my communication skills
              dramatically."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                SK
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Sarah Kim
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Software Engineer at Google
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
              "As an HR manager, this tool has revolutionized our hiring
              process. The candidate insights are incredibly detailed and
              accurate."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                MC
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Michael Chen
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  HR Director at Meta
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
              "The best investment I made in my career. Practiced for 2 weeks
              and aced my PM interview. Highly recommend!"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                EP
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Emily Parker
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Product Manager at Amazon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about Intervau.AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4 text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl shadow-xl">
        <Target className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto mb-8" />
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to Transform Your Interviews?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
          Join thousands of candidates and companies using Intervau.AI to
          achieve better interview outcomes.
        </p>
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </>
  );

  const renderHowItWorksSection = () => (
    <div id="how-it-works" className="scroll-mt-20 py-16">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          How Intervau.AI Works
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Our AI-powered platform makes interview preparation simple and
          effective in just four steps
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Sign Up & Set Your Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Create your account and select your target role. Upload your
              resume and our AI will extract key skills and experience to tailor
              your interview practice sessions.
            </p>
          </div>
          <div className="flex-shrink-0">
            <User className="w-24 h-24 text-blue-500" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Practice with AI Interviewer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start a mock interview session. Our AI interviewer asks relevant
              questions based on your role and analyzes your responses, body
              language, tone, and communication style in real-time.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Video className="w-24 h-24 text-cyan-500" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Receive Detailed Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Get comprehensive performance reports with scores across multiple
              dimensions including confidence, clarity, technical accuracy, and
              communication effectiveness. Review transcripts and specific
              improvement suggestions.
            </p>
          </div>
          <div className="flex-shrink-0">
            <BarChart3 className="w-24 h-24 text-green-500" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            4
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Track Your Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Monitor your improvement over time with detailed analytics and
              trend graphs. Identify your strengths and focus on areas that need
              work. Keep practicing until you're ready to ace the real
              interview.
            </p>
          </div>
          <div className="flex-shrink-0">
            <TrendingUp className="w-24 h-24 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="mt-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Start Practicing?</h3>
        <p className="text-blue-100 text-lg mb-8">
          Join thousands of successful candidates who improved their interview
          skills with Intervau.AI
        </p>
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Get Started Now
        </button>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div id="features" className="scroll-mt-20 py-16">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Powerful Features for Interview Success
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Everything you need to prepare, practice, and excel in your interviews
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Speech Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced voice analysis evaluates your tone, pace, clarity, and
            filler words to help you communicate more effectively.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-cyan-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Body Language Detection
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI tracks eye contact, posture, gestures, and facial expressions
            to provide insights on your non-verbal communication.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Real-Time Feedback
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get instant tips and suggestions during your interview to improve
            your responses and presentation on the spot.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Performance Scoring
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Receive detailed scores across multiple criteria including
            confidence, technical accuracy, communication, and problem-solving.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Interview History
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access all your past interviews with full transcripts, scores, and
            feedback to track your progress over time.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Instant Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get comprehensive PDF reports immediately after each interview with
            actionable insights and improvement areas.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Privacy & Security
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your interviews are encrypted and completely private. Only you can
            access your data unless you choose to share it.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-green-600 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Resume Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your resume and our AI extracts skills, experience, and
            keywords to customize your interview questions.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-orange-600 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Multi-Role Support
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Practice for multiple roles with role-specific questions, evaluation
            criteria, and industry best practices.
          </p>
        </div>
      </div>
    </div>
  );

  const renderJobRolesSection = () => (
    <div id="job-roles" className="scroll-mt-20 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Tailored for Every Role
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
          Whether you're a software engineer, product manager, or sales
          professional, our AI understands the unique requirements of your role.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Each role has customized questions, evaluation criteria, and
          industry-specific best practices to help you prepare effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobRoles.map((role) => (
          <div
            key={role.title}
            className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 group cursor-pointer"
          >
            <div
              className={`bg-gradient-to-br ${role.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md`}
            >
              <role.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {role.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Don't See Your Role?</h3>
        <p className="text-blue-100 text-lg mb-8">
          We're constantly adding new roles and interview types. Contact us to
          request a specific role or industry.
        </p>
        <button
          onClick={() => {
            const element = document.getElementById("contact");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Contact Us
        </button>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div id="contact" className="scroll-mt-20 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Get in Touch
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions or need support? We're here to help you succeed in your
          interview journey.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Email Us
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            support@intervau.ai
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            We respond within 24 hours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Call Us
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            +1 (555) 123-4567
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Mon-Fri, 9AM-6PM PST
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Visit Us
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            San Francisco, CA
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            By appointment only
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Send Us a Message
        </h3>
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Tell us more about your inquiry..."
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );

  const renderAboutUsSection = () => (
    <div id="about-us" className="scroll-mt-20 py-16">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          About Intervau.AI
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          Empowering candidates and organizations with AI-driven interview
          intelligence
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-24">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-10 border border-blue-100 dark:border-blue-800">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            To democratize interview preparation and hiring processes through
            cutting-edge artificial intelligence, making professional interview
            coaching accessible to everyone while helping organizations identify
            the best talent efficiently.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-10 border border-purple-100 dark:border-purple-800">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Vision
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            To become the global standard for AI-powered interview preparation
            and talent evaluation, creating a world where every candidate has
            equal opportunity to showcase their potential and every company
            finds their perfect match.
          </p>
        </div>
      </div>

      {/* The Problem We Solve */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            The Problem We Solve
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Interview preparation and hiring have been broken for too long
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="text-red-500 mb-4">
              <Clock className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Limited Practice
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Traditional interview prep is expensive, time-consuming, and
              offers limited practice opportunities. Most candidates go into
              interviews unprepared.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="text-orange-500 mb-4">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Subjective Feedback
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Human feedback is often inconsistent, biased, and lacks the depth
              needed for meaningful improvement in interview performance.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="text-yellow-500 mb-4">
              <Users className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Inefficient Hiring
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              HR teams spend countless hours screening candidates without
              objective data, leading to longer hiring cycles and missed
              opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Who We Help */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Who We Help
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Seekers & Candidates
              </h4>
            </div>
            <ul className="space-y-4">
              {[
                "Recent graduates entering the job market",
                "Professionals seeking career advancement",
                "Career changers transitioning to new industries",
                "International candidates preparing for interviews",
                "Anyone wanting to improve their interview skills",
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                Companies & HR Teams
              </h4>
            </div>
            <ul className="space-y-4">
              {[
                "Startups scaling their teams rapidly",
                "Enterprise companies with high-volume hiring",
                "HR professionals seeking data-driven insights",
                "Recruitment agencies managing multiple clients",
                "Organizations committed to fair hiring practices",
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Why We Exist */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-white mb-24 shadow-2xl">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Why We Exist</h3>
          <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed">
            We believe everyone deserves a fair shot at landing their dream job.
            Traditional interview preparation is inaccessible to most people due
            to cost and availability. Meanwhile, companies struggle to identify
            the best candidates objectively.
          </p>
          <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
            Intervau.AI bridges this gap by providing affordable, accessible,
            and effective AI-powered interview preparation for candidates while
            giving organizations the data-driven insights they need to make
            better hiring decisions. We're not just a tool – we're leveling the
            playing field in the job market.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Core Values
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Privacy First
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your data is yours. We protect it with enterprise-grade security.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Accessibility
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Everyone deserves access to quality interview preparation.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Continuous Innovation
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              We constantly improve our AI to provide better insights.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Fairness
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Objective, unbiased evaluation for all candidates.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Join Us on Our Mission
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Be part of the revolution in interview preparation and hiring
        </p>
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Get Started Today
        </button>
      </div>
    </div>
  );

  const renderResourcesSection = () => (
    <div id="resources" className="scroll-mt-20 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Interview Resources
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          Everything you need to ace your next interview
        </p>
      </div>

      {/* Quick Tips */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Top Interview Tips
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Mic,
              title: "Practice Out Loud",
              desc: "Rehearse your answers verbally to improve fluency and confidence",
            },
            {
              icon: Clock,
              title: "Time Your Responses",
              desc: "Keep answers between 1-2 minutes for behavioral questions",
            },
            {
              icon: Eye,
              title: "Maintain Eye Contact",
              desc: "Look at the camera to create connection in video interviews",
            },
            {
              icon: Brain,
              title: "Use STAR Method",
              desc: "Structure answers: Situation, Task, Action, Result",
            },
            {
              icon: CheckCircle,
              title: "Prepare Questions",
              desc: "Have 3-5 thoughtful questions ready for the interviewer",
            },
            {
              icon: Sparkles,
              title: "Show Enthusiasm",
              desc: "Let your passion for the role shine through naturally",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <tip.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {tip.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common Interview Questions */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Common Interview Questions
        </h3>

        <div className="space-y-6 max-w-5xl mx-auto">
          {[
            {
              category: "Behavioral",
              questions: [
                "Tell me about yourself",
                "What are your greatest strengths and weaknesses?",
                "Describe a time you faced a challenge and how you overcame it",
                "Tell me about a time you worked in a team",
              ],
            },
            {
              category: "Technical",
              questions: [
                "Walk me through your technical background",
                "How would you approach solving [specific problem]?",
                "Explain [technical concept] to a non-technical person",
                "What tools and technologies are you most comfortable with?",
              ],
            },
            {
              category: "Situational",
              questions: [
                "How do you handle tight deadlines?",
                "What would you do if you disagreed with your manager?",
                "How do you prioritize competing tasks?",
                "Describe your ideal work environment",
              ],
            },
          ].map((section) => (
            <div
              key={section.category}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-1 rounded-lg text-white mr-3">
                  {section.category}
                </span>
              </h4>
              <ul className="space-y-3">
                {section.questions.map((q, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                      {idx + 1}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 text-lg">
                      {q}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Tips */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Resume Optimization Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              Do's
            </h4>
            <ul className="space-y-3">
              {[
                "Use action verbs (Led, Developed, Achieved)",
                "Quantify your accomplishments with numbers",
                "Tailor your resume to each job posting",
                "Keep it to 1-2 pages maximum",
                "Use consistent formatting throughout",
                "Include relevant keywords from job description",
                "Highlight measurable results and impact",
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
              Don'ts
            </h4>
            <ul className="space-y-3">
              {[
                "Include generic objective statements",
                "Use personal pronouns (I, me, my)",
                "List duties instead of achievements",
                "Include irrelevant work experience",
                "Use fancy fonts or colors",
                "Have spelling or grammar errors",
                'Include references or "references available"',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">
                    ✗
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* HR Tips */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          For HR Professionals
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Structured Interviews
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Use standardized questions for all candidates to ensure fair
              comparison and reduce bias.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Data-Driven Decisions
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Leverage AI insights and objective metrics to make informed hiring
              choices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Clear Communication
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Provide timely feedback to candidates regardless of outcome to
              maintain your employer brand.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl text-white">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Practice?
        </h3>
        <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
          Use these resources and start your interview preparation with
          Intervau.AI
        </p>
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Start Practicing Now
        </button>
      </div>
    </div>
  );

  const renderTestimonialsSection = () => (
    <div id="testimonials" className="scroll-mt-20 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Success Stories
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          Real people, real results, real success with Intervau.AI
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 max-w-5xl mx-auto">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            98%
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Satisfaction Rate
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
            15K+
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Success Stories
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            4.9/5
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Average Rating
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            92%
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Interview Success
          </p>
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Featured Success Stories
        </h3>
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-10 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
              "I was struggling with technical interviews for months. After just
              two weeks with Intervau.AI, I received three offers! The AI
              feedback pinpointed exactly what I needed to work on. The detailed
              performance metrics helped me track my improvement day by day.
              Absolutely worth every penny!"
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                AJ
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  Alex Johnson
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Senior Software Engineer at Microsoft
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Salary increase: $45,000
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-10 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
              "As an HR director, I was skeptical about AI interview tools.
              Intervau.AI completely changed my mind. The candidate insights are
              incredibly accurate, and we've reduced our time-to-hire by 40%.
              Our hiring quality has improved significantly. This is now an
              essential part of our recruitment process."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                PR
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  Priya Reddy
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  HR Director at Salesforce
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  200+ successful hires
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Testimonials */}
      <div className="mb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          What Our Users Say
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "David Chen",
              role: "Product Manager at Apple",
              rating: 5,
              text: "The mock interviews felt incredibly real. I practiced for a week and aced my PM interview. The feedback was more detailed than any human coach I worked with.",
            },
            {
              name: "Maria Garcia",
              role: "UX Designer at Figma",
              rating: 5,
              text: "Finally, affordable interview prep that actually works! The AI caught things about my presentation I never noticed. Got my dream job!",
            },
            {
              name: "James Wilson",
              role: "Data Scientist at Netflix",
              rating: 5,
              text: "The technical question database is comprehensive. Practiced 50+ interviews and improved my scores by 30%. Highly recommend!",
            },
            {
              name: "Lisa Anderson",
              role: "Marketing Manager at HubSpot",
              rating: 5,
              text: "As someone with interview anxiety, this was a game-changer. Practicing in private helped me build confidence without judgment.",
            },
            {
              name: "Ahmed Hassan",
              role: "DevOps Engineer at AWS",
              rating: 5,
              text: "The real-time feedback during practice sessions is incredibly valuable. You can see exactly where you need to improve immediately.",
            },
            {
              name: "Emma Brown",
              role: "Sales Director at Oracle",
              rating: 5,
              text: "Used it to prepare my team for client presentations. The communication analysis helped everyone improve their pitch delivery.",
            },
            {
              name: "Carlos Rodriguez",
              role: "Full Stack Developer at Stripe",
              rating: 5,
              text: "Went from getting rejected constantly to receiving multiple offers. The interview history tracking showed me exactly how I was improving.",
            },
            {
              name: "Sophie Martin",
              role: "HR Manager at LinkedIn",
              rating: 5,
              text: "We use this for all our candidates now. The insights help us make better hiring decisions and reduce bias in our process.",
            },
            {
              name: "Ryan Taylor",
              role: "Business Analyst at Deloitte",
              rating: 5,
              text: "The STAR method coaching was perfect. Every practice session made me more comfortable and articulate in my responses.",
            },
          ].map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Start Your Success Story
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of successful candidates and companies using
          Intervau.AI
        </p>
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "home" && renderHomeSection()}
        {activeSection === "how-it-works" && renderHowItWorksSection()}
        {activeSection === "features" && renderFeaturesSection()}
        {activeSection === "job-roles" && renderJobRolesSection()}
        {activeSection === "about-us" && renderAboutUsSection()}
        {activeSection === "resources" && renderResourcesSection()}
        {activeSection === "testimonials" && renderTestimonialsSection()}
        {activeSection === "contact" && renderContactSection()}
      </div>
    </div>
  );
}
