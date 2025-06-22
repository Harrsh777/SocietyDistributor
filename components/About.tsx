'use client'; // This directive is essential for client-side functionality in Next.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // For smooth transitions
import Image from 'next/image'; // Import Next.js Image component

// --- IMAGE ADDRESSES ---
// Place your image paths here. Make sure they are relative to your 'public' directory.
// For example, if your image is in `public/images/about/my-image.jpg`, use `/images/about/my-image.jpg`.
const aboutImages = [
  '/society1.jpg', // Example: Replace with your first image
  '/society2.jpg', // Example: Replace with your second image
  '/society3.jpg' // Example: Replace with your third imag
];
// --- END IMAGE ADDRESSES ---

// Create a Framer Motion-enhanced version of the Next.js Image component
const MotionImage = motion(Image);

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set up the interval for changing images
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === aboutImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds (5000 milliseconds)

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Corrected: Empty dependency array as aboutImages.length is constant

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const imageVariants = {
    enter: { opacity: 0.5, scale: 1.05, filter: 'blur(5px)' },
    center: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } },
    exit: { opacity: 0.5, scale: 0.95, filter: 'blur(5px)', transition: { duration: 0.5, ease: 'easeIn' } },
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background patterns for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="20" cy="20" r="15" fill="rgba(66, 153, 225, 0.2)" /> {/* Blue-400 */}
          <circle cx="80" cy="50" r="20" fill="rgba(52, 211, 153, 0.2)" /> {/* Green-400 */}
          <circle cx="40" cy="90" r="18" fill="rgba(251, 191, 36, 0.2)" /> {/* Yellow-400 */}
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8 md:mb-16 tracking-tight leading-tight drop-shadow-sm"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Discover <span className="text-blue-600">Our Story</span>
        </motion.h2>

        {/* Adjusted gap for a slightly tighter and wider appearance */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Image Carousel with Transition - max-w-xl makes the image bigger */}
          <motion.div
            className="lg:w-1/2 w-full flex justify-center perspective-1000"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative w-full max-w-xl aspect-video rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-in-out cursor-pointer group">
              <AnimatePresence initial={false} mode="wait">
                <MotionImage // *** Changed to MotionImage here ***
                  key={currentImageIndex} // Key ensures re-mount for animation
                  src={aboutImages[currentImageIndex]}
                  alt={`About us ${currentImageIndex + 1}`}
                  fill // Use 'fill' for responsive images within a parent with defined aspect ratio
                  className="object-cover rounded-3xl transition-opacity duration-500 ease-in-out"
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                />
              </AnimatePresence>
              {/* Optional: Overlay for gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-md z-10">
                Image {currentImageIndex + 1} of {aboutImages.length}
              </div>
            </div>
          </motion.div>

          {/* About Content - lg:prose-xl makes the text lines wider */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            <div className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100">
              <motion.p className="text-lg text-gray-800 mb-4 font-semibold" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <strong>Society Group</strong> was founded by <strong>Mr. S.P. Agnihotri</strong> in 1975, initiating a dynamic journey with a dealership for Scooters India in Kanpur. This enterprise, wholly owned by Mr. Agnihotri and his immediate family, has grown from strength to strength.
              </motion.p>
              <motion.p className="text-gray-700 mb-4" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
                Today, <strong>Society Group</strong> proudly holds dealerships for major brands including **Tata Motors, Bajaj, BharatBenz, KTM, Kawasaki, Scooter India,** and **Shell**. Our diversified portfolio showcases our commitment to excellence across various sectors.
              </motion.p>
              <motion.p className="text-gray-700 mb-4" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.4 }}>
                Beyond dealerships, we are a key **Distributor for Procter & Gamble** and **Nestle**, and an **Authorized Distributor of Bajaj Auto Components for Uttar Pradesh**. Our distribution network is robust and highly efficient.
              </motion.p>
              <motion.p className="text-gray-700 mb-4" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.6 }}>
                **Society Distributors** extends its operations across the central U.P and Bundelkhand regions. With major facilities in **Kanpur, Lucknow, and Jhansi**, we effectively cover **18 cities** (both urban & rural) in the heartland of India.
              </motion.p>
              <motion.p className="text-gray-700 mb-4" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.8 }}>
                Over the years, our unwavering dedication has fostered strong associations with leading companies, building a loyal customer base of more than **2 lac customers**. This trust is the cornerstone of our enduring success.
              </motion.p>
              <motion.p className="text-gray-700" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 1.0 }}>
                In addition to excellent distribution services, we provide value-added services such as **warehousing, merchandising, and store support** for our customers and suppliers. Our focus remains on fostering mutual success and growth, ensuring our distribution operations cover all urban & rural areas of these key cities.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;