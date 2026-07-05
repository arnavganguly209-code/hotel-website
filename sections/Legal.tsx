"use client";

import { motion } from "framer-motion";

export function PrivacyPolicy() {
  return (
    <section id="privacy" className="relative px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-sm border border-luxury-gold/10 bg-white p-8 md:p-12"
        >
          <h2 className="font-display text-3xl font-light text-luxury-charcoal">
            Privacy Policy
          </h2>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-luxury-muted">
            <p>
              Hotel Thamel Park & Spa is committed to protecting your privacy. This
              policy outlines how we collect, use, and safeguard your personal
              information when you visit our website or stay at our property.
            </p>
            <p>
              We collect information you provide directly, such as name, email,
              phone number, and booking details. This information is used to process
              reservations, communicate with you, and enhance your guest experience.
            </p>
            <p>
              We do not sell or share your personal information with third parties
              except as necessary to provide our services or as required by law.
              All data is stored securely with appropriate safeguards.
            </p>
            <p>
              You may request access to, correction of, or deletion of your personal
              data by contacting us at reservations@hotelthamelpark.com.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function TermsConditions() {
  return (
    <section id="terms" className="relative px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-sm border border-luxury-gold/10 bg-white p-8 md:p-12"
        >
          <h2 className="font-display text-3xl font-light text-luxury-charcoal">
            Terms & Conditions
          </h2>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-luxury-muted">
            <p>
              By making a reservation at Hotel Thamel Park & Spa, you agree to
              these terms and conditions. All bookings are subject to availability
              and confirmation.
            </p>
            <p>
              Check-in time is 2:00 PM and check-out time is 12:00 PM. Early
              check-in and late check-out are subject to availability and may incur
              additional charges.
            </p>
            <p>
              Cancellations made 48 hours prior to arrival receive a full refund.
              Cancellations within 48 hours may be subject to one night&apos;s
              charge. No-shows will be charged the full reservation amount.
            </p>
            <p>
              The hotel reserves the right to refuse service to anyone who violates
              hotel policies or engages in disruptive behavior. Guests are
              responsible for any damage to hotel property during their stay.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
