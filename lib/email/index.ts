export {
  EMAIL_TEMPLATES,
  getHotelMailConfig,
  getMailFrom,
  getSmtpConfig,
  isSmtpConfigured,
  getBookingNotifyEmail,
  type EmailTemplateId,
} from "./config";
export { emailService, EmailService } from "./email-service";
export { verifySmtpConnection, getLastSmtpVerify, getLastSmtpFailure } from "./smtp-service";
export { buildReservationPdf } from "./pdf-service";
export { renderBookingEmail, previewBookingEmailHtml } from "./template-service";
export { bookingToEmailContext } from "./booking-context";
export {
  notifyNewRoomBooking,
  notifyBookingStatusChange,
  sendBookingLifecycleEmail,
  sendCheckinRemindersForDate,
} from "./booking-notifications";
