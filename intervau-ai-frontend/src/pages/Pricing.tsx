import { Check, X, ArrowRight, Sparkles } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  cta: string;
  highlighted?: boolean;
  features: { text: string; included: boolean }[];
}

export default function Pricing() {
  const plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started with interview prep',
      cta: 'Start Free',
      features: [
        { text: '2 Mock interviews per month', included: true },
        { text: 'Basic performance metrics', included: true },
        { text: 'Interview transcripts', included: true },
        { text: 'Limited AI feedback', included: false },
        { text: 'Priority support', included: false },
        { text: 'Advanced analytics', included: false },
      ]
    },
    {
      name: 'Professional',
      price: '$19',
      description: 'For serious interview preparation',
      cta: 'Start Free Trial',
      highlighted: true,
      features: [
        { text: 'Unlimited mock interviews', included: true },
        { text: 'Advanced performance metrics', included: true },
        { text: 'AI-powered feedback', included: true },
        { text: 'Personalized recommendations', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics & reports', included: false },
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For recruiting teams and organizations',
      cta: 'Contact Sales',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Unlimited live interviews', included: true },
        { text: 'Team management & analytics', included: true },
        { text: 'Custom integrations', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'Advanced analytics & reports', included: true },
      ]
    }
  ];

  const comparisonFeatures = [
    'Mock Interviews',
    'Live Interviews',
    'Performance Metrics',
    'AI Feedback',
    'Interview History',
    'Custom Reports',
    'Team Collaboration',
    'API Access',
    'Priority Support',
    'Custom Integrations',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-2xl text-gray-600">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">Most Popular</span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Free' && plan.price !== 'Custom' && (
                  <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>/month</span>
                )}
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 flex-shrink-0 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 flex-shrink-0 text-gray-300" />
                    )}
                    <span className={feature.included ? '' : 'opacity-50'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Features</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{feature}</td>
                    <td className="py-4 px-4 text-center">
                      {idx < 4 ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {idx < 7 ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-12 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg mb-8">Still have questions? We're here to help!</p>
          <button className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            <span>View All FAQs</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Money-back Guarantee</h3>
            <p className="text-gray-600">Not satisfied? Get a full refund within 30 days, no questions asked.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Anytime</h3>
            <p className="text-gray-600">No long-term contracts. Cancel your subscription at any time.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Checkout</h3>
            <p className="text-gray-600">All payments are encrypted and processed securely.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
