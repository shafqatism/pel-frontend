// ─── Employee ────────────────────────────────────────────────────────────────
export interface Employee {
  id: string
  fullName: string
  fatherName?: string
  cnic?: string
  phone?: string
  email?: string
  address?: string
  designation: string
  department: string
  clientEmpCode?: string
  peopleEmpCode?: string
  birthDate?: string
  joiningDate?: string
  status: "active" | "on_leave" | "terminated" | "resigned"
  basicSalary: number
  bankAccountNumber?: string
  bankName?: string
  profilePhotoUrl?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  attachments?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeDto {
  fullName: string
  fatherName?: string
  cnic?: string
  phone?: string
  email?: string
  address?: string
  designation: string
  department: string
  clientEmpCode?: string
  peopleEmpCode?: string
  birthDate?: string
  joiningDate?: string
  status?: string
  basicSalary?: number
  bankAccountNumber?: string
  bankName?: string
  profilePhotoUrl?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  attachments?: any[]
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export interface Attendance {
  id: string
  employeeId: string
  employee?: Pick<Employee, "id" | "fullName" | "designation" | "department">
  date: string
  checkIn?: string
  checkOut?: string
  overtimeIn?: string
  overtimeOut?: string
  checkInLocation?: string
  checkOutLocation?: string
  overtimeInLocation?: string
  overtimeOutLocation?: string
  checkInPhoto?: string
  checkOutPhoto?: string
  overtimeInPhoto?: string
  overtimeOutPhoto?: string
  status: "present" | "absent" | "leave" | "late" | "half_day"
  notes?: string
  site?: string
  attachments?: any[]
  createdAt: string
}

export interface CreateAttendanceDto {
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  overtimeIn?: string
  overtimeOut?: string
  checkInLocation?: string
  checkOutLocation?: string
  overtimeInLocation?: string
  overtimeOutLocation?: string
  checkInPhoto?: string
  checkOutPhoto?: string
  overtimeInPhoto?: string
  overtimeOutPhoto?: string
  status?: string
  notes?: string
  site?: string
  attachments?: any[]
}
