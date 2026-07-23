export interface BookingSearchParams {
  checkIn: string;
  checkOut: string;
  guests: string;
  children: string;
  rooms: string;
  breakfast?: BreakfastOption;
}

export type BreakfastOption = "with-breakfast";
export type PaymentMethod = "online" | "hotel";

export interface BookingFormPayload {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  countryCode: string;
  country: string;
  specialRequests: string;
  promoCode: string;
  arrivalTime: string;
  flightNumber: string;
  notes: string;
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
  cardLast4?: string;
}

export interface BookingConfirmation {
  id: number;
  status: string;
  paymentStatus: string;
  transactionId: string | null;
}
