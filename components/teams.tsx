'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Interface and data remain the same
interface TeamMember {
  name: string;
  role: string;
  image: string;
  email: string;
}

const teamMembersData: TeamMember[] = [
    { name: 'Mr. Anuj Agnihotri', role: 'CEO & Founder', image: '/team/anuj-agnihotri.jpg', email: 'anuj@sdlkanpur.com' },
    { name: 'Mr. Neeraj Srivastava', role: 'Operational Manager', image: '/team/neeraj-srivastava.jpg', email: 'om@sdlkanpur.com' },
    { name: 'Mr. Om P Yadav', role: 'System Administrator', image: '/team/om-yadav.jpg', email: 'sysadmin@sdlkanpur.com' },
    { name: 'Mr. Raj Kumar Shukla', role: 'Logistic Executive', image: '/team/raj-shukla.jpg', email: 'dle@sdlkanpur.com' },
    { name: 'Mr. Dheeraj Bajpai', role: 'Human Resource Executive', image: '/team/dheeraj-bajpai.jpg', email: 'dhre@sdlkanpur.com' },
    { name: 'Mr. Pushpendra Pandey', role: 'Finance Executive', image: '/team/pushpendra-pandey.jpg', email: 'dfe@sdlkanpur.com' },
    { name: 'Mr. Shailesh Gupta', role: 'Sales Manager', image: '/team/shailesh-gupta.jpg', email: 'manager.sales@sdlkanpur.com' },
];

const TeamMemberCard = ({ member, index }: { member: TeamMember, index: number }) => (
  <motion.div
    className="flex-shrink-0 w-[90%] sm:w-[45%] md:w-[30%] lg:w-1/4"
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col overflow-hidden border border-gray-100">
      <div className="relative h-72">
        <Image
          src={member.image}
          alt={`Portrait of ${member.name}`}
          fill
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 30vw"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
      </div>
      <div className="p-6 flex-1 flex flex-col text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
        <a 
          href={`mailto:${member.email}`} 
          className="text-gray-500 text-sm mt-auto hover:text-blue-600 transition-colors"
        >
          {member.email}
        </a>
      </div>
    </div>
  </motion.div>
);

export default function TeamCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState(0);

  useEffect(() => {
    const calculateConstraints = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const containerWidth = trackRef.current.offsetWidth;
        // Calculate the maximum draggable distance
        setDragConstraints(trackWidth - containerWidth);
      }
    };
    
    calculateConstraints();
    // Recalculate on window resize
    window.addEventListener('resize', calculateConstraints);
    return () => window.removeEventListener('resize', calculateConstraints);
  }, []);

  return (
    <motion.section 
      id="teams" 
      className="py-24 bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Meet Our <span className="text-blue-600">Leadership Team</span>
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto text-lg"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            The talented professionals driving our company&apos;s success forward.
          </motion.p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <motion.div
            ref={trackRef}
            drag="x"
            dragConstraints={{ right: 0, left: -dragConstraints }}
            className="flex items-stretch gap-6 md:gap-8 cursor-grab active:cursor-grabbing py-4"
          >
            {teamMembersData.map((member, index) => (
              <TeamMemberCard key={member.name} member={member} index={index} />
            ))}
          </motion.div>
          <p className="text-center text-gray-500 mt-8 text-sm md:hidden">
            <span className='font-semibold'>Swipe</span> to explore the team
          </p>
        </div>
      </div>
    </motion.section>
  );
}