import { Plan, Student, Payment, AttendanceRecord, ClubInfo } from '../types';
import { ClubService } from './clubService';
import { PlansService } from './plansService';
import { StudentsService } from './studentsService';
import { PaymentsService } from './paymentsService';
import { AttendanceService } from './attendanceService';
import { RegistrationService } from './registrationService';

export const StorageService = {
  // Club Info
  async getClubInfo(): Promise<ClubInfo> {
    return await ClubService.getClubInfo();
  },
  async saveClubInfo(info: ClubInfo): Promise<void> {
    await ClubService.saveClubInfo(info);
  },

  // Plans
  async getPlans(): Promise<Plan[]> {
    return await PlansService.getPlans();
  },
  async addPlan(plan: Omit<Plan, 'id' | 'created_at'>): Promise<Plan> {
    return await PlansService.addPlan(plan);
  },
  async updatePlan(updatedPlan: Plan): Promise<void> {
    await PlansService.updatePlan(updatedPlan);
  },
  async deletePlan(planId: string): Promise<void> {
    await PlansService.deletePlan(planId);
  },

  // Students
  async getStudents(maxLimit?: number): Promise<Student[]> {
    return await StudentsService.getStudents(maxLimit);
  },
  async getStudentById(studentId: string): Promise<Student | null> {
    return await StudentsService.getStudentById(studentId);
  },
  async addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
    return await StudentsService.addStudent(studentData);
  },
  async updateStudent(updatedStudent: Student): Promise<void> {
    await StudentsService.updateStudent(updatedStudent);
  },
  async deleteStudent(studentId: string): Promise<void> {
    await StudentsService.deleteStudent(studentId);
  },

  // Payments
  async getPayments(month?: string, year?: number): Promise<Payment[]> {
    return await PaymentsService.getPayments(month, year);
  },
  async addPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    return await PaymentsService.addPayment(paymentData);
  },
  async deletePayment(paymentId: string): Promise<void> {
    await PaymentsService.deletePayment(paymentId);
  },

  // Attendance
  async getAttendance(date?: string): Promise<AttendanceRecord[]> {
    return await AttendanceService.getAttendance(date);
  },
  async saveDateAttendance(
    dateStr: string,
    recordsForDate: { student_id: string; status: 'present' | 'absent' | 'excused'; notes?: string }[]
  ): Promise<AttendanceRecord[]> {
    return await AttendanceService.saveDateAttendance(dateStr, recordsForDate);
  },

  // Public Registrations
  async submitPublicRegistration(studentData: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
    return await RegistrationService.submitRegistration(studentData);
  },
};
