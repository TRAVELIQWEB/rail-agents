"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, RotateCcw, Save, Settings2, X } from "lucide-react";

// Serializable metadata supplied by the admin API; no server registry or database imports.
interface Variable {
  key: string;
  label: string;
  description: string;
  inputType: "text" | "tel" | "phone" | "email" | "url" | "textarea" | "boolean";
  validation: { allowEmpty: boolean; maxLength: number; message: string | null };
  value: string | null;
  desc: string;
  status: boolean | null;
  configured: boolean;
  statusControlledBy?: string | null;
}

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#343b48] px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-50";
const inputClass = "w-full min-w-0 rounded-xl border border-[#343b48] bg-[#10141b] px-3.5 py-3 text-sm text-zinc-100 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15 disabled:opacity-60";

function Status({ variable }: { variable: Variable }) {
  const label = !variable.configured ? "Not Configured" : variable.status ? "Active" : "Inactive";
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs font-medium text-zinc-300"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${variable.configured && variable.status ? "bg-orange-400" : "bg-zinc-500"}`} />{label}</span>;
}

function CurrentValue({ variable }: { variable: Variable }) {
  return <span className="whitespace-pre-wrap text-sm text-zinc-300 [overflow-wrap:anywhere]">{!variable.configured ? "Not Configured" : variable.value === "" ? "(Empty)" : variable.value}</span>;
}

