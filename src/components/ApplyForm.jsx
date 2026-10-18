import { useEffect, useRef, useState } from "react";
import { Arrow } from "./shared.jsx";
import Celebrate from "./Celebrate.jsx";

// Google Forms connection: the form's ID and each question's entry ID.
// Edit form: https://docs.google.com/forms/d/1Zls_FVJXey_zur2IzJVxHjBi4TosuagJAjMfF_k9gQ8/edit
// Responses: https://docs.google.com/spreadsheets/d/1L8fEDWYCo0Pvfuv42vGInVGlsihPkKkxhRkAphdU0xY/edit
// Setting FORM_ID back to "PASTE_FORM_ID" switches to preview mode (nothing sent; payload logged to the console).
const CONFIG = {
  // From the form's public link: docs.google.com/forms/d/e/<FORM_ID>/viewform
  FORM_ID: "1FAIpQLSdJtbDwelVI1uZZoRIoOV_TZK4YksgsZOr5e_3zei6oVAw9jA",
  ENTRIES: {
    name: "entry.194846375",
    email: "entry.2145226167",
    major: "entry.1328027124",
    year: "entry.80294315",
    stage: "entry.528057865",
    idea: "entry.721148959",
    problem: "entry.916059661",
    team: "entry.430157249",
    skills: "entry.1280860091",
    why: "entry.130054506",
    hours: "entry.932602707",
    heard: "entry.910309575",
    anything: "entry.1648556003",
    agree: "entry.56722154",
  },
};
const PREVIEW = CONFIG.FORM_ID === "PASTE_FORM_ID";

// Option text is sent to Google Forms exactly as written here; it must match the form's options.
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate student"];
const STAGES = [
  { value: "Just curious", desc: "I want to learn how startups work." },
  { value: "I have an idea", desc: "Something I keep thinking about." },
  { value: "I'm building it", desc: "Prototype, MVP or early work." },
  { value: "It's already live", desc: "It has users, customers or sales." },
];
const TEAMS = ["Solo", "I have a team", "Looking for teammates"];
const SKILLS = [
  "Coding / tech",
  "Design",
  "Business / finance",
  "Marketing / social media",
  "Sales / pitching",
  "Writing / content",
  "Research",
  "Still figuring it out",
];
const HOURS = ["1-2 hours", "3-5 hours", "6+ hours"];
const HEARD = [
  "Instagram",
  "Phoenix Connect",
  "A friend",
  "A class or professor",
  "Campus event",
  "Other",
];

const LABELS = {
  name: "Full name",
  email: "UWGB email",
  major: "Major",
  year: "Year",
  stage: "Where are you right now?",
  idea: "Your idea in one sentence",
  problem: "What problem does it solve, and for whom?",
  team: "Team",
  skills: "Your skills",
  why: "Why do you want to join the Foundry Cohort?",
  hours: "How much time can you give each week?",
  heard: "How did you hear about Phoenix Foundry?",
  anything: "Anything else we should know?",
  agree:
    "I'm a current UW-Green Bay student, and I'd like Phoenix Foundry to contact me about the cohort.",
};
const MAX = { idea: 160, problem: 800, why: 800, anything: 600 };

const STEPS = [
  {
    title: "About you",
    intro: "The basics, so we know who's applying.",
    fields: ["name", "email", "major", "year"],
  },
  {
    title: "Your idea",
    intro: "No idea yet? That's okay. Plenty of founders start with curiosity.",
    fields: ["stage", "idea", "problem", "team"],
  },
  {
    title: "What you bring",
    intro:
      "Every cohort needs a mix of builders, designers, sellers and storytellers.",
    fields: ["skills", "why", "hours"],
  },
  {
    title: "Almost there",
    intro: "Two quick questions, then check your answers.",
    fields: ["heard", "anything", "agree"],
  },
];
const SUMMARY = [
  "name",
  "email",
  "major",
  "year",
  "stage",
  "idea",
  "problem",
  "team",
  "skills",
  "why",
  "hours",
  "heard",
  "anything",
];

const EMPTY = {
  name: "",
  email: "",
  major: "",
  year: "",
  stage: "",
  idea: "",
  problem: "",
  team: "",
  skills: [],
  why: "",
  hours: "",
  heard: "",
  anything: "",
  agree: false,
};

