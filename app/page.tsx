"use client"
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import BranchesSection from '@/components/branch';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import Contact from '@/components/contact';
import About from '@/components/About';
import Partners from '@/components/Partners';
import TeamSection from '@/components/teams';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isCarouselPaused] = useState(false);
  const teamCarouselRef = useRef<HTMLDivElement>(null);
  
  // Announcement system state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementPassword, setAnnouncementPassword] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<{text: string, expiresAt: Date} | null>(null);
  const [showAdminControls, setShowAdminControls] = useState(false);

  const router = useRouter();

  // Load announcement from localStorage on component mount
  useEffect(() => {
    const savedAnnouncement = localStorage.getItem('currentAnnouncement');
    if (savedAnnouncement) {
      const parsed = JSON.parse(savedAnnouncement);
      // Check if announcement is expired
      if (new Date(parsed.expiresAt) > new Date()) {
        setCurrentAnnouncement({
          text: parsed.text,
          expiresAt: new Date(parsed.expiresAt)
        });
      } else {
        localStorage.removeItem('currentAnnouncement');
      }
    }
  }, []);

  // Check for expired announcement every hour
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentAnnouncement && new Date(currentAnnouncement.expiresAt) < new Date()) {
        setCurrentAnnouncement(null);
        localStorage.removeItem('currentAnnouncement');
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [currentAnnouncement]);

  // Handle scroll for navbar effects and section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Section detection with IntersectionObserver
      const sections = ['home', 'about', 'branches', 'team', 'contact'];
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.observe(element);
      });

      return () => {
        sections.forEach(section => {
          const element = document.getElementById(section);
          if (element) observer.unobserve(element);
        });
      };
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Improved Team Carousel Effect
  useEffect(() => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return;

    let animationId: number;
    let scrollAmount = 0;
    const speed = 1;
    const cardWidth = 256; // w-64 = 256px
    const gap = 24; // space-x-6 = 24px
    const cardsToShow = 4;

    // Calculate total width of cards to show
    const visibleWidth = (cardWidth * cardsToShow) + (gap * (cardsToShow - 1));

    const scrollCarousel = () => {
      if (isCarouselPaused) {
        animationId = requestAnimationFrame(scrollCarousel);
        return;
      }

      scrollAmount += speed;
      carousel.scrollLeft = scrollAmount;

      // Reset scroll position when reaching the end
      if (scrollAmount >= carousel.scrollWidth / 2) {
        scrollAmount = 0;
        carousel.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(scrollCarousel);
    };

    // Set initial width to show exactly 4 cards
    carousel.style.width = `${visibleWidth}px`;
    carousel.style.margin = '0 auto';

    animationId = requestAnimationFrame(scrollCarousel);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isCarouselPaused]);

  // Handle employee login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Change these passwords as needed in the future
    const employeePassword = 'admin123';
    // BE Password
    const bePassword = 'admin123';
    // DSE Password
    const dsePassword = 'admin123';
    // Leaderboard Password
    const leaderboardPassword = 'admin123';
    // Leave Password
    const leavePassword = 'admin123';

    if (!selectedRole) {
      setLoginError('Please select a role first');
      return;
    }

    let correctPassword = '';
    let redirectPath = '';

    switch (selectedRole) {
      case 'employee':
        correctPassword = employeePassword;
        redirectPath = '/employe';
        break;
      case 'be':
        correctPassword = bePassword;
        redirectPath = '/be';
        break;
      case 'dse':
        correctPassword = dsePassword;
        redirectPath = '/dse';
        break;
      case 'leaderboard':
        correctPassword = leaderboardPassword;
        redirectPath = '/leaderboard';
        break;
      case 'leave':
        correctPassword = leavePassword;
        redirectPath = '/leave';
        break;
      default:
        correctPassword = 'admin123';
        redirectPath = '/employe';
    }

    if (password === correctPassword) {
      router.push(redirectPath);
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  // Handle Samwadh PDF download
  const handleSamwadhDownload = () => {
    // Replace this URL with your actual PDF URL
    const pdfUrl = '/samwad.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Samwadh-Magazine.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle announcement password submission
  const handleAnnouncementPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementPassword === 'admin123') {
      setShowAdminControls(true);
      setAnnouncementError('');
      setAnnouncementPassword(''); // Clear password field
    } else {
      setAnnouncementError('Incorrect password');
    }
  };

  // Handle announcement submission
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      setAnnouncementError('Please enter announcement text');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // 2 days from now

    const newAnnouncement = {
      text: announcementText,
      expiresAt: expiresAt.toISOString()
    };

    setCurrentAnnouncement({
      text: announcementText,
      expiresAt: expiresAt
    });
    localStorage.setItem('currentAnnouncement', JSON.stringify(newAnnouncement));
    setAnnouncementText('');
    setShowAdminControls(false);
    setShowAnnouncementModal(false);
  };

  // Handle announcement deletion
  const handleDeleteAnnouncement = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('currentAnnouncement');
    setShowAdminControls(false);
    setShowAnnouncementModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>SDPL - Premium Logistics & Distribution</title>
        <meta name="description" content="SDPL provides world-class logistics and distribution services across India" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Floating Samwadh Download Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={handleSamwadhDownload}
          className="relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          <span className="relative z-10 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Samwadh
          </span>
          <span className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      </div>

      {/* Announcement Carousel */}
      {currentAnnouncement && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-2 z-50 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
          </div>
        </div>
      )}

      {/* Admin Icon */}
      <div className="fixed bottom-8 left-8 z-40">
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors shadow-lg"
          title="Admin Panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Announcement Password Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Admin Access</h3>
              <button 
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementPassword('');
                  setAnnouncementError('');
                  setShowAdminControls(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showAdminControls ? (
              <form onSubmit={handleAnnouncementPasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="announcementPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Admin Password
                  </label>
                  <input
                    type="password"
                    id="announcementPassword"
                    value={announcementPassword}
                    onChange={(e) => setAnnouncementPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    required
                  />
                  {announcementError && <p className="mt-1 text-sm text-red-600">{announcementError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </form>
            ) : (
              <div>
                <h4 className="text-lg font-medium mb-4">Announcement Management</h4>
                {currentAnnouncement ? (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 mb-2">Current Announcement:</p>
                    <p className="font-medium">{currentAnnouncement.text}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Expires: {new Date(currentAnnouncement.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="mb-4 text-gray-500">No active announcement</p>
                )}

                <form onSubmit={handleAnnouncementSubmit} className="mb-4">
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new announcement text"
                    rows={3}
                    required
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {currentAnnouncement ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>

                {currentAnnouncement && (
                  <button
                    onClick={handleDeleteAnnouncement}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Announcement
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-80 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Employee Portal</h3>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword('');
                  setLoginError('');
                  setSelectedRole(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedRole ? (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Select your role:</h4>
                
                {/* BE (Backend) Option */}
                <button
                  onClick={() => setSelectedRole('employee')}
                  className="w-full px-4 py-3 bg-red-100 text-blue-800 rounded-lg hover:bg-red-200 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <span>Go To Employee </span>
                  </div>
                </button>
                {/* Leave Option */}
                <button
                  onClick={() => setSelectedRole('leave')}
                  className="w-full px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Go To Leave Portal</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRole('be')}
                  className="w-full px-4 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <span>Go To BE (Demo)</span>
                  </div>
                </button>

                {/* DSE (Direct Sales Executive) Option */}
                <button
                  onClick={() => setSelectedRole('dse')}
                  className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Go To DSE (Demo)</span>
                  </div>
                </button>

                {/* Leaderboard Option */}
                <button
                  onClick={() => setSelectedRole('leaderboard')}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Go To Leaderboard (Demo)</span>
                  </div>
                </button>

                
              </div>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Password for {selectedRole.toUpperCase()} Access
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    required
                  />
                  {loginError && <p className="mt-1 text-sm text-red-600">{loginError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Animated Navbar */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo - Multi-colored SDPL */}
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-3xl font-bold">
                  <span className="text-blue-600">S</span>
                  <span className="text-yellow-500">D</span>
                  <span className="text-black">P</span>
                  <span className="text-red-600">L</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['home', 'about', 'branches', 'team', 'contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className={`relative px-1 py-2 text-sm font-medium transition-all duration-300 ${activeSection === item ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500'}`}
                  onClick={() => setActiveSection(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                  {activeSection === item && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300"></span>
                  )}
                </a>
              ))}
              <button
                onClick={() => setShowLoginModal(true)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Employee Login
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-3">
                {['home', 'about', 'branches',  'team', 'contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    className={`px-3 py-2 rounded-md text-base font-medium ${activeSection === item ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => {
                      setActiveSection(item);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-left"
                >
                  Employee Login
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className={`pt-32 pb-20 px-4 bg-gradient-to-r from-blue-50 to-gray-100 ${currentAnnouncement ? 'mt-8' : ''}`}>
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">Society</span> <span className="text-yellow-400">Distributor</span> <span className="text-black">Private</span> <span className="text-red-400">Limited</span> 
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Delivering excellence in distribution and supply chain management across UP
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="#contact" 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="#about" 
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Clients Grid Section */}
        <Partners/>

        {/* About Us Section */}
        <About/>

        {/* Team Section */}
       <TeamSection/>

        {/* Branches Section */} 
        <BranchesSection/>

        {/* Contact Section */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Add this to your global CSS or in a style tag
const styles = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: inline-block;
    animation: marquee 20s linear infinite;
  }
`;

// Add the styles to the head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}