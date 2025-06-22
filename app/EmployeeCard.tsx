'use client' // Add this at the top
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Define the type for an Employee
interface Employee {
  id: string; // Assuming id is a string, adjust if it's a number
  full_name: string;
  position: string;
  email: string;
  phone_number: string;
  // Add any other properties the employee object might have from your data source
}

export default function EmployeeCard({ 
  employee, 
  mobileView = false 
}: { 
  employee: Employee, // Fixed: Use the Employee type
  mobileView?: boolean 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()

  // Fixed: Specify 'name' as string
  const initials = employee.full_name?.split(' ').map((name: string) => name[0]).join('') || "?"

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/employes/${employee.id}`)
  }

  return (
    <div 
      className={`relative w-[8cm] h-[8cm] perspective-1000 ${mobileView ? 'mb-6' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsFlipped(false)
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Card container with flip animation */}
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of the card */}
        <div className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-2xl' : ''}`}>
          {/* Glossy overlay effect */}
          <div className={`absolute inset-0 bg-white opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-10' : ''}`}></div>
          
          {/* Avatar with animated border */}
          <div className="absolute top-4 left-4 w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center transition-all duration-500 hover:border-white/60 hover:scale-105">
            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          </div>
          
          {/* Employee info */}
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
            <h3 className="text-xl font-bold truncate">{employee.full_name}</h3>
            <p className="text-sm opacity-90 truncate">{employee.position}</p>
            
            {/* More Details button */}
            <div className={`mt-3 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <button 
                className="px-3 py-1 bg-white text-indigo-600 rounded-full text-xs font-semibold hover:bg-indigo-100 transition-colors"
                onClick={handleViewDetails}
              >
                More Details
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full"></div>
        </div>
        
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl rotate-y-180 p-5 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{employee.full_name}</h3>
            <p className="text-sm text-indigo-600 font-medium mb-4">{employee.position}</p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 truncate">{employee.email}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-gray-600">{employee.phone_number}</span>
              </div>
            </div>
          </div>
          
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            onClick={handleViewDetails}
          >
            More Details
          </button>
        </div>
      </div>
    </div>
  )
}