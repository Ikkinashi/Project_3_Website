import React, { useEffect,useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  Flame,
  Zap,
  Dumbbell,
  Hammer,
  Check,
  ShoppingCart,
  Plus,
  X,
} from "lucide-react";

const ACCENT = "#22D3EE";
const ACCENT_HOVER = "#67E8F9";
const PAGE_BG = "#0A0F1D";
const CARD_BG = "#111827";

const plans = [
  {
    id: "kindle",
    name: "Kindle",
    tagline: "Light the first spark.",
    heatLabel: "Low Heat",
    Icon: Flame,
    monthly: 29,
    annual: 290,
    description:
      "Removes the guesswork and turns 'I should work out' into a habit that sticks.",
    features: [
      "3 workouts / week",
      "Guided form videos",
      "Monthly coach check-in",
      "Community chat access",
    ],
  },
  {
    id: "temper",
    name: "Temper",
    tagline: "Heat, then hold, then heat again.",
    heatLabel: "Working Heat",
    Icon: Zap,
    monthly: 59,
    annual: 590,
    description:
      "Periodized strength built around cycles of hard training and controlled recovery.",
    features: [
      "5 workouts / week",
      "Custom macros + nutrition",
      "Biweekly 1:1 coach review",
      "Priority community access",
    ],
    popular: true,
  },
  {
    id: "forge",
    name: "Forge",
    tagline: "Hammered into shape.",
    heatLabel: "High Heat",
    Icon: Dumbbell,
    monthly: 99,
    annual: 990,
    description:
      "Advanced goal-specific programming — strength, hypertrophy, or performance.",
    features: [
      "6 workouts / week",
      "Full nutrition guidance",
      "Weekly 1:1 coach review",
      "Biweekly revisions",
    ],
  },
  {
    id: "anvil",
    name: "Anvil",
    tagline: "Everything shapes against it.",
    heatLabel: "Peak Heat",
    Icon: Hammer,
    monthly: 179,
    annual: 1790,
    description:
      "Invite-only bespoke coaching for competitors and high performers.",
    features: [
      "Custom programming, weekly",
      "Direct daily coach messaging",
      "Recovery + peaking blocks",
      "Monthly video breakdown",
    ],
  },
];

