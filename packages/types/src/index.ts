export * from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "TENANT" | "OWNER" | "MANAGER" | "ADMIN";
export type PropertyTier = "PREMIUM" | "STANDARD" | "BUDGET";
export type BedStatus = "VACANT" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type RentStatus = "PAID" | "DUE" | "OVERDUE";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
export type ComplaintCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "FURNITURE"
  | "WIFI"
  | "FOOD"
  | "CLEANLINESS"
  | "SECURITY"
  | "NOISE"
  | "OTHER";
export type ExpenseCategory =
  | "MAINTENANCE"
  | "KITCHEN_FOOD"
  | "UTILITIES_ELECTRICITY"
  | "UTILITIES_WATER"
  | "UTILITIES_GAS"
  | "STAFF_SALARY"
  | "PROPERTY_TAX"
  | "INSURANCE"
  | "MARKETING"
  | "OTHER";
export type PaymentMethod = "UPI" | "NEFT" | "CARD" | "CASH" | "AUTO_DEBIT";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  unreadNotifications: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  phone: string;
  otp: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
  coordinates?: Coordinates;
}

// ─── Property ─────────────────────────────────────────────────────────────────

export type AmenityType =
  | "gym"
  | "wifi"
  | "food"
  | "ac"
  | "workspace"
  | "hotWater"
  | "parking"
  | "laundry"
  | "cctv"
  | "security"
  | "powerBackup"
  | "rooftop"
  | "biometric";

export interface Amenity {
  type: AmenityType;
  label: string;
}

export interface PropertyRule {
  id: string;
  rule: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: Address;
  tier: PropertyTier;
  amenities: Amenity[];
  photos: PropertyPhoto[];
  rules: PropertyRule[];
  ownerId: string;
  managerId?: string;
  rating?: number;
  reviewCount: number;
  totalBeds: number;
  vacantBeds: number;
  startingRent: number;
  depositMonths: number;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListItem {
  id: string;
  slug: string;
  name: string;
  locality: string;
  city: string;
  photos: string[];
  tier: PropertyTier;
  rating?: number;
  reviewCount: number;
  startingRent: number;
  availableBeds: number;
  amenities: Amenity[];
  distance?: string;
}

// ─── Room & Bed ───────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: string;
  hasTour: boolean;
  beds: Bed[];
}

export interface Bed {
  id: string;
  propertyId: string;
  roomId: string;
  label: string;
  roomNumber: string;
  floor: string;
  attributes: string[];
  monthlyRent: number;
  depositAmount: number;
  status: BedStatus;
  availableFrom?: string;
  currentTenantId?: string;
  hasTour: boolean;
}

// ─── Tenant / KYC ─────────────────────────────────────────────────────────────

export interface KYCDocument {
  type: "AADHAAR" | "PAN" | "PASSPORT" | "DL";
  number: string;
  frontUrl: string;
  backUrl?: string;
  verificationStatus: VerificationStatus;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface TenantProfile {
  userId: string;
  occupation?: string;
  organization?: string;
  permanentAddress?: string;
  kyc?: KYCDocument;
  emergencyContact?: EmergencyContact;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  bedId: string;
  bedLabel: string;
  tenantId: string;
  tenantName: string;
  checkIn: string;
  checkOut?: string;
  status: BookingStatus;
  monthlyRent: number;
  depositAmount: number;
  agreementUrl?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  bedId: string;
  checkIn: string;
  paymentMethod: PaymentMethod;
  kyc?: KYCDocument;
  emergencyContact?: EmergencyContact;
}

// ─── Rent ─────────────────────────────────────────────────────────────────────

export interface RentRecord {
  id: string;
  bookingId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantPhoto?: string;
  bedNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: RentStatus;
  daysOverdue?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export interface Complaint {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  propertyId: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  receiptUrl?: string;
  recordedBy: string;
  date: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  propertyId: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  receiptUrl?: string;
  date: string;
}

// ─── PMS ──────────────────────────────────────────────────────────────────────

export interface PMSFloor {
  name: string;
  rooms: PMSRoom[];
}

export interface PMSRoom {
  roomNumber: string;
  beds: PMSBed[];
}

export interface PMSBed {
  id: string;
  label: string;
  status: "vacant" | "occupied" | "reserved" | "maintenance";
  tenant?: string;
}

export interface PMSDashboardStats {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  totalRentDue: number;
  totalRentCollected: number;
  overdueCount: number;
  openComplaints: number;
}

// ─── Owner ────────────────────────────────────────────────────────────────────

export interface OwnerProperty {
  id: string;
  slug: string;
  name: string;
  city: string;
  totalBeds: number;
  occupiedBeds: number;
  monthlyRevenue: number;
  pendingRent: number;
  openComplaints: number;
  tier: PropertyTier;
  isActive: boolean;
}

export interface AddPropertyPayload {
  name: string;
  description: string;
  address: Address;
  tier: PropertyTier;
  amenities: AmenityType[];
  depositMonths: number;
  floors: Array<{
    name: string;
    rooms: Array<{
      roomNumber: string;
      beds: Array<{
        label: string;
        monthlyRent: number;
        attributes: string[];
        hasTour?: boolean;
      }>;
    }>;
  }>;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  categories: {
    cleanliness?: number;
    food?: number;
    management?: number;
    safety?: number;
    valueForMoney?: number;
  };
  createdAt: string;
}

// ─── City / Search ────────────────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  photoUrl: string;
  propertyCount: number;
}

export interface SearchFilters {
  city?: string;
  locality?: string;
  minRent?: number;
  maxRent?: number;
  tier?: PropertyTier;
  amenities?: AmenityType[];
  availableFrom?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  rentRecordId: string;
  amount: number;
  method: PaymentMethod;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionId?: string;
  gatewayOrderId?: string;
  createdAt: string;
}

export interface InitiatePaymentPayload {
  rentRecordId: string;
  amount: number;
  method: PaymentMethod;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: "RENT_DUE" | "BOOKING_CONFIRMED" | "COMPLAINT_UPDATE" | "MOVE_OUT" | "GENERAL";
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Move-out ─────────────────────────────────────────────────────────────────

export interface InspectionItem {
  id: string;
  label: string;
  category: "FURNITURE" | "FIXTURE" | "APPLIANCE" | "WALL" | "FLOOR" | "OTHER";
  condition: "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE" | "MISSING";
  damageAmount?: number;
  photos?: string[];
  notes?: string;
}

export interface MoveOutInspection {
  bookingId: string;
  inspectedBy: string;
  items: InspectionItem[];
  totalDamageAmount: number;
  depositRefundAmount: number;
  notes?: string;
  signedByTenant: boolean;
  createdAt: string;
}
