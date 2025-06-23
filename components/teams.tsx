'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  image: string; // You'll replace these with your actual image paths
  email: string;
}

const teamMembersData: TeamMember[] = [
  {
    name: 'Mr. Anuj Agnihotri',
    role: 'CEO & Founder',
    image: '/team/anuj-agnihotri.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'anuj@sdlkanpur.com',
  },
  {
    name: 'Mr. Neeraj Srivastava',
    role: 'Operational Manager',
    image: '/team/neeraj-srivastava.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'om@sdlkanpur.com',
  },
  {
    name: 'Mr. Om P Yadav',
    role: 'System Administrator',
    image: '/team/om-yadav.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'sysadmin@sdlkanpur.com',
  },
  {
    name: 'Mr. Raj Kumar Shukla',
    role: 'Logistic Executive',
    image: '/team/raj-shukla.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'dle@sdlkanpur.com',
  },
  {
    name: 'Mr. Dheeraj Bajpai',
    role: 'Human Resource Executive',
    image: '/team/dheeraj-bajpai.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'dhre@sdlkanpur.com',
  },
  {
    name: 'Mr. Pushpendra Pandey',
    role: 'Finance Executive',
    image: '/team/pushpendra-pandey.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'dfe@sdlkanpur.com',
  },
  {
    name: 'Mr. Shailesh Gupta',
    role: 'Sales Manager',
    image: '/team/shailesh-gupta.jpg', // REPLACE WITH YOUR IMAGE PATH
    email: 'manager.sales@sdlkanpur.com',
  }
];

export default function TeamCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationFrameRef = useRef<number>();

  // Create infinite loop by duplicating the items
  const duplicatedMembers = [...teamMembersData, ...teamMembersData];

  // Auto-scroll functionality
  useEffect(() => {
    const smoothScroll = () => {
      if (!carouselRef.current || isHovered) return;

      const { scrollLeft } = carouselRef.current;
      const scrollWidth = carouselRef.current.scrollWidth / 2;
      
      const nextPos = scrollLeft + 0.75; // Adjust scroll speed here
      
      if (nextPos >= scrollWidth) {
        carouselRef.current.scrollLeft = 0;
      } else {
        carouselRef.current.scrollLeft = nextPos;
      }

      animationFrameRef.current = requestAnimationFrame(smoothScroll);
    };

    const startScrolling = () => {
      animationFrameRef.current = requestAnimationFrame(smoothScroll);
    };

    startScrolling();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  // Check if carousel is scrollable
  useEffect(() => {
    const checkScrollability = () => {
      if (carouselRef.current) {
        setShowArrows(carouselRef.current.scrollWidth > carouselRef.current.clientWidth);
      }
    };

    checkScrollability();
    window.addEventListener('resize', checkScrollability);

    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  // Update current index for indicator dots
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, clientWidth } = carouselRef.current;
      const itemWidth = clientWidth / Math.floor(clientWidth / 320);
      const newIndex = Math.round(scrollLeft / itemWidth) % teamMembersData.length;
      
      setCurrentIndex(newIndex);
    };

    carouselRef.current?.addEventListener('scroll', handleScroll);
    return () => carouselRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToItem = (index: number) => {
    if (!carouselRef.current) return;
    
    const itemWidth = carouselRef.current.clientWidth / Math.floor(carouselRef.current.clientWidth / 320);
    carouselRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-blue-600">Leadership</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            The talented professionals driving our company@apos;s success
          </p>
        </div>

        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {duplicatedMembers.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="flex-shrink-0 w-80 px-4 snap-start transition-all duration-300"
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                  <div className="relative h-64 bg-gradient-to-r from-blue-50 to-indigo-50">
                    {/* Image container - REPLACE WITH YOUR ACTUAL IMAGES */}
                    <Image
                      src={member.image}
                      alt={`Portrait of ${member.name}`}
                      width={320}
                      height={256}
                      className="w-full h-full object-cover"
                      priority={index < 3} // Only prioritize first few images
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-500 text-sm mt-auto">
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {showArrows && (
            <>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({
                      left: -320,
                      behavior: 'smooth'
                    });
                  }
                }}
                aria-label="Previous team member"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({
                      left: 320,
                      behavior: 'smooth'
                    });
                  }
                }}
                aria-label="Next team member"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Indicator dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {teamMembersData.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToItem(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to team member ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
    </section>
  );
}