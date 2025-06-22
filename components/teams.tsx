'use client'; // Essential for client-side components in Next.js

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image'; // Import the Image component

// Define the type for a team member
interface TeamMember {
  name: string;
  role: string;
  image: string;
  email: string;
}

// --- TEAM MEMBERS DATA ---
// Add your team members here. Replace placeholder images with actual paths.
const teamMembersData: TeamMember[] = [
  {
    name: 'Mr. Anuj Agnihotri',
    role: 'CEO & Founder',
    image: 'https://via.placeholder.com/200/FF5733/FFFFFF?text=Jane+Doe',
    email: 'email: anuj@sdlkanpur.com',
  },
  {
    name: 'Mr. Neeraj Srivastava',
    role: 'Operational Manager',
    image: 'https://via.placeholder.com/200/33FF57/FFFFFF?text=John+Smith',
    email: ' om@sdlkanpur.com',
  },
  {
    name: 'Mr. Om P Yadav',
    role: 'System Administrator',
    image: 'https://via.placeholder.com/200/5733FF/FFFFFF?text=Emily+White',
    email: 'sysadmin@sdlkanpur.com',
  },
  {
    name: 'Mr. Raj Kumar Shukla',
    role: 'Logistic Executive',
    image: 'https://via.placeholder.com/200/FF33CC/FFFFFF?text=David+Green',
    email: 'dle@sdlkanpur.com',
  },
  {
    name: 'Mr. Dheeraj Bajpai',
    role: 'Human Resource Executive',
    image: 'https://via.placeholder.com/200/33CCFF/FFFFFF?text=Sarah+Blue',
    email: 'dhre@sdlkanpur.com',
  },
  {
    name: 'Mr. Pushpendra Pandey',
    role: 'Finance Executive',
    image: 'https://via.placeholder.com/200/CCFF33/FFFFFF?text=Michael+Black',
    email: 'dfe@sdlkanpur.com',
  },
  {
    name: 'Mr. Shailesh Gupta',
    role: 'Sales Manager',
    image: 'https://via.placeholder.com/200/AAAAAA/FFFFFF?text=Olivia+Grey',
    email: 'manager.sales@sdlkanpur.com',
  }
  // Add more team members as needed
];
// --- END TEAM MEMBERS DATA ---

export default function TeamSection() {
  const teamCarouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showArrows, setShowArrows] = useState(false); // State to control arrow visibility

  const teamMembers = teamMembersData;

  // Auto-scroll functionality
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (teamCarouselRef.current && !isHovered) {
          const { scrollWidth, clientWidth, scrollLeft } = teamCarouselRef.current;
          // Calculate the point to loop back, considering the duplicate set
          // We need to loop back when the original set has scrolled past
          const halfwayPoint = scrollWidth / 2;

          if (scrollLeft + clientWidth >= scrollWidth - 1) { // -1 to account for potential sub-pixel rendering issues
            teamCarouselRef.current.scrollLeft = 0;
          } else if (scrollLeft >= halfwayPoint) {
            // If scrolled past the first set, jump back to the start of the duplicated set
            teamCarouselRef.current.scrollLeft -= halfwayPoint;
          } else {
            teamCarouselRef.current.scrollLeft += 0.5; // Adjust scroll speed as needed (smaller increment for smoother scroll)
          }
        }
      }, 20); // Adjust interval for smoother or faster scroll
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    startScrolling();

    return () => {
      stopScrolling();
    };
  }, [isHovered]);

  useEffect(() => {
    // Check if carousel is scrollable on mount and resize
    const checkScrollability = () => {
      if (teamCarouselRef.current) {
        setShowArrows(teamCarouselRef.current.scrollWidth > teamCarouselRef.current.clientWidth);
      }
    };

    // Initial check
    checkScrollability();

    // Add event listener for resize
    window.addEventListener('resize', checkScrollability);

    return () => {
      window.removeEventListener('resize', checkScrollability);
    };
  }, []); // Run once on mount

  const handleCarouselHover = (hovering: boolean) => {
    setIsHovered(hovering);
  };

  const scrollAmount = 280; // This should match the card width + space-x-6 (256px + 24px) for perfect snapping

  return (
    <section id="team" className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-10 animate-fade-in-up">Our Leadership <span className="text-blue-600">Team</span></h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12 md:mb-16 text-lg animate-fade-in-up delay-200">
          Meet the dedicated professionals who make SDPL a leader in distribution and innovation.
        </p>

        <div className="relative">
          <div
            ref={teamCarouselRef}
            className="flex pb-8 snap-x snap-mandatory overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 lg:scrollbar-hide"
            onMouseEnter={() => handleCarouselHover(true)}
            onMouseLeave={() => handleCarouselHover(false)}
          >
            {/* Duplicated for seamless looping effect */}
            <div className="flex space-x-6 pr-6"> {/* Added pr-6 for consistent spacing at the end */}
              {[...teamMembers, ...teamMembers].map((member, index) => (
                <div
                  key={`${member.name}-${index}`}
                  className="flex-shrink-0 w-64 snap-center team-member-card bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 border border-blue-100 cursor-pointer"
                >
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center relative overflow-hidden">
                    <Image // Changed <img> to <Image />
                      src={member.image}
                      alt={member.name}
                      width={200} // Add the width of the image
                      height={200} // Add the height of the image
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Subtle overlay for image branding */}
                    <div className="absolute inset-0 bg-blue-600 opacity-0 transition-opacity duration-300 mix-blend-multiply group-hover:opacity-10"></div>
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-700 text-sm font-semibold mb-2">{member.role}</p>
                    <p className="text-gray-500 text-xs truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows (visible only on larger screens or when scrollable) */}
          {showArrows && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 z-20 hidden md:block transition-all duration-200"
                onClick={() => {
                  if (teamCarouselRef.current) {
                    teamCarouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll left"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 z-20 hidden md:block transition-all duration-200"
                onClick={() => {
                  if (teamCarouselRef.current) {
                    teamCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll right"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Optional: Add custom keyframes for animation in your global CSS file (e.g., globals.css)
/*
@keyframes fadeInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInFromBottom 0.7s ease-out forwards;
}

.animate-fade-in-up.delay-200 {
  animation-delay: 0.2s;
}
*/