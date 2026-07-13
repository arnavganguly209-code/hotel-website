export interface BookingSearchParams {
  checkIn: string;
  checkOut: string;
  guests: string;
  children: string;
  rooms: string;
}

export type BreakfastOption = "room-only" | "with-breakfast";
export type PaymentMethod = "online" | "hotel";

export interface BookingFormPayload {
  name: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  children: number;
  roomQuantity: number;
  roomSlug: string;
  roomName: string;
  breakfast: BreakfastOption;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  nights: number;
}

export interface BookingConfirmation {
  id: number;
  status: string;
  paymentStatus: string;
  transactionId: string | null;
}
