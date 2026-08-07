"use client";

/** Half-hour slots from 12:00 (noon) through 23:30 — hotel check-in friendly. */
export const AFTERNOON_ARRIVAL_SLOTS: readonly { value: string; label: string }[] = [
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "18:30", label: "6:30 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "19:30", label: "7:30 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
  { value: "23:30", label: "11:30 PM" },
];

interface ArrivalTimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  errorFieldAttr?: string;
  errorFieldName?: string;
}

export function ArrivalTimeSelect({
  value,
  onChange,
  className = "",
  errorFieldAttr,
  errorFieldName,
}: ArrivalTimeSelectProps) {
  const extraProps =
    errorFieldAttr && errorFieldName
      ? { [errorFieldAttr]: errorFieldName }
      : {};

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#4f5f56]">
        Expected Arrival Time{" "}
        <span className="font-normal text-[#8a938e]">(optional · from 12:00 PM)</span>
      </span>
      <select
        aria-label="Expected arrival time (optional, from 12 PM)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%238a938e%22 d=%22M1 1l5 5 5-5%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
        {...extraProps}
      >
        <option value="">Select arrival time</option>
        {AFTERNOON_ARRIVAL_SLOTS.map((slot) => (
          <option key={slot.value} value={slot.value}>
            {slot.label}
          </option>
        ))}
      </select>
    </label>
  );
}
