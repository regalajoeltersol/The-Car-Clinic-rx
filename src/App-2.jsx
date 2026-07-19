import React, { useState, useEffect } from "react";
import {
  Wrench,
  Calendar,
  ClipboardList,
  Phone,
  Car,
  Plus,
  CheckCircle2,
  Clock,
  PackageSearch,
  Loader2,
  X,
} from "lucide-react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const LOGO_DATA_URI = "data:image/jpeg;base64,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";

const STATUS_FLOW = [
  { key: "booked", label: "Naka-schedule", color: "#3D5A73" },
  { key: "diagnosing", label: "Sinusuri", color: "#D4A017" },
  { key: "in_progress", label: "Ginagawa", color: "#E8590C" },
  { key: "waiting_parts", label: "Naghihintay ng Parts", color: "#8B5A2B" },
  { key: "done", label: "Tapos na", color: "#4A7C59" },
  { key: "picked_up", label: "Nakuha na", color: "#5B6470" },
];

function statusMeta(key) {
  return STATUS_FLOW.find((s) => s.key === key) || STATUS_FLOW[0];
}

function genTicketNo(existingCount) {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(existingCount + 1).padStart(3, "0");
  return `CCRX-${yy}${mm}${dd}-${seq}`;
}

const SERVICE_TYPES = [
  "Diagnostic Check",
  "Engine Repair",
  "Electrical / Wiring",
  "Injector / Fuel System",
  "Brakes",
  "Suspension",
  "Aircon",
  "Preventive Maintenance",
  "Iba pa",
];