function PlanCard({ plan, annual, inCart, onToggleCart }) {
  const price = annual ? plan.annual : plan.monthly;
  const period = annual ? "/yr" : "/mo";
  const { Icon } = plan;
  const inverted = plan.popular;

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border p-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1"
      style={{
        backgroundColor: CARD_BG,
        borderColor: inverted ? `${ACCENT}80` : "rgba(255,255,255,0.08)",
        boxShadow: inverted ? `0 0 0 1px ${ACCENT}30` : "none",
      }}
    >
      {/* image / icon panel */}
      <div
        className="relative -mx-4 -mt-4 mb-4 flex h-24 items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${PAGE_BG} 0%, #0E2530 60%, ${ACCENT} 150%)`,
        }}
      >
        <div
          className="absolute h-16 w-16 rounded-full opacity-40 blur-xl"
          style={{ backgroundColor: ACCENT }}
        />
        <Icon className="relative h-9 w-9 text-white drop-shadow-md" strokeWidth={1.75} />
        {plan.popular && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black"
            style={{ backgroundColor: ACCENT }}
          >
            Most Popular
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" style={{ color: ACCENT }} strokeWidth={2.5} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          {plan.heatLabel}
        </span>
      </div>

      <h3
        className="mt-2.5 text-xl font-bold uppercase leading-none tracking-wide text-white"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {plan.name}
      </h3>
      <p className="mt-1 text-[11px] italic leading-snug text-slate-400">
        {plan.tagline}
      </p>

      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="text-3xl font-medium text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          ${price}
        </span>
        <span className="text-[11px] text-slate-500">{period}</span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {annual
  ? plan.annualData?.description || plan.description
  : plan.monthlyData?.description || plan.description}
      </p>

      <ul className="mt-3.5 flex-1 space-y-1.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[12px] text-slate-300">
            <Check
              className="mt-0.5 h-3 w-3 flex-shrink-0"
              style={{ color: ACCENT }}
              strokeWidth={3}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onToggleCart(plan.id)}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors motion-safe:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={
          inCart
            ? { backgroundColor: ACCENT, color: "#000" }
            : { backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" }
        }
      >
        {inCart ? (
          <>
            <Check className="h-3 w-3" strokeWidth={3} />
            Added
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" strokeWidth={3} />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}

function CheckoutModal({ open, onClose, items, total, onConfirm, confirmed }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-8"
        style={{
          backgroundColor: CARD_BG,
          borderColor: "rgba(255,255,255,0.08)",
          fontFamily: "'Work Sans', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>

        {!confirmed ? (
          <>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: ACCENT }}
            >
              Checkout
            </span>
            <h3
              className="mt-2 text-2xl font-bold uppercase text-white"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Your plans
            </h3>

            <ul className="mt-6 divide-y divide-white/10">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3 text-sm text-white"
                >
                  <span className="font-semibold uppercase tracking-wide">
                    {p.name}
                  </span>
                  <span
                    style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ${p.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-bold uppercase tracking-wide text-white">
                Total
              </span>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ${total}
              </span>
            </div>

            <button
              onClick={onConfirm}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-wide text-black transition-colors"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              Confirm & Start Training
            </button>
          </>
        ) : (
          <div className="py-6 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${ACCENT}20`, border: `2px solid ${ACCENT}` }}
            >
              <Check className="h-7 w-7" style={{ color: ACCENT }} strokeWidth={3} />
            </div>
            <h3
              className="mt-5 text-2xl font-bold uppercase text-white"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              You're in.
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Welcome to Forge Fitness. A coach will reach out within 24 hours
              to get your first session on the calendar.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/5"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrainingPlans() {
  const [annual, setAnnual] = useState(false);
  const [cart, setCart] = useState([]);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

      useEffect(() => {
    const fetchTrainingPlans = async () => {
      const { data, error } = await supabase
        .from("training_plans")
        .select("*");

      if (error) {
        console.error("Error fetching training plans:", error);
      }

      console.log("Training plans:", data);
      setTrainingPlans(data);
    };

    fetchTrainingPlans();
  }, []);

  const updatedPlans = plans.map((plan) => {
    const monthlyData = trainingPlans.find(
      (p) => p.title === `${plan.name} Monthly`
    );

    const annualData = trainingPlans.find(
      (p) => p.title === `${plan.name} Annual`
    );

    return {
      ...plan,
      monthlyData,
      annualData,
    };
  });

  const toggleCart = (id) => {
  setCart((prev) =>
    prev.includes(id)
      ? prev.filter((p) => p !== id)
      : [...prev, id]
  );
};

  

  const cartItems = useMemo(
    () =>
      plans
        .filter((p) => cart.includes(p.id))
        .map((p) => ({ id: p.id, name: p.name, price: annual ? p.annual : p.monthly })),
    [cart, annual]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, p) => sum + p.price, 0),
    [cartItems]
  );

  const openCheckout = () => {
    if (cartItems.length === 0) return;
    setConfirmed(false);
    setCheckoutOpen(true);
  };

  const handleConfirm = async () => {
  const enrollments = cart
    .map((id) => {
      const plan = updatedPlans.find((p) => p.id === id);

      if (!plan) return null;

      const selectedPlan = annual
        ? plan.annualData
        : plan.monthlyData;

      if (!selectedPlan) return null;

      return {
        course_id: selectedPlan.course_id,
        enrolled_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("enrollments")
    .insert(
      enrollments.map((enrollment) => ({
        ...enrollment,
        user_id: user?.id,
      }))
    );

  if (error) {
    console.error("Error saving enrollments:", error);
    return;
  }

  setConfirmed(true);
};

  const closeCheckout = () => {
    setCheckoutOpen(false);
    if (confirmed) {
      setCart([]);
    }
  };

  return (
    <section style={{ backgroundColor: PAGE_BG }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
      `}</style>

      {/* thin heat accent bar */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(to right, #000, ${ACCENT}, #FCD34D)`,
        }}
      />

      <div className="px-6 py-12 sm:px-8">
        <div
          className="mx-auto max-w-6xl"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          {/* Header */}
          <div className="flex flex-col items-center justify-between gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
            <div className="max-w-xl text-center lg:text-left">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: ACCENT }}
              >
                <Flame className="h-3.5 w-3.5" strokeWidth={2.5} />
                Training Plans
              </span>
              <h2
                className="mt-2 text-3xl font-bold uppercase text-white sm:text-4xl"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Pick your heat.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Every plan starts with the same raw material — you. How far we
                forge it from here is up to how much heat you're ready for.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5 lg:items-end">
              {/* Billing toggle — pill tab style, matches nav */}
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setAnnual(false)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  style={
                    !annual
                      ? { backgroundColor: ACCENT, color: "#000" }
                      : { color: "#94A3B8" }
                  }
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  style={
                    annual
                      ? { backgroundColor: ACCENT, color: "#000" }
                      : { color: "#94A3B8" }
                  }
                >
                  Annual
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={
                      annual
                        ? { backgroundColor: "#000", color: ACCENT }
                        : { backgroundColor: "rgba(255,255,255,0.1)", color: ACCENT }
                    }
                  >
                    Save 15%
                  </span>
                </button>
              </div>

              {/* Cart summary + checkout */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  <span className="text-xs font-semibold text-white">
                    {cart.length} {cart.length === 1 ? "plan" : "plans"}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ${cartTotal}
                  </span>
                </div>

                <button
                  onClick={openCheckout}
                  disabled={cartItems.length === 0}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
                  style={
                    cartItems.length === 0
                      ? { color: "#475569", backgroundColor: "rgba(255,255,255,0.03)", cursor: "not-allowed" }
                      : { backgroundColor: ACCENT, color: "#000" }
                  }
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>

          {/* Cards — all four fit on one row, no scrolling */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {updatedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                annual={annual}
                inCart={cart.includes(plan.id)}
                onToggleCart={toggleCart}
              />
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-slate-500">
            Every plan includes a 2-week form check and a no-fine-print
            cancellation policy. Not sure which heat is right for you?{" "}
            <a
              href="#"
              className="font-semibold underline-offset-4 hover:underline"
              style={{ color: ACCENT }}
            >
              Talk to a coach first.
            </a>
          </p>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={closeCheckout}
        items={cartItems}
        total={cartTotal}
        onConfirm={handleConfirm}
        confirmed={confirmed}
      />
    </section>
  );
}
