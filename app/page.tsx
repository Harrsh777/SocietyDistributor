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
// New import for animations
import { motion, AnimatePresence } from 'framer-motion';

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
      
      // Section detection logic remains the same
      const sections = ['home', 'about', 'branches', 'teams', 'contact'];
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

    const visibleWidth = (cardWidth * cardsToShow) + (gap * (cardsToShow - 1));

    const scrollCarousel = () => {
      if (isCarouselPaused) {
        animationId = requestAnimationFrame(scrollCarousel);
        return;
      }

      scrollAmount += speed;
      carousel.scrollLeft = scrollAmount;

      if (scrollAmount >= carousel.scrollWidth / 2) {
        scrollAmount = 0;
        carousel.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(scrollCarousel);
    };

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
    
    // Passwords remain unchanged
    const employeePassword = 'admin123';
    const bePassword = 'admin123';
    const dsePassword = 'admin123';
    const leaderboardPassword = 'admin123';
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
  const handleSamwadhDownload = async () => {
  // 1. Download the PDF
  try {
    const pdfUrl = '/samwad.pdf';
    const pdfLink = document.createElement('a');
    pdfLink.href = pdfUrl;
    pdfLink.download = 'Samwadh.pdf';
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);
  } catch (error) {
    console.error('PDF download failed:', error);
    alert('Failed to download PDF. Please check the file exists.');
    return;
  }

  // 2. Download images with enhanced handling
  const imageUrls = [
    '/samwadh1.jpg',
    '/samwadh2.jpg', 
    '/samwadh3.jpg',
    '/samwadh4.jpg'
  ];

  // Create a hidden container for downloads
  const downloadContainer = document.createElement('div');
  downloadContainer.style.display = 'none';
  document.body.appendChild(downloadContainer);

  try {
    for (const [index, url] of imageUrls.entries()) {
      try {
        // Create link with unique timestamp to prevent caching
        const timestamp = Date.now();
        const imgLink = document.createElement('a');
        imgLink.href = `${url}?t=${timestamp}`;
        imgLink.download = `samwadh-image-${index + 1}.jpg`;
        
        // Add to container and click
        downloadContainer.appendChild(imgLink);
        imgLink.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clean up
        downloadContainer.removeChild(imgLink);
      } catch (error) {
        console.error(`Failed to download image ${index + 1}:`, error);
      }
    }
  } finally {
    // Clean up container
    document.body.removeChild(downloadContainer);
  }

  alert('Download process completed! Check your downloads folder.');
};

  // Announcement logic remains unchanged
  const handleAnnouncementPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementPassword === 'admin123') {
      setShowAdminControls(true);
      setAnnouncementError('');
      setAnnouncementPassword('');
    } else {
      setAnnouncementError('Incorrect password');
    }
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      setAnnouncementError('Please enter announcement text');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); 

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

  const handleDeleteAnnouncement = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('currentAnnouncement');
    setShowAdminControls(false);
    setShowAnnouncementModal(false);
  };

  // Animation variants for modals
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>SDPL - Premium Logistics & Distribution</title>
        <meta name="description" content="SDPL provides world-class logistics and distribution services across India" />
        <link rel="icon" href="/favicon.ico" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* FLOATING BUTTON REMOVED as requested */}

      {/* Announcement Carousel */}
      {currentAnnouncement && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-2 z-[60] overflow-hidden">
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
        <motion.button
          onClick={() => setShowAnnouncementModal(true)}
          className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors shadow-lg"
          title="Admin Panel"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Animated Admin Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div 
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
              variants={modalVariants}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Admin Access</h3>
                <button 
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setAnnouncementPassword('');
                    setAnnouncementError('');
                    setShowAdminControls(false);
                  }}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Rest of the modal content, functionality is identical */}
              {!showAdminControls ? (
              <form onSubmit={handleAnnouncementPasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="announcementPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Admin Password
                  </label>
                  <input
                    type="password"
                    id="announcementPassword"
                    value={announcementPassword}
                    onChange={(e) => setAnnouncementPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Enter password"
                    required
                  />
                  {announcementError && <p className="mt-2 text-sm text-red-600">{announcementError}</p>}
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit
                </motion.button>
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
                    <motion.button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                       whileHover={{ scale: 1.03 }}
                       whileTap={{ scale: 0.98 }}
                    >
                      {currentAnnouncement ? 'Update' : 'Create'}
                    </motion.button>
                  </div>
                </form>

                {currentAnnouncement && (
                  <motion.button
                    onClick={handleDeleteAnnouncement}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                     whileHover={{ scale: 1.03 }}
                     whileTap={{ scale: 0.98 }}
                  >
                    Delete Announcement
                  </motion.button>
                )}
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
              variants={modalVariants}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Employee Portal</h3>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword('');
                    setLoginError('');
                    setSelectedRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!selectedRole ? (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Select your role:</h4>
                  {[
                    { role: 'employee', label: 'Go To Employee', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', color: 'red' },
                    { role: 'leave', label: 'Go To Leave Portal', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'purple' },
                    { role: 'be', label: 'Go To BE (Demo)', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', color: 'blue' },
                    { role: 'dse', label: 'Go To DSE (Demo)', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'green' },
                    { role: 'leaderboard', label: 'Go To Leaderboard (Demo)', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'yellow' },
                  ].map(item => (
                    <motion.button
                      key={item.role}
                      onClick={() => setSelectedRole(item.role)}
                      className={`w-full px-4 py-3 bg-${item.color}-100 text-${item.color}-800 rounded-lg transition-colors text-left flex items-center`}
                      whileHover={{ scale: 1.03, backgroundColor: `var(--color-${item.color}-200)` }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className='font-medium'>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Password for {selectedRole.toUpperCase()} Access
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      placeholder="Enter password"
                      required
                      autoFocus
                    />
                    {loginError && <p className="mt-2 text-sm text-red-600">{loginError}</p>}
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Navbar */}
      {/* Animated Navbar */}
      <motion.header
        className={`fixed w-full z-50 transition-shadow duration-300`}
        animate={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
          boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
          paddingTop: isScrolled ? '0.5rem' : '1rem',
          paddingBottom: isScrolled ? '0.5rem' : '1rem',
        }}
        transition={{ duration: 0.3 }}
      >
         {/* Announcement Carousel */}
      {currentAnnouncement && (
        <div className="bg-blue-600 text-white py-2 z-[60] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
            <span className="mx-4 text-sm font-medium">{currentAnnouncement.text}</span>
          </div>
        </div>
      )}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
                <span className="text-3xl font-bold">
                  <span className="text-blue-600">S</span><span className="text-yellow-500">D</span><span className="text-black">P</span><span className="text-red-600">L</span>
                </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {['home', 'about', 'branches', 'teams'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === item ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setActiveSection(item)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                  {activeSection === item && (
                    <motion.span
                      className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-blue-600 rounded-full"
                      layoutId="underline"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
               {/* NEW SAMWADH BUTTON */}
              <motion.button
                onClick={handleSamwadhDownload}
                className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition-colors"
                whileHover={{ y: -2 }} whileTap={{ y: 0 }}
              >
                Samwadh
              </motion.button>
              <motion.a
                  href="#contact"
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'contact' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setActiveSection('contact')}
                  whileHover={{ y: -2 }} whileTap={{ y: 0 }}
                >
                  Contact
                  {activeSection === 'contact' && (
                    <motion.span
                      className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-blue-600 rounded-full"
                      layoutId="underline"
                    />
                  )}
                </motion.a>
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="ml-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Employee Login
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {/* Animated icon can be added here later */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-0 pb-4 overflow-hidden absolute top-full left-0 w-full bg-white shadow-md z-[100]"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col space-y-2">
                {['home', 'about', 'branches',  'teams', 'contact'].map((item) => (
                  <a key={item} href={`#${item}`} className={`px-3 py-2 rounded-md text-base font-medium ${activeSection === item ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => { setActiveSection(item); setIsMenuOpen(false); }}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                ))}
                 <button onClick={() => { handleSamwadhDownload(); setIsMenuOpen(false); }} className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 text-left">Samwadh</button>
                <button onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }} className="mt-2 px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left font-semibold">
                  Employee Login
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.header>

      <main>
        {/* Animated Hero Section */}
        <motion.section 
          id="home" 
          className={`relative pt-40 pb-24 px-4 overflow-hidden animated-gradient ${currentAnnouncement ? 'mt-8' : ''}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <div className="container mx-auto text-center relative z-10">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            >
              <span className="text-blue-600">Society</span> <span className="text-yellow-400">Distributor</span> <span className="text-black">Private</span> <span className="text-red-400">Limited</span> 
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}
            >
              Delivering excellence in distribution and supply chain management across UP
            </motion.p>
            <motion.div 
              className="flex justify-center space-x-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } } }}
            >
              <motion.a 
                href="#contact" 
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Contact Us
              </motion.a>
              <motion.a 
                href="#about" 
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Learn More
              </motion.a>
            </motion.div>
          </div>
        </motion.section>

        {/* Existing Components - Functionality is preserved */}
        <Partners/>
        <About/>
        <TeamSection/>
        <BranchesSection/>
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

// Global styles for animations like the marquee and new hero background
const styles = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: inline-block;
    animation: marquee 20s linear infinite;
  }
  .animated-gradient {
    background: linear-gradient(-45deg, #e0f2fe, #f3f4f6, #fefce8, #dbeafe);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
  }
  @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
  }
  /* For cleaner modal button colors */
  :root {
    --color-red-200: #fee2e2;
    --color-purple-200: #f3e8ff;
    --color-blue-200: #dbeafe;
    --color-green-200: #d1fae5;
    --color-yellow-200: #fef9c3;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}