export default function CarClinicApp() {
  const [tab, setTab] = useState("book");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmTicket, setConfirmTicket] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "jobOrders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError("Hindi ma-load ang data. Suriin ang koneksyon sa internet.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addOrder = async (form) => {
    setSaving(true);
    setError(null);
    const ticketNo = genTicketNo(orders.length);
    try {
      await addDoc(collection(db, "jobOrders"), {
        ticketNo,
        customerName: form.customerName,
        phone: form.phone,
        vehicle: form.vehicle,
        plate: form.plate,
        service: form.service,
        preferredDate: form.preferredDate,
        notes: form.notes,
        status: "booked",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setConfirmTicket(ticketNo);
      setSaving(false);
      return true;
    } catch (e) {
      console.error(e);
      setError("Hindi na-save. Subukan ulit.");
      setSaving(false);
      return false;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "jobOrders", id), {
        status,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(e);
      setError("Hindi na-update ang status. Subukan ulit.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1C2128",
        fontFamily: "'Inter', sans-serif",
        color: "#F2EFE9",
        paddingBottom: "3rem",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        .cc-focus:focus-visible {
          outline: 2px solid #E8590C;
          outline-offset: 2px;
        }
        .cc-input::placeholder { color: #9CA3AF; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Header tab={tab} setTab={setTab} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.25rem" }}>
        {tab === "book" ? (
          <BookingForm onSubmit={addOrder} saving={saving} error={error} />
        ) : (
          <JobOrdersView
            orders={orders}
            loading={loading}
            onUpdateStatus={updateStatus}
            error={error}
          />
        )}
      </main>

      {confirmTicket && (
        <ConfirmModal
          ticketNo={confirmTicket}
          onClose={() => setConfirmTicket(null)}
          onViewOrders={() => {
            setConfirmTicket(null);
            setTab("orders");
          }}
        />
      )}
    </div>
  );
}

function Header({ tab, setTab }) {
  return (
    <div style={{ borderBottom: "3px solid #E8590C", background: "#171B21" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.75rem 1.25rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={LOGO_DATA_URI}
            alt="The Car Clinic Rx logo"
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              flexShrink: 0,
              objectFit: "cover",
              boxShadow: "0 0 0 2px #E8590C",
            }}
          />
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.9rem",
                letterSpacing: "0.03em",
                margin: 0,
                lineHeight: 1,
                color: "#F2EFE9",
              }}
            >
              THE CAR CLINIC <span style={{ color: "#E8590C" }}>RX</span>
            </h1>
            <p
              style={{
                margin: "0.2rem 0 0",
                fontSize: "0.72rem",
                color: "#9CA3AF",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Auto Care Center · Your Prescription for Every Repair
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.25rem", marginTop: "1.5rem" }}>
          {[
            { key: "book", label: "Mag-book", icon: Calendar },
            { key: "orders", label: "Job Orders", icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="cc-focus"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.75rem 0.5rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "3px solid #E8590C" : "3px solid transparent",
                  color: active ? "#F2EFE9" : "#9CA3AF",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: "1.1rem" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#B8BEC7",
          marginBottom: "0.4rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.7rem 0.85rem",
  background: "#20262E",
  border: "1px solid #38414D",
  borderRadius: 6,
  color: "#F2EFE9",
  fontSize: "0.95rem",
  fontFamily: "'Inter', sans-serif",
};

function BookingForm({ onSubmit, saving, error }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    vehicle: "",
    plate: "",
    service: SERVICE_TYPES[0],
    preferredDate: "",
    notes: "",
  });
  const [touched, setTouched] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.customerName.trim() && form.phone.trim() && form.vehicle.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    const ok = await onSubmit(form);
    if (ok) {
      setForm({
        customerName: "",
        phone: "",
        vehicle: "",
        plate: "",
        service: SERVICE_TYPES[0],
        preferredDate: "",
        notes: "",
      });
      setTouched(false);
    }
  };

  return (
    <div style={{ paddingTop: "1.75rem" }}>
      <p style={{ color: "#B8BEC7", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Punan ang detalye ng sasakyan mo para makapag-schedule ng appointment.
        Makakatanggap ka ng ticket number pagkatapos.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="Pangalan">
          <input
            className="cc-input cc-focus"
            style={inputStyle}
            placeholder="Juan Dela Cruz"
            value={form.customerName}
            onChange={set("customerName")}
          />
          {touched && !form.customerName.trim() && <ErrorText>Kailangan ang pangalan.</ErrorText>}
        </Field>

        <Field label="Contact number">
          <input
            className="cc-input cc-focus"
            style={inputStyle}
            placeholder="09XX XXX XXXX"
            value={form.phone}
            onChange={set("phone")}
          />
          {touched && !form.phone.trim() && <ErrorText>Kailangan ang contact number.</ErrorText>}
        </Field>

        <Field label="Sasakyan (Make / Model / Year)">
          <input
            className="cc-input cc-focus"
            style={inputStyle}
            placeholder="Kia Carnival 2016 CRDi"
            value={form.vehicle}
            onChange={set("vehicle")}
          />
          {touched && !form.vehicle.trim() && <ErrorText>Kailangan ang detalye ng sasakyan.</ErrorText>}
        </Field>

        <Field label="Plate number (kung meron)">
          <input
            className="cc-input cc-focus"
            style={inputStyle}
            placeholder="ABC 1234"
            value={form.plate}
            onChange={set("plate")}
          />
        </Field>

        <Field label="Klase ng serbisyo">
          <select
            className="cc-focus"
            style={{ ...inputStyle, appearance: "auto" }}
            value={form.service}
            onChange={set("service")}
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Preferred na araw">
          <input
            className="cc-focus"
            type="date"
            style={inputStyle}
            value={form.preferredDate}
            onChange={set("preferredDate")}
          />
        </Field>

        <Field label="Karagdagang detalye (opsyonal)">
          <textarea
            className="cc-input cc-focus"
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            placeholder="Hal. may ingay sa preno, ayaw mag-start paminsan-minsan..."
            value={form.notes}
            onChange={set("notes")}
          />
        </Field>

        {error && <ErrorText>{error}</ErrorText>}

        <button
          type="submit"
          disabled={saving}
          className="cc-focus"
          style={{
            width: "100%",
            padding: "0.9rem",
            background: saving ? "#9C4A25" : "#E8590C",
            border: "none",
            borderRadius: 6,
            color: "#171B21",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: saving ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Nagsse-save...
            </>
          ) : (
            <>
              <Plus size={18} />
              I-book ang Appointment
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function ErrorText({ children }) {
  return (
    <span style={{ display: "block", color: "#F0876B", fontSize: "0.78rem", marginTop: "0.3rem" }}>
      {children}
    </span>
  );
}

function JobOrdersView({ orders, loading, onUpdateStatus, error }) {
  const [filter, setFilter] = useState("all");

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center", color: "#9CA3AF" }}>
        <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>Kinukuha ang job orders...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "1.75rem" }}>
      {error && <ErrorText>{error}</ErrorText>}

      <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`Lahat (${orders.length})`} />
        {STATUS_FLOW.map((s) => {
          const count = orders.filter((o) => o.status === s.key).length;
          return (
            <FilterChip
              key={s.key}
              active={filter === s.key}
              onClick={() => setFilter(s.key)}
              label={`${s.label} (${count})`}
              color={s.color}
            />
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "#6B7280",
            border: "1px dashed #38414D",
            borderRadius: 8,
          }}
        >
          <ClipboardList size={28} style={{ marginBottom: "0.5rem", opacity: 0.6 }} />
          <p style={{ margin: 0, fontSize: "0.9rem" }}>Walang job order dito.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {visible.map((o) => (
            <JobCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className="cc-focus"
      style={{
        flexShrink: 0,
        padding: "0.4rem 0.8rem",
        borderRadius: 20,
        border: `1px solid ${active ? (color || "#E8590C") : "#38414D"}`,
        background: active ? (color ? `${color}33` : "#E8590C33") : "transparent",
        color: active ? "#F2EFE9" : "#9CA3AF",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function JobCard({ order, onUpdateStatus }) {
  const meta = statusMeta(order.status);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#20262E",
        border: "1px solid #38414D",
        borderLeft: `5px solid ${meta.color}`,
        borderRadius: 8,
        padding: "1rem 1.1rem",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "#9CA3AF", letterSpacing: "0.03em" }}>
            {order.ticketNo}
          </span>
          <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "#F2EFE9" }}>
            {order.customerName}
          </h3>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "0.3rem 0.55rem",
            borderRadius: 4,
            background: `${meta.color}26`,
            color: meta.color,
            whiteSpace: "nowrap",
          }}
        >
          {meta.label}
        </span>
      </div>

      <div style={{ marginTop: "0.6rem", fontSize: "0.85rem", color: "#B8BEC7", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Car size={14} /> {order.vehicle} {order.plate ? `· ${order.plate}` : ""}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Phone size={14} /> {order.phone}
        </span>
        {order.service && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Wrench size={14} /> {order.service}
          </span>
        )}
      </div>

      {order.notes && (
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.85rem",
            color: "#9CA3AF",
            fontStyle: "italic",
            borderTop: "1px solid #2C333C",
            paddingTop: "0.6rem",
          }}
        >
          "{order.notes}"
        </p>
      )}

      <button
        onClick={() => setExpanded((e) => !e)}
        className="cc-focus"
        style={{
          marginTop: "0.75rem",
          background: "transparent",
          border: "none",
          color: "#E8590C",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        {expanded ? "Itago ang status options" : "Baguhin ang status"}
      </button>

      {expanded && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
          {STATUS_FLOW.map((s) => (
            <button
              key={s.key}
              onClick={() => onUpdateStatus(order.id, s.key)}
              className="cc-focus"
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: 5,
                border: `1px solid ${s.key === order.status ? s.color : "#38414D"}`,
                background: s.key === order.status ? `${s.color}26` : "transparent",
                color: s.key === order.status ? s.color : "#9CA3AF",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {s.key === "done" && <CheckCircle2 size={12} />}
              {s.key === "waiting_parts" && <PackageSearch size={12} />}
              {s.key === "in_progress" && <Clock size={12} />}
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ ticketNo, onClose, onViewOrders }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#20262E",
          border: "1px solid #38414D",
          borderTop: "5px solid #4A7C59",
          borderRadius: 10,
          maxWidth: 380,
          width: "100%",
          padding: "1.75rem",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="cc-focus"
          style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", color: "#9CA3AF", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
        <CheckCircle2 size={30} color="#4A7C59" />
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.5rem",
            letterSpacing: "0.02em",
            margin: "0.75rem 0 0.25rem",
            color: "#F2EFE9",
          }}
        >
          Na-book na!
        </h2>
        <p style={{ color: "#B8BEC7", fontSize: "0.9rem", margin: "0 0 1rem" }}>
          Narito ang ticket number mo — i-save mo ito para ma-track ang appointment.
        </p>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#E8590C",
            background: "#171B21",
            border: "1px dashed #E8590C",
            borderRadius: 6,
            padding: "0.6rem",
            textAlign: "center",
            marginBottom: "1.25rem",
          }}
        >
          {ticketNo}
        </div>
        <button
          onClick={onViewOrders}
          className="cc-focus"
          style={{
            width: "100%",
            padding: "0.7rem",
            background: "#E8590C",
            border: "none",
            borderRadius: 6,
            color: "#171B21",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tingnan sa Job Orders
        </button>
      </div>
    </div>
  );
}
