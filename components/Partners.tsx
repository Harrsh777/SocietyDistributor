'use client';

import Image from 'next/image'; // Import the Image component

const partners = [
  { name: 'Bajaj', logo: '/bajaj.png' },
  { name: 'Nestlé', logo: '/nestle.svg' },
  { name: 'Tata Motors', logo: '/tata.svg' },
  { name: 'P&G', logo: '/pg.svg' },
  { name: 'MG', logo: '/mg.png' },
];

const Partners = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Valued Partners</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
          {partners.map((client, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              <Image // Changed <img> to <Image />
                src={client.logo}
                alt={`${client.name} logo`}
                width={100} // **You need to set appropriate width**
                height={64} // **You need to set appropriate height (matching your h-16 which is 64px)**
                className="h-16 object-contain mb-4" // Tailwind classes still apply to the <Image> component
              />
              <span className="text-gray-800 font-semibold text-lg">{client.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;