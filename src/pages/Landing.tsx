import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  LayoutDashboard, 
  Bot, 
  Users, 
  BarChart3, 
  Shield, 
  Upload, 
  Cpu, 
  CheckCircle,
  ArrowRight,
  Check,
  Menu,
  X,
  Star,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation hook for scroll reveal
function useScrollReveal() {
  const [visible, setVisible] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (id: string) => visible.has(id);
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <div 
      className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-700" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ name, price, description, features, popular, buttonText }: { 
  name: string, 
  price: string, 
  description: string, 
  features: string[], 
  popular?: boolean,
  buttonText: string 
}) {
  return (
    <div className={`rounded-2xl p-8 ${popular ? 'bg-blue-900 text-white ring-4 ring-blue-200' : 'bg-white border border-slate-200'} relative`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className={`text-lg font-semibold mb-2 ${popular ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        {price !== 'Custom' && <span className={`text-sm ${popular ? 'text-blue-200' : 'text-slate-500'}`}>/month</span>}
      </div>
      <p className={`text-sm mb-6 ${popular ? 'text-blue-200' : 'text-slate-600'}`}>{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 ${popular ? 'text-blue-300' : 'text-blue-600'}`} />
            <span className={popular ? 'text-blue-100' : 'text-slate-700'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`w-full ${popular ? 'bg-white text-blue-900 hover:bg-blue-50' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
        asChild
      >
        <Link to="/signup">{buttonText}</Link>
      </Button>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ quote, author, role, company }: { quote: string, author: string, role: string, company: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <Quote className="w-8 h-8 text-blue-200 mb-4" />
      <p className="text-slate-700 mb-4 leading-relaxed">{quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{author.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">{author}</p>
          <p className="text-sm text-slate-500">{role} at {company}</p>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useScrollReveal(); // Initialize scroll reveal animations

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5">
                  <path d="M8 8 L20 4 L32 8 L32 24 L20 28 L8 24 Z" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M8 8 L20 12 L20 28" fill="none" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-blue-950">Fintegral</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-blue-800 hover:bg-blue-900" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-slate-600">Features</a>
              <a href="#pricing" className="block text-sm font-medium text-slate-600">Pricing</a>
              <a href="#about" className="block text-sm font-medium text-slate-600">About</a>
              <hr className="border-slate-200" />
              <Link to="/login" className="block text-sm font-medium text-slate-600">Log in</Link>
              <Link to="/signup" className="block text-sm font-medium text-blue-800">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">Now with AI-powered processing</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                AI-Powered <span className="text-blue-800">Loan Processing</span> Platform
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Streamline your mortgage pipeline with intelligent automation. From document parsing to closing, Fintegral helps lenders process loans 3x faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-800 hover:bg-blue-900 text-white px-8" asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">Watch Demo</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full border-2 border-white" />
                  ))}
                </div>
                <p>Trusted by 500+ lenders</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl transform rotate-3" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  </div>
                  <span className="text-sm text-slate-500 ml-2">Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  {/* Mock dashboard content */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Total Loans</p>
                      <p className="text-2xl font-bold text-blue-900">24</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Approved</p>
                      <p className="text-2xl font-bold text-emerald-700">18</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Pending</p>
                      <p className="text-2xl font-bold text-amber-700">6</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full" />
                        <div className="flex-1">
                          <div className="h-2 bg-slate-200 rounded w-24" />
                          <div className="h-2 bg-slate-200 rounded w-16 mt-1" />
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">In Review</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">Trusted by leading mortgage lenders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['Acme Lending', 'Summit Mortgages', 'Prime Loans', 'HomeFirst', 'Metro Credit'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <div className="w-6 h-6 bg-slate-300 rounded" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to close loans faster</h2>
            <p className="text-lg text-slate-600">Powerful features designed specifically for mortgage professionals</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={FileText}
              title="AI Document Parsing"
              description="Automatically extract data from W-2s, pay stubs, bank statements, and more with 99% accuracy."
              delay={0}
            />
            <FeatureCard 
              icon={LayoutDashboard}
              title="Smart Pipeline"
              description="Visual pipeline management with automated status updates and SLA tracking."
              delay={100}
            />
            <FeatureCard 
              icon={Bot}
              title="Automated Tasks"
              description="AI agents handle routine verification tasks, freeing up your team for complex cases."
              delay={200}
            />
            <FeatureCard 
              icon={Users}
              title="Team Collaboration"
              description="Role-based access, real-time notifications, and seamless handoffs between departments."
              delay={300}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Analytics & Reporting"
              description="Deep insights into pipeline performance, team productivity, and loan metrics."
              delay={400}
            />
            <FeatureCard 
              icon={Shield}
              title="Compliance & Security"
              description="SOC 2 compliant with audit trails, encrypted data, and regulatory reporting."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-600">Get started in minutes, not months</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Upload, step: '01', title: 'Upload Documents', desc: 'Borrowers upload docs via secure portal or email. AI automatically categorizes and extracts data.' },
              { icon: Cpu, step: '02', title: 'AI Processing', desc: 'Our AI verifies income, assets, and employment. Flags issues and generates conditions automatically.' },
              { icon: CheckCircle, step: '03', title: 'Close Faster', desc: 'Track progress in real-time. Automated workflows keep everyone on the same page. Close 30% faster.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-5xl font-bold text-slate-200 absolute -top-4 left-1/2 -translate-x-1/2 -z-10">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Loved by mortgage professionals</h2>
            <div className="flex items-center justify-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 text-slate-600">4.9/5 from 200+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="Fintegral cut our processing time in half. The AI document parsing alone saves us 5 hours per loan."
              author="Michael Torres"
              role="VP Operations"
              company="Summit Mortgage"
            />
            <TestimonialCard 
              quote="The automated task management is a game-changer. Our loan officers can focus on clients instead of paperwork."
              author="Jennifer Walsh"
              role="Branch Manager"
              company="HomeFirst Lending"
            />
            <TestimonialCard 
              quote="Best ROI of any tool we've implemented. Paid for itself in the first month with increased loan volume."
              author="David Chen"
              role="CTO"
              company="Prime Loans Inc"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Start free, scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Starter"
              price="$49"
              description="Perfect for small teams getting started"
              features={
                ['Up to 5 users', '50 loans/month', 'AI document parsing', 'Basic analytics', 'Email support']
              }
              buttonText="Start Free Trial"
            />
            <PricingCard 
              name="Professional"
              price="$149"
              description="For growing lenders who need more power"
              features={
                ['Up to 20 users', 'Unlimited loans', 'Advanced AI features', 'Team collaboration', 'Priority support', 'Custom integrations']
              }
              popular
              buttonText="Start Free Trial"
            />
            <PricingCard 
              name="Enterprise"
              price="Custom"
              description="For large organizations with custom needs"
              features={
                ['Unlimited users', 'Unlimited loans', 'Custom AI training', 'Dedicated success manager', 'SLA guarantee', 'On-premise option']
              }
              buttonText="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your lending?
          </h2>
          <p className="text-lg text-blue-200 mb-8">
            Join 500+ lenders already closing loans faster with Fintegral
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-800" asChild>
              <Link to="/demo">Schedule Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-blue-300 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-5 h-5">
                    <path d="M8 8 L20 4 L32 8 L32 24 L20 28 L8 24 Z" fill="none" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="font-bold text-xl text-white">Fintegral</span>
              </div>
              <p className="text-sm">AI-powered loan processing for modern lenders.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 Fintegral. All rights reserved.</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                <a key={social} href="#" className="text-sm hover:text-white">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