/** Error message for one field, or '' if it's fine. Optional fields only check their length. */
function check(key, v) {
  if (MAX[key] && v.length > MAX[key])
    return `Please keep this under ${MAX[key]} characters.`;
  switch (key) {
    case "name":
      return v.trim() ? "" : "Please enter your full name.";
    case "email":
      if (!v.trim()) return "Please enter your UWGB email.";
      return /^[^\s@]+@uwgb\.edu$/i.test(v.trim())
        ? ""
        : "Please use your @uwgb.edu email.";
    case "major":
      return v.trim() ? "" : "Please enter your major.";
    case "year":
      return v ? "" : "Please choose your year.";
    case "stage":
      return v ? "" : "Please choose where you are right now.";
    case "team":
      return v ? "" : "Please choose one.";
    case "skills":
      return v.length ? "" : "Please pick at least one.";
    case "why":
      return v.trim() ? "" : "Please tell us why you want to join.";
    case "hours":
      return v ? "" : "Please choose how much time you can give.";
    case "agree":
      return v ? "" : "Please confirm this to send your application.";
    default:
      return "";
  }
}

/** The name/value pairs Google Forms expects: one per answer, one per selected skill, empty optionals skipped. */
function toPairs(v) {
  const pairs = [];
  for (const key of Object.keys(CONFIG.ENTRIES)) {
    const id = CONFIG.ENTRIES[key];
    if (key === "skills") v.skills.forEach((s) => pairs.push([id, s]));
    else if (key === "agree") {
      if (v.agree) pairs.push([id, "Yes"]);
    } else if (String(v[key]).trim()) pairs.push([id, String(v[key]).trim()]);
  }
  return pairs;
}

/* ---------- Field pieces ---------- */

function Req() {
  return (
    <span className="req" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function Message({ id, error, hint }) {
  if (error) {
    return (
      <p className="field-error" id={`e-${id}`}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v5M10 14h.01" />
        </svg>
        {error}
      </p>
    );
  }
  return hint ? (
    <p className="field-hint" id={`h-${id}`}>
      {hint}
    </p>
  ) : null;
}

function Counter({ value, max }) {
  return (
    <span
      className={`field-count${value.length > max * 0.9 ? " is-near" : ""}`}
      aria-hidden="true"
    >
      {value.length}/{max}
    </span>
  );
}

function TextField({
  id,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  hint,
  autoComplete,
  multiline,
}) {
  const max = MAX[id];
  const describedBy =
    [error ? `e-${id}` : hint ? `h-${id}` : null].filter(Boolean).join(" ") ||
    undefined;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>
        {LABELS[id]}
        {required && <Req />}
      </label>
      <Tag
        id={`f-${id}`}
        name={id}
        type={multiline ? undefined : type}
        rows={multiline ? 5 : undefined}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={max}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(id, e.target.value)}
      />
      {(error || hint || max) && (
        <div className="field-foot">
          <Message id={id} error={error} hint={hint} />
          {max && <Counter value={value} max={max} />}
        </div>
      )}
    </div>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
  error,
  required,
  placeholder,
}) {
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>
        {LABELS[id]}
        {required && <Req />}
      </label>
      <select
        id={`f-${id}`}
        name={id}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `e-${id}` : undefined}
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Message id={id} error={error} />
    </div>
  );
}

/** Radio group shown as selectable cards (stage) or pill chips (team). */
function Choice({
  id,
  value,
  onChange,
  options,
  error,
  required,
  variant = "chips",
  multiple = false,
  legendNote,
}) {
  const selected = (o) => (multiple ? value.includes(o) : value === o);
  const toggle = (o) => {
    if (!multiple) return onChange(id, o);
    onChange(
      id,
      value.includes(o) ? value.filter((x) => x !== o) : [...value, o],
    );
  };
  return (
    <fieldset
      className="field"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `e-${id}` : undefined}
    >
      <legend>
        {LABELS[id]}
        {required && <Req />}
        {legendNote && <span className="legend-note"> {legendNote}</span>}
      </legend>
      <div className={variant === "cards" ? "opt-cards" : "opt-chips"}>
        {options.map((opt, i) => {
          const o = typeof opt === "string" ? opt : opt.value;
          return (
            <label
              key={o}
              className={`${variant === "cards" ? "opt-card" : "opt-chip"}${selected(o) ? " is-on" : ""}`}
            >
              <input
                id={i === 0 ? `f-${id}` : undefined}
                type={multiple ? "checkbox" : "radio"}
                name={id}
                value={o}
                checked={selected(o)}
                onChange={() => toggle(o)}
              />
              {variant === "cards" ? (
                <>
                  <span className="opt-title">{o}</span>
                  <span className="opt-desc">{opt.desc}</span>
                </>
              ) : (
                <span>{o}</span>
              )}
            </label>
          );
        })}
      </div>
      <Message id={id} error={error} />
    </fieldset>
  );
}

