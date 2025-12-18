import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MapPin, Users, Calendar, Wallet, Image, BarChart3, Github, Mail, Phone, Luggage, CheckCircle2, Shield, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HeroPage() {
  async function launchConsoleAction() {
    "use server";
    const { userId } = await auth();
    if (userId) {
      redirect("/console");
    } else {
      redirect("/sign-in?redirect_url=/console");
    }
  }

  // Environment variables for links
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/tatwik-sai/TripVault";
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "#";
  const mailUrl = process.env.NEXT_PUBLIC_MAIL_URL || "mailto:contact@tripvault.com";
  const phoneUrl = process.env.NEXT_PUBLIC_PHONE_URL || "tel:+1234567890";

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Luggage className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">TripVault</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Solutions
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* GitHub Icon */}
              <Link 
                href={githubUrl} 
                target="_blank"
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5 text-gray-700" />
              </Link>

              {/* Get Started Button */}
              <form action={launchConsoleAction}>
                <Button 
                  type="submit"
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md px-6"
                >
                  Get Started
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-5xl mx-auto">
          {/* App Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            TripVault
          </h1>

          {/* Quote */}
          <div className="mb-10">
            <p className="text-lg md:text-xl text-gray-600 italic font-light">
              &ldquo;The journey of a thousand miles begins with a single step.&rdquo;
            </p>
            <p className="text-xs text-gray-500 mt-2">— Lao Tzu</p>
          </div>

          {/* Tagline */}
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            Your all in one platform to plan trips, track expenses, share memories, 
            and collaborate seamlessly with your travel companions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <form action={launchConsoleAction}>
              <Button 
                type="submit"
                size="lg"
                className="px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Started
              </Button>
            </form>
            
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              asChild
            >
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                View Demo
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Seamless Travel Planning
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Everything you need to organize, manage, and enjoy your trips
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Trip Planning */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Trip Planning</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Create detailed trips with destinations, dates, itineraries, and member management all in one place.
              </p>
            </div>

            {/* Expense Tracking */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-5">
                <Wallet className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Expense Tracking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track all expenses, split bills automatically, and settle balances with smart payment settlements.
              </p>
            </div>

            {/* Photo Sharing */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-5">
                <Image className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Capture Memories</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload, share, and like photos from your adventures. Build a visual diary of your journey.
              </p>
            </div>

            {/* Collaboration */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Invite members with customizable roles and permissions for seamless group coordination.
              </p>
            </div>

            {/* Proposals & Polls */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-5">
                <BarChart3 className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Proposals & Polls</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Share ideas and create polls to democratically decide on activities and trip plans.
              </p>
            </div>

            {/* Date Planning */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-5">
                <Calendar className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Set trip dates, track duration, and coordinate timing with all your travel companions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problems We Solve Section */}
      <section id="solutions" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Problems We Solve
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Making travel planning stress-free and enjoyable
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problem 1 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Scattered Information</h3>
                <p className="text-sm text-gray-600">
                  No more juggling between multiple apps and spreadsheets. Keep all trip details centralized and organized.
                </p>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Expense Confusion</h3>
                <p className="text-sm text-gray-600">
                  End the hassle of tracking who owes what. Automatic bill splitting and smart settlement calculations.
                </p>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Time-Consuming Planning</h3>
                <p className="text-sm text-gray-600">
                  Save hours with streamlined planning tools. Collaborate in real-time and make decisions faster.
                </p>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Lost Memories</h3>
                <p className="text-sm text-gray-600">
                  Never lose precious travel photos again. Store and share all your memories in one secure place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Contact */}
      <footer id="contact" className="bg-gray-900 text-white py-16 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Luggage className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold">TripVault</span>
            </div>
            <p className="text-gray-400 text-base mb-8">Your ultimate trip planning companion</p>
            
            {/* Contact Links */}
            <div className="flex items-center justify-center gap-5 mb-10">
              <Link 
                href={githubUrl} 
                target="_blank"
                className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 border border-gray-700"
                title="GitHub"
              >
                <Github className="w-6 h-6" />
              </Link>
              <Link 
                href={mailUrl} 
                className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 border border-gray-700"
                title="Email Us"
              >
                <Mail className="w-6 h-6" />
              </Link>
              <Link 
                href={phoneUrl} 
                className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 border border-gray-700"
                title="Call Us"
              >
                <Phone className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TripVault. Built with ❤️ for travelers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
