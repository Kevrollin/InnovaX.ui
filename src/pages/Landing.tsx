import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Rocket, Shield, TrendingUp, ArrowRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const Landing = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Decentralized Funding',
      description: 'Direct crypto payments via Stellar network. No middlemen, just innovation.',
    },
    {
      icon: Shield,
      title: 'Verified Students',
      description: 'All students undergo verification to ensure legitimacy and trust.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Real-time updates on project milestones and funding goals.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a global community of innovators and supporters.',
    },
  ];

  const stats = [
    { label: 'Active Projects', value: '250+' },
    { label: 'Total Funded', value: '$100K+' },
    { label: 'Students Supported', value: '500+' },
    { label: 'Success Rate', value: '85%' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-card py-12 sm:py-16 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="inline-block">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  🚀 Empowering Student Innovation
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
                Fund the Future of
                <span className="text-gradient-primary"> Student Innovation</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Connect student creators with supporters worldwide through secure, decentralized crowdfunding on the Stellar network.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link to="/projects">
                  <Button size="lg" className="shadow-glow w-full sm:w-auto">
                    Browse Projects
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Become a Student
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 shadow-elegant backdrop-blur-sm">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                  alt="Students collaborating"
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose <span className="text-primary">FundHub</span>?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              A secure, transparent platform built for the next generation of innovators.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full border-border bg-card hover:shadow-elegant transition-all duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
              Ready to Make an Impact?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Whether you're a student with a groundbreaking idea or a supporter looking to fund innovation, FundHub is your platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link to="/signup">
                <Button size="lg" className="shadow-glow">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Badge component inline for simplicity
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

export default Landing;