/* ---------- The form ---------- */

export default function ApplyForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [party, setParty] = useState(true); // the celebration plays once when the thank-you screen appears
  const [landed, setLanded] = useState(false); // the phoenix has landed in the circle: draw the check
  const iconRef = useRef(null);
  const cardRef = useRef(null);
  const headRef = useRef(null);
  const moved = useRef(false);

  const set = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    // Clear a field's error as soon as it's fixed
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: check(key, v) }));
  };

  // After moving between steps (or finishing), bring the card's heading into view and focus it
  useEffect(() => {
    if (!moved.current) return;
    const top = cardRef.current.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) {
      const navH = document.querySelector(".nav")?.offsetHeight || 0;
      window.scrollTo({
        top: window.scrollY + top - navH - 16,
        behavior: "smooth",
      });
    }
    headRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  /** Validate the current step; show errors and focus the first invalid field. */
  const validStep = () => {
    const found = {};
    for (const key of STEPS[step].fields) {
      const msg = check(key, values[key]);
      if (msg) found[key] = msg;
    }
    setErrors(found);
    const first = STEPS[step].fields.find((k) => found[k]);
    if (first) document.getElementById(`f-${first}`)?.focus();
    return !first;
  };

  const next = () => {
    if (!validStep()) return;
    moved.current = true;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    setErrors({});
    moved.current = true;
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validStep() || status === "sending") return;
    const pairs = toPairs(values);
    setStatus("sending");
    moved.current = true;
    if (PREVIEW) {
      // eslint-disable-next-line no-console
      console.info(
        "[Preview] Google Forms payload (not sent):\n" +
          pairs.map(([k, v]) => `${k} = ${v}`).join("\n"),
      );
      setTimeout(() => setStatus("done"), 600);
      return;
    }
    try {
      await fetch(
        `https://docs.google.com/forms/d/e/${CONFIG.FORM_ID}/formResponse`,
        {
          method: "POST",
          mode: "no-cors", // Google Forms gives no readable response; a resolved request counts as sent
          body: new URLSearchParams(pairs),
        },
      );
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  // Enter moves to the next step instead of submitting (except inside text areas and on buttons)
  const onKeyDown = (e) => {
    if (e.key !== "Enter" || ["TEXTAREA", "BUTTON"].includes(e.target.tagName))
      return;
    e.preventDefault();
    if (step < STEPS.length - 1) next();
  };

  if (status === "done") {
    return (
      <div className="apply-card" ref={cardRef}>
        {party && (
          <Celebrate
            target={iconRef}
            onLand={() => setLanded(true)}
            onDone={() => setParty(false)}
          />
        )}
        <div className="thanks" role="status">
          <span
            className={`thanks-icon${landed ? " is-landed" : ""}`}
            ref={iconRef}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 tabIndex={-1} ref={headRef}>
            You're in the queue.
          </h2>
          <p>
            Thanks for applying to the Foundry Cohort. We'll reach out to your
            UWGB email soon with next steps. Until then, keep building.
          </p>
          {PREVIEW && (
            <p className="preview-note">
              Preview mode: not connected to Google Forms yet. The answers were
              logged to the console.
            </p>
          )}
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const err = (k) => errors[k];

  return (
    <div className="apply-card" ref={cardRef}>
      <div
        className="apply-progress"
        role="progressbar"
        aria-label="Application progress"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${s.title}`}
      >
        {STEPS.map((x, i) => (
          <span key={x.title} className={i <= step ? "is-on" : ""} />
        ))}
      </div>

      <form noValidate onSubmit={submit} onKeyDown={onKeyDown}>
        <div className="apply-step" key={step}>
          <p className="apply-count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 tabIndex={-1} ref={headRef}>
            {s.title}
          </h2>
          <p className="apply-intro">{s.intro}</p>

          {step === 0 && (
            <>
              <TextField
                id="name"
                value={values.name}
                onChange={set}
                error={err("name")}
                required
                autoComplete="name"
              />
              <TextField
                id="email"
                type="email"
                value={values.email}
                onChange={set}
                error={err("email")}
                required
                autoComplete="email"
                placeholder="you@uwgb.edu"
              />
              <div className="field-row">
                <TextField
                  id="major"
                  value={values.major}
                  onChange={set}
                  error={err("major")}
                  required
                  placeholder="e.g. Information Science"
                />
                <SelectField
                  id="year"
                  value={values.year}
                  onChange={set}
                  options={YEARS}
                  error={err("year")}
                  required
                  placeholder="Choose your year"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Choice
                id="stage"
                variant="cards"
                options={STAGES}
                value={values.stage}
                onChange={set}
                error={err("stage")}
                required
              />
              <TextField
                id="idea"
                value={values.idea}
                onChange={set}
                error={err("idea")}
                hint="Optional if you're just curious."
              />
              <TextField
                id="problem"
                multiline
                value={values.problem}
                onChange={set}
                error={err("problem")}
              />
              <Choice
                id="team"
                options={TEAMS}
                value={values.team}
                onChange={set}
                error={err("team")}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <Choice
                id="skills"
                multiple
                options={SKILLS}
                value={values.skills}
                onChange={set}
                error={err("skills")}
                required
                legendNote="(pick all that apply)"
              />
              <TextField
                id="why"
                multiline
                value={values.why}
                onChange={set}
                error={err("why")}
                required
              />
              <SelectField
                id="hours"
                value={values.hours}
                onChange={set}
                options={HOURS}
                error={err("hours")}
                required
                placeholder="Choose one"
              />
            </>
          )}

          {step === 3 && (
            <>
              <SelectField
                id="heard"
                value={values.heard}
                onChange={set}
                options={HEARD}
                error={err("heard")}
                placeholder="Choose one (optional)"
              />
              <TextField
                id="anything"
                multiline
                value={values.anything}
                onChange={set}
                error={err("anything")}
              />

              <section
                className="apply-summary"
                aria-labelledby="summary-title"
              >
                <h3 id="summary-title">Your answers</h3>
                <dl>
                  {SUMMARY.map((k) => {
                    const v = Array.isArray(values[k])
                      ? values[k].join(", ")
                      : values[k].trim();
                    return (
                      <div key={k}>
                        <dt>{LABELS[k]}</dt>
                        <dd className={v ? "" : "is-empty"}>
                          {v || "Not answered"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>

              <div
                className={`field apply-agree${values.agree ? " is-on" : ""}`}
              >
                <label>
                  <input
                    id="f-agree"
                    type="checkbox"
                    name="agree"
                    value="Yes"
                    checked={values.agree}
                    aria-required="true"
                    aria-invalid={err("agree") ? true : undefined}
                    aria-describedby={err("agree") ? "e-agree" : undefined}
                    onChange={(e) => set("agree", e.target.checked)}
                  />
                  <span>
                    {LABELS.agree}
                    <Req />
                  </span>
                </label>
                <Message id="agree" error={err("agree")} />
              </div>
            </>
          )}
        </div>

        {status === "error" && (
          <p className="form-error" role="alert">
            Something went wrong — please try again.
          </p>
        )}
        {PREVIEW && (
          <p className="preview-note">
            Preview mode: not connected to Google Forms yet
          </p>
        )}

        <div className="apply-actions">
          <button
            type="button"
            className="text-btn"
            onClick={back}
            hidden={step === 0}
          >
            Back
          </button>
          {last ? (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
              aria-busy={status === "sending" || undefined}
            >
              {status === "sending" ? "Sending…" : "Submit application"}{" "}
              <Arrow />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue <Arrow />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
