'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and/or Anon Key are not defined in environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Employee {
  id: string
  branch: string | null
  employee_name: string | null
  employee_code: string | null
  designation: string | null
  date_of_joining: string | null
  date_of_birth: string | null
  employee_personal_number: string | null
  address: string | null
  qualification: string | null
  father_name: string | null
  mother_name: string | null
  wife_name: string | null
  created_at: string | null
  reporting_manager: string | null
  department: string | null
  image_url: string | null
}

const ProfileCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: string
  description: string
}> = ({ icon, title, value, description }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm p-5 flex items-start space-x-4 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0 p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </motion.div>
  )
}

export default function EmployeeProfile() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (data) {
          setEmployee(data)
          if (data.image_url) {
            setPreviewUrl(data.image_url)
          }
        } else {
          router.push('/employe')
        }
      } catch (error) {
        console.error('Error fetching employee:', error)
        router.push('/employe')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [params.id, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!selectedFile || !employee) return

    try {
      setImageUploading(true)

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${employee.id}-${Date.now()}.${fileExt}`
      const filePath = `employee-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('employee-images')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('employee-images')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('employees')
        .update({ image_url: urlData.publicUrl })
        .eq('id', employee.id)

      if (updateError) throw updateError

      setEmployee(prev => prev ? { ...prev, image_url: urlData.publicUrl } : null)
      setShowImageModal(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setImageUploading(false)
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    
    try {
      let date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        if (dateString.includes('-')) {
          const [day, month, year] = dateString.split('-').map(Number);
          if (day && month && year) {
            date = new Date(year, month - 1, day);
          }
        }
        else if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/').map(Number);
          if (day && month && year) {
            date = new Date(year, month - 1, day);
          }
        }
      }

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getYearsOfService = (joiningDate: string | null) => {
    if (!joiningDate) return 0;
    
    try {
      let joinDate: Date;
      
      joinDate = new Date(joiningDate);
      
      if (isNaN(joinDate.getTime())) {
        if (joiningDate.includes('-')) {
          const [day, month, year] = joiningDate.split('-').map(Number);
          if (day && month && year) {
            joinDate = new Date(year, month - 1, day);
          }
        }
        else if (joiningDate.includes('/')) {
          const [day, month, year] = joiningDate.split('/').map(Number);
          if (day && month && year) {
            joinDate = new Date(year, month - 1, day);
          }
        }
      }

      if (isNaN(joinDate.getTime())) return 0;
      
      const currentDate = new Date();
      let years = currentDate.getFullYear() - joinDate.getFullYear();
      const monthDiff = currentDate.getMonth() - joinDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < joinDate.getDate())) {
        years--;
      }
      
      return Math.max(0, years);
    } catch (error) {
      console.error('Error calculating years of service:', error);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-6 h-96"></div>
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-6 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-sm"
          >
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Employee not found</h3>
            <p className="text-gray-600 mb-6">The employee you are looking for does not exist or may have been removed.</p>
            <Link href="/employe" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              Back to Directory
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Employee Image</h3>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-gray-200">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadImage}
                    disabled={!selectedFile || imageUploading}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to employees
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  {/* Profile Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-inner border-4 border-white mb-6 overflow-hidden"
                  >
                    {employee.image_url ? (
                      <Image
                        src={employee.image_url}
                        alt={employee.employee_name || 'Employee'}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="text-5xl font-bold text-blue-600">
                        {employee.employee_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-0 right-0 bg-green-500 rounded-full h-6 w-6 border-2 border-white"
                    />
                  </motion.div>

                  {/* Employee Name and Designation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-4"
                  >
                    <h2 className="text-xl font-bold text-gray-900">
                      {employee.employee_name || 'Unknown Name'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {employee.designation || 'No designation'}
                    </p>
                  </motion.div>

                  {/* Employee Code */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700 mb-6"
                  >
                    ID: {employee.employee_code || 'N/A'}
                  </motion.div>

                  {/* Years of Service */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full mb-6"
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Years of Service</span>
                      <span className="font-medium text-gray-900">{getYearsOfService(employee.date_of_joining)} years</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(getYearsOfService(employee.date_of_joining) * 10, 100)}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Department and Branch */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full space-y-3 mb-6"
                  >
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-sm font-medium text-gray-900">{employee.department || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">Branch</p>
                        <p className="text-sm font-medium text-gray-900">{employee.branch || 'Not specified'}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Edit Profile Button */}
                  
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0"
                  >
                    Employee Profile
                  </motion.h2>

                 
                </div>

                {/* Tabs */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="border-b border-gray-200 mb-6"
                >
                  <nav className="-mb-px flex space-x-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('profile')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('personal')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Personal Info
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('employment')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'employment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Employment
                    </motion.button>
                  </nav>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          title="Joining Date"
                          value={formatDate(employee.date_of_joining)}
                          description={`${getYearsOfService(employee.date_of_joining)} years with the company`}
                        />

                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          }
                          title="Reporting Manager"
                          value={employee.reporting_manager || 'Not specified'}
                          description="Direct supervisor for work assignments"
                        />

                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          }
                          title="Current Position"
                          value={employee.designation || 'Not specified'}
                          description="Primary role and responsibilities"
                        />

                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          }
                          title="Qualification"
                          value={employee.qualification || 'Not specified'}
                          description="Educational background"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                        <p className="text-gray-700">
                          {employee.employee_name || 'This employee'} is a {employee.designation?.toLowerCase() || 'professional'} at {employee.branch || 'our company'} branch.
                          Joined on {formatDate(employee.date_of_joining)}, they have been contributing to the organizations success.
                          {employee.qualification ? ` Qualified with ${employee.qualification},` : ''} they bring valuable skills to the team.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'personal' && (
                    <motion.div
                      key="personal-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          title="Date of Birth"
                          value={formatDate(employee.date_of_birth)}
                          description="Employee's date of birth"
                        />
                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          }
                          title="Personal Contact"
                          value={employee.employee_personal_number || 'Not available'}
                          description="Employee's personal contact number"
                        />
                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          }
                          title="Address"
                          value={employee.address || 'Not specified'}
                          description="Employee's residential address"
                        />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProfileCard
                            icon={
                              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            }
                            title="Father's Name"
                            value={employee.father_name || 'Not specified'}
                            description="Employee's father's name"
                          />
                        <ProfileCard
                          icon={
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 8v4m-4 2h8m-4-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                          title="Designation"
                          value={employee.designation || 'Not specified'}
                          description="The employee's official job title."
                        />
                      </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'employment' && (
  <motion.div
    key="employment"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <ProfileCard
        icon={
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        title="Department"
        value={employee.department || 'Not specified'}
        description="Department within the organization"
      />
      <ProfileCard
        icon={
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title="Branch"
        value={employee.branch || 'Not specified'}
        description="Branch of employment"
      />
      <ProfileCard
        icon={
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0h4" />
          </svg>
        }
        title="Employee Code"
        value={employee.employee_code || 'N/A'}
        description="Unique employee identification code"
      />
      <ProfileCard
        icon={
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="Joining Date"
        value={formatDate(employee.date_of_joining)}
        description={`${getYearsOfService(employee.date_of_joining)} years with the company`}
      />
    </div>
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Details</h3>
      <p className="text-gray-700">
        {employee.employee_name || 'This employee'} works in the {employee.department || ''} department
        at the {employee.branch || ''} branch. They joined on {formatDate(employee.date_of_joining)} and
        have been with the company for {getYearsOfService(employee.date_of_joining)} years.
      </p>
    </div>
  </motion.div>
)}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}