function VariableEditor({ variable, returnFocus, onClose, onSaved, onUnauthorized }: {
  variable: Variable;
  returnFocus: HTMLElement | null;
  onClose: () => void;
  onSaved: (variable: Variable, variables?: Variable[]) => void;
  onUnauthorized: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const valueInput = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [value, setValue] = useState(variable.value ?? "");
  const [desc, setDesc] = useState(variable.desc);
  const [status, setStatus] = useState(variable.status ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [valueError, setValueError] = useState("");
  const [descError, setDescError] = useState("");
  const dirty = value !== (variable.value ?? "") || desc !== variable.desc || status !== (variable.status ?? false);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    valueInput.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  function dismiss() {
    if (saving) return;
    if (!dirty || window.confirm("Discard your unsaved changes?")) onClose();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    const invalidValue = value.length > variable.validation.maxLength
      ? `Use ${variable.validation.maxLength} characters or fewer.`
      : !variable.validation.allowEmpty && value === ""
        ? "Enter a value."
        : valueInput.current && !valueInput.current.validity.valid
          ? valueInput.current.validationMessage
          : "";
    const invalidDesc = desc.length > 1000 ? "Use 1,000 characters or fewer." : "";
    setValueError(invalidValue);
    setDescError(invalidDesc);
    if (invalidValue || invalidDesc) {
      if (invalidValue) valueInput.current?.focus();
      else dialog.current?.querySelector<HTMLTextAreaElement>("#variable-desc")?.focus();
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/global-variables", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: variable.key, value, desc, status }),
      });
      if (response.status === 401) { onUnauthorized(); return; }
      const data = await response.json();
      if (!response.ok || !data.success || !data.variable) {
        const message = data.error || "Unable to save this variable. Please try again.";
        if (response.status === 400) {
          setValueError(message);
          valueInput.current?.focus();
        } else setError(message);
        return;
      }
      onSaved(data.variable, data.variables);
    } catch {
      setError("Unable to reach the server. Your changes are still here. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputProps = {
    id: "variable-value",
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setValue(event.target.value); setValueError(""); setError(""); },
    required: !variable.validation.allowEmpty,
    maxLength: variable.validation.maxLength,
    "aria-invalid": Boolean(valueError),
    "aria-describedby": "variable-value-help variable-value-error",
    className: inputClass,
  };

  return (
    <dialog ref={dialog} aria-labelledby="variable-editor-title" aria-describedby="variable-editor-description" onCancel={(event) => { event.preventDefault(); dismiss(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-[#343b48] bg-[#161b23] p-0 text-zinc-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-6">
        <div className="min-w-0"><h2 id="variable-editor-title" className="text-lg font-bold">Edit {variable.label}</h2><p id="variable-editor-description" className="mt-1 text-sm leading-relaxed text-zinc-400">Changes are saved only when you select Save Changes.</p></div>
        <button type="button" onClick={dismiss} disabled={saving} aria-label="Close variable editor" className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-orange-400 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} noValidate aria-busy={saving} className="p-4 sm:p-6">
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/25 bg-red-400/5 p-3 text-sm text-red-300">{error}</p>}
        <fieldset disabled={saving} className="min-w-0 space-y-5">
          <div><label htmlFor="variable-key" className="mb-2 block text-sm font-semibold">Variable key</label><input id="variable-key" readOnly value={variable.key} className={`${inputClass} font-mono text-xs text-zinc-400`} /></div>
          <div>
            <label htmlFor="variable-value" className="mb-2 block text-sm font-semibold">{variable.label}</label>
            {variable.inputType === "textarea" ? (
              <textarea {...inputProps} ref={(element) => { valueInput.current = element; }} rows={4} className={`${inputClass} resize-y`} />
            ) : variable.inputType === "boolean" ? (
              <input id="variable-value" ref={(element) => { valueInput.current = element; }} type="checkbox" role="switch" checked={value === "true"} onChange={(event) => { setValue(String(event.target.checked)); setValueError(""); }} className="h-5 w-5 accent-orange-500" aria-describedby="variable-value-help variable-value-error" />
            ) : (
              <input {...inputProps} ref={(element) => { valueInput.current = element; }} type={variable.inputType === "phone" ? "tel" : variable.inputType} />
            )}
            <p id="variable-value-help" className="mt-2 text-xs leading-relaxed text-zinc-400">{variable.validation.message || variable.description} Maximum {variable.validation.maxLength} characters.{variable.validation.allowEmpty ? " An empty value is allowed." : ""}</p>
            <p id="variable-value-error" aria-live="polite" className="mt-1 text-sm text-red-300">{valueError}</p>
          </div>
          <div><label htmlFor="variable-desc" className="mb-2 block text-sm font-semibold">Description</label><textarea id="variable-desc" value={desc} onChange={(event) => { setDesc(event.target.value); setDescError(""); }} rows={3} maxLength={1000} aria-invalid={Boolean(descError)} aria-describedby="variable-desc-error" className={`${inputClass} resize-y`} /><p id="variable-desc-error" aria-live="polite" className="mt-1 text-sm text-red-300">{descError}</p></div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 p-4"><span><span className="block text-sm font-semibold">Active</span><span className="mt-1 block text-xs text-zinc-400">{variable.statusControlledBy ? `Visibility follows ${variable.statusControlledBy}.` : "Inactive values stay saved but are unavailable to website helpers."}</span></span><input type="checkbox" role="switch" checked={status} disabled={Boolean(variable.statusControlledBy)} onChange={(event) => setStatus(event.target.checked)} className="h-5 w-5 shrink-0 accent-orange-500" /></label>
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={dismiss} className={buttonClass}>Cancel</button>
            <button type="submit" className={`${buttonClass} border-orange-500 bg-orange-500 text-white hover:bg-orange-600`}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}

export function GlobalVariablesManager() {
  const router = useRouter();
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<{ variable: Variable; trigger: HTMLElement } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/global-variables", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { router.replace("/admin/login"); return; }
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.variables)) throw new Error(data.error || "Unable to load global variables.");
        if (!controller.signal.aborted) setVariables(data.variables);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load global variables. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt, router]);

  function edit(variable: Variable, element: HTMLElement) {
    setSuccess("");
    setEditing({ variable, trigger: element });
  }
  const editButton = (variable: Variable) => <button type="button" onClick={(event) => edit(variable, event.currentTarget)} aria-label={`Edit ${variable.label}`} className={`${buttonClass} px-3 text-xs`}><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Edit</button>;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex items-start gap-3"><span className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400"><Settings2 className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight text-zinc-100">Global Variables</h1><p className="mt-2 text-sm leading-relaxed text-zinc-400">Manage predefined website values. Missing variables stay unconfigured until you save them.</p></div></header>
      {success && <p role="status" className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-4 text-sm text-zinc-200">{success}</p>}
      {error && <div role="alert" className="rounded-xl border border-red-400/25 bg-red-400/5 p-4"><p className="text-sm text-red-300">{error}</p><button type="button" onClick={() => { setError(""); setLoading(true); setAttempt((value) => value + 1); }} className={`${buttonClass} mt-3`}><RotateCcw className="h-4 w-4" aria-hidden="true" />Try again</button></div>}
      {loading ? (
        <div role="status" aria-label="Loading global variables" className="space-y-3"><span className="sr-only">Loading global variables...</span>{[0, 1, 2].map((row) => <div key={row} aria-hidden="true" className="h-28 animate-pulse rounded-2xl border border-white/10 bg-[#161b23] motion-reduce:animate-none"><div className="m-5 h-3 w-1/3 rounded bg-white/10" /><div className="m-5 h-3 w-1/2 rounded bg-white/5" /></div>)}</div>
      ) : !error && variables.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#161b23] p-8 text-center"><h2 className="font-semibold text-zinc-200">No global variables available</h2><p className="mt-2 text-sm text-zinc-400">No variable definitions were returned by the server.</p></div>
      ) : !error && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#161b23] xl:block">
            <table className="w-full table-fixed text-left"><caption className="sr-only">Global variables and their current configuration</caption><thead className="border-b border-white/10 bg-white/[0.025] text-xs text-zinc-400"><tr><th scope="col" className="w-[25%] p-4 font-semibold">Variable key</th><th scope="col" className="w-[25%] p-4 font-semibold">Description</th><th scope="col" className="w-[22%] p-4 font-semibold">Current value</th><th scope="col" className="w-[16%] p-4 font-semibold">Status</th><th scope="col" className="w-[12%] p-4 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-white/10">{variables.map((variable) => <tr key={variable.key} className="align-top"><th scope="row" className="p-4"><span className="block font-mono text-xs font-medium text-zinc-100 [overflow-wrap:anywhere]">{variable.key}</span><span className="mt-1.5 block text-xs font-normal text-zinc-400">{variable.label}</span></th><td className="p-4 text-sm leading-relaxed text-zinc-400 [overflow-wrap:anywhere]">{variable.desc || "No description."}</td><td className="p-4"><CurrentValue variable={variable} /></td><td className="p-4"><Status variable={variable} /></td><td className="p-4 text-right">{editButton(variable)}</td></tr>)}</tbody></table>
          </div>
          <div className="grid min-w-0 gap-4 xl:hidden">{variables.map((variable) => <article key={variable.key} className="min-w-0 rounded-2xl border border-white/10 bg-[#161b23] p-4"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Status variable={variable} />{editButton(variable)}</div><h2 className="font-mono text-xs font-medium text-zinc-100 [overflow-wrap:anywhere]">{variable.key}</h2><p className="mt-1.5 text-sm font-semibold text-zinc-200">{variable.label}</p><dl className="mt-4 space-y-4"><div><dt className="mb-1 text-xs text-zinc-500">Description</dt><dd className="text-sm leading-relaxed text-zinc-400 [overflow-wrap:anywhere]">{variable.desc || "No description."}</dd></div><div><dt className="mb-1 text-xs text-zinc-500">Current value</dt><dd><CurrentValue variable={variable} /></dd></div></dl></article>)}</div>
        </>
      )}
      {editing && <VariableEditor key={editing.variable.key} variable={editing.variable} returnFocus={editing.trigger} onClose={() => setEditing(null)} onUnauthorized={() => { setEditing(null); setVariables([]); router.replace("/admin/login"); }} onSaved={(variable, variables) => {
        // Refresh related rows too when a canonical status changes.
        setVariables((current) => variables ?? current.map((item) => item.key === variable.key ? variable : item));
        setEditing(null);
        setSuccess(`${variable.label} saved successfully.`);
      }} />}
    </div>
  );
}
