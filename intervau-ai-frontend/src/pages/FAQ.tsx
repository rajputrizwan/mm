import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface FAQItem {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Simply click the "Sign Up" button on our homepage, enter your email and create a password. You can also sign up using your Google or LinkedIn account for quick registration.'
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes! All new users get access to 2 free mock interviews and basic features. No credit card required to get started.'
        },
        {
          question: 'What information do I need to provide?',
          answer: 'To create an account, you only need an email address and password. You can optionally add more details like your resume or job target, but it\'s not required to start practicing.'
        }
      ]
    },
    {
      category: 'Mock Interviews',
      questions: [
        {
          question: 'How realistic are the mock interviews?',
          answer: 'Our AI interviewer mimics real interview scenarios with authentic questions, natural conversation flow, and behavioral analysis similar to what you\'d experience in actual interviews.'
        },
        {
          question: 'Can I practice specific industries or roles?',
          answer: 'Yes! You can customize your mock interviews by selecting your target role, industry, and experience level. Our AI adjusts questions accordingly.'
        },
        {
          question: 'How long does a mock interview take?',
          answer: 'Most mock interviews take 20-45 minutes depending on the number of questions and depth you choose. You can also pause and resume at any time.'
        },
        {
          question: 'Do I need a camera and microphone?',
          answer: 'Yes, both are required for mock interviews. Our AI analyzes not just your answers but also your body language, eye contact, and speaking patterns.'
        }
      ]
    },
    {
      category: 'Live Interviews',
      questions: [
        {
          question: 'What is a live interview?',
          answer: 'Live interviews are real-time sessions between HR professionals and candidates. Intervau.AI provides intelligent tools to help HR conduct better interviews and candidates prepare.'
        },
        {
          question: 'How do I schedule a live interview?',
          answer: 'HR professionals can send interview invitations through the platform. You\'ll receive an email with a link to join at the scheduled time.'
        },
        {
          question: 'Can I practice before a live interview?',
          answer: 'Absolutely! We recommend taking 3-5 mock interviews covering similar topics before your live interview to boost confidence.'
        }
      ]
    },
    {
      category: 'Reports & Feedback',
      questions: [
        {
          question: 'What metrics does the AI analyze?',
          answer: 'Our AI evaluates confidence, clarity, communication style, technical knowledge, eye contact, speaking pace, filler words, and many other factors to give you comprehensive feedback.'
        },
        {
          question: 'Can I download my report?',
          answer: 'Yes! After each interview, you can download a detailed PDF report with all metrics, feedback, transcript, and recommendations.'
        },
        {
          question: 'How accurate is the AI feedback?',
          answer: 'Our AI is trained on thousands of interviews and continuously improves. While not perfect, the feedback is remarkably accurate and helpful for improvement.'
        }
      ]
    },
    {
      category: 'Subscription & Billing',
      questions: [
        {
          question: 'What\'s the difference between plans?',
          answer: 'Starter (Free) includes 2 mock interviews/month. Professional ($19/mo) offers unlimited interviews, advanced feedback, and priority support. Enterprise includes everything plus team features.'
        },
        {
          question: 'Can I cancel anytime?',
          answer: 'Yes! You can cancel your subscription at any time from your account settings. No penalty or long-term commitment required.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact our support team for a full refund.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          question: 'What browsers are supported?',
          answer: 'Intervau.AI works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend the latest version for best performance.'
        },
        {
          question: 'What are the internet speed requirements?',
          answer: 'We recommend at least 5 Mbps download and 2 Mbps upload for smooth video and audio. Higher speeds provide better quality.'
        },
        {
          question: 'What should I do if I experience lag or freezing?',
          answer: 'First, check your internet connection. Close unnecessary applications, use a wired connection if possible, and try a different browser. If issues persist, contact support.'
        },
        {
          question: 'Is my data secure and encrypted?',
          answer: 'Yes! All data is encrypted in transit and at rest using industry-standard encryption. We comply with GDPR, CCPA, and other privacy regulations.'
        }
      ]
    },
    {
      category: 'For Recruiters & HR',
      questions: [
        {
          question: 'How do I invite candidates to interviews?',
          answer: 'Go to your HR Dashboard, click "Send Interview Invitation," enter candidate email and interview details, and they\'ll receive an email with the join link.'
        },
        {
          question: 'Can I see candidate analytics before the interview?',
          answer: 'Yes! If the candidate completed mock interviews on our platform, their profile includes performance data and AI scores you can review.'
        },
        {
          question: 'How many team members can use the platform?',
          answer: 'Enterprise plans support unlimited team members. Professional plans include 1 seat; additional seats can be added for $99/month each.'
        },
        {
          question: 'Can we integrate with our ATS?',
          answer: 'Yes! We offer integrations with popular ATS platforms including Greenhouse, Lever, and others. Contact our sales team for details.'
        }
      ]
    }
  ];

  const filteredFAQs = faqs
    .map(category => ({
      ...category,
      questions: category.questions.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0);

  const toggleExpand = (id: string) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about Intervau.AI</p>
        </div>

        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="space-y-6">
            {filteredFAQs.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.questions.map((item, idx) => {
                    const itemId = `${category.category}-${idx}`;
                    const isExpanded = expandedIndex === itemId;

                    return (
                      <div
                        key={itemId}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <button
                          onClick={() => toggleExpand(itemId)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 text-left">{item.question}</h3>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-600 text-lg">No questions match your search.</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-12 text-white text-center mt-16">
          <h2 className="text-2xl font-bold mb-3">Didn't find what you're looking for?</h2>
          <p className="text-lg mb-6">Our support team is here to help</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
