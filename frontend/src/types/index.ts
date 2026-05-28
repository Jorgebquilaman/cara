export type UserRole = 'Admin' | 'Staff' | 'Teacher' | 'Student';
export type AssetStatus = 'Available' | 'InUse' | 'Maintenance' | 'Decommissioned';
export type LoanStatus = 'Pending' | 'Approved' | 'Active' | 'Overdue' | 'Returned' | 'Rejected';
export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type NotificationType =
  | 'LoanApproved' | 'LoanRejected' | 'LoanDueReminder'
  | 'LoanOverdue' | 'SanctionIssued'
  | 'ReservationCreated' | 'ReservationConfirmed' | 'ReservationCancelled'
  | 'IncidentReported' | 'LoanReturned' | 'AccountRequestCreated';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  institutionalEmail: string;
  dni: string;
  phoneNumber?: string;
  careerId?: string;
  careerName?: string;
  departmentName?: string;
  role: UserRole;
  isActive: boolean;
  hasActiveSanctions: boolean;
  activeLoanCount: number;
  createdAt: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  status: AssetStatus;
  department: string;
  location: string;
  description?: string;
  imageUrl?: string;
  maxLoanDays: number;
  createdAt: string;
}

export interface Loan {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  userId: string;
  userName: string;
  startDate: string;
  dueDate: string;
  status: LoanStatus;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  returnedAt?: string;
  message?: string;
}

export interface Reservation {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  space: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface Incident {
  id: string;
  loanId: string;
  assetName: string;
  assetCode: string;
  assetImageUrl?: string;
  description: string;
  photoUrl?: string;
  reportedAt: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface Sanction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  attachmentUrl?: string;
  issuedAt: string;
  expiresAt: string;
  resolvedAt?: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  sentAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DateRange {
  start: string;
  end: string;
  type: 'Loan' | 'Reservation';
}

export interface AssetAvailability {
  assetId: string;
  bookedRanges: DateRange[];
}

export interface DashboardData {
  totalAssets: number;
  availableAssets: number;
  activeLoans: number;
  overdueLoans: number;
  pendingApprovals: number;
  activeSanctions: number;
  upcomingDueLoans: Loan[];
  overdueLoansList: Loan[];
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  recentReservations: Reservation[];
}

export interface UserDashboardData {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  pendingLoans: number;
  overdueLoans: number;
  recentLoans: Loan[];
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  recentReservations: Reservation[];
}
