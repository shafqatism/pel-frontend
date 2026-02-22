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
  joiningDate?: string
  status: "active" | "on_leave" | "terminated" | "resigned"
  basicSalary: number
  bankAccountNumber?: string
  bankName?: string
  profilePhotoUrl?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
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
  joiningDate?: string
  status?: string
  basicSalary?: number
  bankAccountNumber?: string
  bankName?: string
  profilePhotoUrl?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export interface Attendance {
  id: string
  employeeId: string
  employee?: Pick<Employee, "id" | "fullName" | "designation" | "department">
  date: string
  checkIn?: string
  checkOut?: string
  status: "present" | "absent" | "leave" | "late" | "half_day"
  notes?: string
  site?: string
  createdAt: string
}

export interface CreateAttendanceDto {
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status?: string
  notes?: string
  site?: string
}
