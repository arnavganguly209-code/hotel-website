"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { filterCountries } from "@/lib/countries";

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  errorFieldAttr?: string;
  errorFieldName?: string;
  required?: boolean;
  placeholder?: string;
}

export function CountryAutocomplete({
  value,
  onChange,
  className = "",
  errorFieldAttr,
  errorFieldName,
  required = true,
  placeholder = "Country *",
}: CountryAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(() => filterCountries(value, 14), [value]);

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const name = suggestions[highlight];
      if (name) pick(name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const extraProps =
    errorFieldAttr && errorFieldName
      ? { [errorFieldAttr]: errorFieldName }
      : {};

  return (
    <div ref={rootRef} className="relative">
      <input
        required={required}
        autoComplete="country-name"
        inputMode="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Country"
        className={className}
        {...extraProps}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-[#d7c49d]/70 bg-white py-1 shadow-[0_16px_40px_rgba(15,42,34,0.14)]"
        >
          {suggestions.map((name, i) => (
            <li key={name} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`flex w-full px-4 py-2.5 text-left text-sm transition ${
                  i === highlight
                    ? "bg-[#f4efe4] text-[#173a2b]"
                    : "text-[#173a2b] hover:bg-[#faf6ee]"
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
