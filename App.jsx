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
import logo from "./assets/logo.jpg";

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
            src={logo}
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
