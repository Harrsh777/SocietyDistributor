// types/employee.ts
export interface Employee {
  id: string
  full_name: string
  position: string
  department: string
  email: string
  phone_number: string
  dob: string
  join_date: string
  photo_url?: string
  // Add other fields as needed
}