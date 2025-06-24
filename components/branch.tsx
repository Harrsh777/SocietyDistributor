import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const BranchesSection = () => {
  const [activeBranch, setActiveBranch] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const branches = [
    {
      name: 'KANPUR H.Q BRANCH',
      address: 'Society Distributors Private Limited, 127/201, Saket Nagar, W1 Block, Kanpur-208014. Uttar Pradesh-INDIA',
      manager: 'Head Office',
      phone: '+91 8601871906',
      email: 'sysadmin@sdlkanpur.com',
      pin: '208014'
    },
    {
      name: 'AKBARPUR BRANCH',
      address: 'H.No.-471, Ward-16, Kanhaiya Nagar, Akbarpur Kanpur Dehat',
      manager: 'MR. VIRENDRA SINGH (BRANCH INCHARGE)',
      phone: '8601871973',
      email: '',
      pin: '209101'
    },
    {
      name: 'AURAIYA BRANCH',
      address: 'GRAM GYANPUR IMAM ALI, NEAR DEEPU SINGH KI DHAAN MIL AURAIYA',
      manager: 'MR. ASHISH KUMAR (BRANCH INCHARGE)',
      phone: '7408417762',
      email: '',
      pin: '206120'
    },
    {
      name: 'BANDA BRANCH',
      address: 'GALI NO.-1 JARAILY KOTHI VIDYA VIHAR MARRIAGE HALL BANDA',
      manager: 'MR. PRAHLAD KUMAR (BRANCH INCHARGE)',
      phone: '7408417722',
      email: '',
      pin: '210001'
    },
    {
      name: 'BHARTHANA BRANCH',
      address: 'NEAR ADITI HOSPITAL, KRISHNA NAGAR, ETAWAH ROAD BHARTHANA',
      manager: 'MR. ANIS KHAN (BRANCH INCHARGE)',
      phone: '8601871761',
      email: '',
      pin: '206242'
    },
    {
      name: 'CHIBRAMAU BRANCH',
      address: 'TALGRAM ROAD BAHAWALPUR CHHIBRAMAU, KANNAUJ',
      manager: 'MR. ASHISH DWIVEDI (BRANCH INCHARGE)',
      phone: '7311186243',
      email: '',
      pin: '209721'
    },
    {
      name: 'ETAWAH BRANCH',
      address: 'H.N.-66 RAMLELA, OPP. ROAD ROYAL OXFARD SCHOOL ETAWAH',
      manager: 'MR. AFZAL AZIZ (BRANCH MANAGER)',
      phone: '7408417754',
      email: '',
      pin: '206001'
    },
    {
      name: 'FARRUKHABAD BRANCH',
      address: '5/111 LOHIA PURAM, BEHIND DR. S.K. SAXENA CLINIC, FARRUKHABAD',
      manager: 'MR. NAVNEET FARERA (BRANCH INCHARGE)',
      phone: '7311186237',
      email: '',
      pin: '209625'
    },
    {
      name: 'FATEHPUR BRANCH',
      address: 'NEAR DELHI DARBAR RESTAURANT GT ROAD, ABU NAGAR, (BACK TO SOCIETY MOTORS) FATEHPUR',
      manager: 'MR. BHANU PRATAP DWIVEDI (BRANCH INCHARGE)',
      phone: '8601871988',
      email: '',
      pin: '212601'
    },
    {
      name: 'JHANSI BRANCH',
      address: '26/01 BANKERS COLONY SHIVPURI ROAD JHANSI',
      manager: 'MR. ANAND SAHU (BRANCH MANAGER)',
      phone: '8601871732',
      email: '',
      pin: '284003'
    },
    {
      name: 'HAMIRPUR BRANCH',
      address: 'Near Yamuna Bridge, Hamirpur, Bhilawan',
      manager: 'MR. SURENDRA KUMAR (BRANCH INCHARGE)',
      phone: '',
      email: '',
      pin: '210301'
    },
    {
      name: 'KANNAUJ BRANCH',
      address: 'IN FRONT OF NEW S.P. AWAS TIRWA ROAD, KANNAUJ',
      manager: 'MR. AMAN BAJPAI (BRANCH INCHARGE)',
      phone: '8601871998',
      email: '',
      pin: '209726'
    },
    {
      name: 'LALITPUR BRANCH',
      address: 'H.N. – 786 CHAANDMARI CIVIL LINE LALITPUR',
      manager: 'MR. RAJ KUMAR DUBEY (BRANCH INCHARGE)',
      phone: '7408417708',
      email: '',
      pin: '284403'
    },
    {
      name: 'MAURANIPUR BRANCH',
      address: 'MAUZA DIMRAUNI UNDER BRIZE GARAUTHA ROAD, OPP. SANSKAR MARRIAGE GARDEN, MAURANIPUR, JHANSI',
      manager: 'MR. RAMASHANKAR (BRANCH INCHARGE)',
      phone: '7307009166',
      email: '',
      pin: '284204'
    },
    {
      name: 'MAHOBA BRANCH',
      address: 'In Front Of Chandirka Mata Mandir, Near B.J.P Office Chhatarpur Road, Mahoba',
      manager: 'MR. KRISHNA KUMAR (BRANCH INCHARGE)',
      phone: '7408417749',
      email: '',
      pin: '210427'
    },
    {
      name: 'MAINPURI BRANCH',
      address: 'DEVPURA ROAD, NEAR CHRISTIAN FIELD, MAINPURI',
      manager: 'MR. SURAJ BHAN SINGH (BRANCH INCHARGE)',
      phone: '7408417768',
      email: '',
      pin: '205001'
    },
    {
      name: 'NAWABGANJ BRANCH',
      address: 'NEAR BANK OF INDIA, MAIN BAZAR ROAD, NAWABGANJ UNNAO',
      manager: 'MR. RAKESH SRIVASTAVA (BRANCH INCHARGE)',
      phone: '8601871993',
      email: '',
      pin: '208002'
    },
    {
      name: 'ORAI BRANCH',
      address: 'NEW PATHAKPURA, INFRONT OF MECHANIC NAGAR GATE, KONCH ROAD, ORAI',
      manager: 'MR. MURARI DIXIT (BRANCH INCHARGE)',
      phone: '7408417729',
      email: '',
      pin: '285001'
    },
    {
      name: 'UNNAO BRANCH',
      address: '471/3 DAYA RAM BAGIYA, NEAR BAL VIDHYA MANDIR INTER COLLAGE, POORAN NAGAR, UNNAO',
      manager: 'MR. PRADEEP SHARMA (BRANCH INCHARGE)',
      phone: '7311186240',
      email: '',
      pin: '209801'
    },
    {
      name: 'BANGARMAU BRANCH',
      address: 'VILLAGE – KESVAPUR, POST – HAFIZABAD, TEHSIL-BANGARMAU, BANGARMAU, UNNAO',
      manager: 'MR. AKHILESH SINGH (BRANCH INCHARGE)',
      phone: '7307009136',
      email: '',
      pin: '209868'
    },
    {
      name: 'BIGHAPUR BRANCH',
      address: 'SANKITA SWEET HOUSE, BHOJPUR ROAD LAL KUA, TEHSIL – BIGHAPUR, DIS.- UNNAO',
      manager: 'MR. ABHISHEK DIXIT (BRANCH INCHARGE)',
      phone: '7307009130',
      email: '',
      pin: '209865'
    },

  ];

const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.pin.includes(searchTerm)
  );

  const toggleExpand = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section id="branches" className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Branches & Managers</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            With an extensive network across Uttar Pradesh, we&apos;re always nearby to serve you
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10 max-w-2xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search branches by name, manager, or location..."
              className="w-full px-5 py-2.5 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 text-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBranches.map((branch, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.03
              }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-100 ${
                expandedCards[index] ? 'ring-2 ring-blue-400 shadow-md' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-bold text-gray-800 truncate cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      {branch.name}
                    </h3>
                    <p className="text-blue-500 text-xs font-medium truncate mt-0.5">{branch.manager}</p>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium ml-2 whitespace-nowrap"
                  >
                    {branch.pin}
                  </motion.div>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex items-start text-gray-600">
                    <svg className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs line-clamp-2">{branch.address}</p>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${branch.phone}`} className="text-xs hover:text-blue-500 transition-colors">
                        {branch.phone}
                      </a>
                    </div>
                  )}

                  {branch.email && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${branch.email}`} className="text-xs hover:text-blue-500 transition-colors truncate">
                        {branch.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleExpand(index)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    {expandedCards[index] ? 'Show Less' : 'More Details'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveBranch(activeBranch === index ? null : index)}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors shadow-sm"
                  >
                    {activeBranch === index ? 'Close' : 'Contact'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {expandedCards[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-100"
                    >
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">Full Address:</span> {branch.address}</p>
                        {branch.phone && <p><span className="font-medium">Direct Line:</span> {branch.phone}</p>}
                        {branch.email && <p><span className="font-medium">Email:</span> {branch.email}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {activeBranch === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-100"
                    >
                      <form className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your name"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-300 transition-all"
                        />
                        <input
                          type="tel"
                          placeholder="Phone number"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-300 transition-all"
                        />
                        <textarea
                          placeholder="Your message"
                          rows={2}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-300 transition-all"
                        ></textarea>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:shadow-md transition-all"
                        >
                          Send Message
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBranches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <p className="text-gray-500">No branches found matching your search.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BranchesSection;