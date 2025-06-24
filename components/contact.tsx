'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  as?: 'input' | 'textarea';
}

// A single, reusable component for each input field with a floating label
const FormField = ({ id, label, type = 'text', as = 'input' }: FormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState('');
  
  const InputComponent = as;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none 
          ${isFocused || hasValue ? 'top-2 text-xs text-blue-400' : 'top-1/2 -translate-y-1/2 text-gray-400'}`}
      >
        {label}
      </label>
      <InputComponent
        id={id}
        name={id}
        type={type}
        required
        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-transparent 
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setHasValue(e.target.value)}
        rows={as === 'textarea' ? 4 : undefined}
      />
    </div>
  );
};

interface ContactInfoCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
}

// Reusable component for the interactive contact info cards
const ContactInfoCard = ({ icon, title, text, href }: ContactInfoCardProps) => {
  const MotionComponent = href ? motion.a : motion.div;
  return (
    <MotionComponent
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className="flex items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/80 cursor-pointer"
      whileHover={{ y: -5, scale: 1.03, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex-shrink-0 p-3 bg-gray-700/50 rounded-lg">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-semibold text-gray-300">{title}</p>
        <p className="text-white">{text}</p>
      </div>
    </MotionComponent>
  );
};

const Contact = () => {
  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.section 
      id="contact" 
      className="py-24 bg-gray-900 text-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(to right, #4b5563 1px, transparent 1px)',
        backgroundSize: '2rem 2rem'
      }}></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          className="text-4xl lg:text-5xl font-extrabold text-center mb-4 tracking-tight"
          variants={itemVariants}
        >
          Get In <span className="text-blue-400">Touch</span>
        </motion.h2>
        <motion.p 
          className="text-center text-gray-400 max-w-2xl mx-auto mb-16 text-lg"
          variants={itemVariants}
        >
          Have a question or a project in mind? We&apos;d love to hear from you.
        </motion.p>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div className="space-y-6" variants={containerVariants}>
            <motion.h3 className="text-2xl font-semibold mb-4" variants={itemVariants}>Contact Information</motion.h3>
            
            <motion.div variants={itemVariants}>
              <ContactInfoCard
                href="tel:+911234567890"
                icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                title="Phone"
                text="+91 (123) 456-7890"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ContactInfoCard
                href="mailto:info@sdlkanpur.com"
                icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                title="Email"
                text="info@sdlkanpur.com"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ContactInfoCard
                href="#"
                icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                title="Headquarters"
                text="Kanpur, Uttar Pradesh, India"
              />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.form className="space-y-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <FormField id="name" label="Your Name" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormField id="email" label="Your Email" type="email" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormField id="message" label="Your Message" as="textarea" />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Send Message
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;