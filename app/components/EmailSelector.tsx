"use client";

import { useMemo, useState } from "react";
import {
  CustomerEmail,
  EmailFilters,
  EmailStatusFilter,
  ProductModelFilter,
} from "@/app/lib/types";

interface EmailSelectorProps {
  emails: CustomerEmail[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
  filters: EmailFilters;
  onFiltersChange: (filters: EmailFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

interface FiltersProps {
  filters: EmailFilters;
  onFiltersChange: (filters: EmailFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

interface EmailItemProps {
  email: CustomerEmail;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const priorityColors: Record<CustomerEmail["priority"], string> = {
  low: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  medium: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  high: "bg-red-500/20 text-red-200 border-red-400/30",
};

function FiltersPanel({ filters, onFiltersChange, searchTerm, onSearchChange }: FiltersProps) {
  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      productModel: "all",
    });
    onSearchChange("");
  };

  return (
    <div className="glass rounded-xl p-3 border border-cyan-400/20 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Filters</p>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[11px] text-cyan-200 hover:text-cyan-50 underline underline-offset-2"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="status-filter" className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block">
          Status & Sentiment
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as EmailStatusFilter })}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
        >
          <option value="all">All emails</option>
          <option value="answered">Replied</option>
          <option value="priority-high">High priority</option>
          <option value="priority-medium">Medium priority</option>
          <option value="priority-low">Low priority</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="product-filter" className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block">
          Product Model
        </label>
        <select
          id="product-filter"
          value={filters.productModel}
          onChange={(e) => onFiltersChange({ ...filters, productModel: e.target.value as ProductModelFilter })}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
        >
          <option value="all">All Models</option>
          <option value="model-1">TV-Model 1</option>
          <option value="model-2">TV-Model 2</option>
          <option value="model-3">TV-Model 3</option>
          <option value="model-4">TV-Model 4</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="search-emails" className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block">
          Search
        </label>
        <input
          id="search-emails"
          type="search"
          value={searchTerm}
          placeholder="Find by customer, subject, product..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm placeholder:text-cyan-100/60"
        />
      </div>
    </div>
  );
}

function EmailItem({ email, isSelected, onSelect }: EmailItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(email.id)}
      className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
        isSelected
          ? "glass-strong border-cyan-400/50 neon-glow-cyan-strong"
          : "glass border-white/10 hover:border-cyan-400/30 hover:neon-glow-cyan"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-cyan-100">
            {email.customerName}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {email.answered ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded border bg-cyan-500/20 text-cyan-300 border-cyan-400/30 neon-border-cyan">
              Replied
            </span>
          ) : (
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${priorityColors[email.priority]} neon-border-cyan`}>
              {email.priority} priority
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-cyan-50 font-semibold line-clamp-1">
        {email.subject}
      </p>
      <p className="text-sm text-cyan-100/80 line-clamp-2">
        {email.body}
      </p>
    </button>
  );
}

export function EmailSelector({
  emails,
  selectedEmailId,
  onSelectEmail,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
}: EmailSelectorProps) {
  const [view, setView] = useState<"open" | "responded" | "all">("open");

  const respondedEmails = useMemo(
    () => emails.filter((email) => email.answered),
    [emails]
  );
  const pendingEmails = useMemo(
    () => emails.filter((email) => !email.answered),
    [emails]
  );

  const activeList =
    view === "open" ? pendingEmails : view === "responded" ? respondedEmails : emails;
  const viewOptions: {
    key: "open" | "responded" | "all";
    label: string;
  }[] = [
    {
      key: "open",
      label: "Open",
    },
    {
      key: "responded",
      label: "Replied",
    },
    {
      key: "all",
      label: "All",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-cyan-200">Customer Emails</h2>
      </div>

      <FiltersPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      <div className="glass rounded-xl p-3 border border-cyan-400/20 space-y-3">
        <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wide px-1">
          View
        </p>
        <div className="grid grid-cols-3 gap-2">
          {viewOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key as "open" | "responded" | "all")}
              className={`w-full rounded-lg px-3 py-2 border transition-all duration-200 flex items-center justify-center ${
                view === key
                  ? "glass-strong border-cyan-400/60 text-cyan-100 neon-glow-cyan-strong"
                  : "glass border-white/10 text-cyan-100/70 hover:border-cyan-400/40 hover:text-cyan-100"
              }`}
              aria-label={label}
            >
              <span className="text-sm font-semibold text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "all" ? (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 custom-scroll">
          <div className="space-y-3">
            {pendingEmails.length === 0 ? (
              <div className="glass rounded-xl border border-dashed border-cyan-400/30 p-4 text-center text-cyan-100/70">
                No open emails match the current filters.
              </div>
            ) : (
              pendingEmails.map((email) => (
                <EmailItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmailId === email.id}
                  onSelect={onSelectEmail}
                />
              ))
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            {respondedEmails.length === 0 ? (
              <div className="glass rounded-xl border border-dashed border-cyan-400/20 p-4 text-center text-cyan-100/70">
                Replied emails will move here automatically.
              </div>
            ) : (
              respondedEmails.map((email) => (
                <EmailItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmailId === email.id}
                  onSelect={onSelectEmail}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scroll">
          {activeList.length === 0 ? (
            <div className="glass rounded-xl border border-dashed border-cyan-400/30 p-4 text-center text-cyan-100/70">
              {view === "responded"
                ? "No responded emails match the current filters."
                : "No open emails match the current filters."}
            </div>
          ) : (
            activeList.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                isSelected={selectedEmailId === email.id}
                onSelect={onSelectEmail}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
