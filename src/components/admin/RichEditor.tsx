"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Youtube from "@tiptap/extension-youtube";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Code2,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Video,
  Minus, Undo, Redo, RemoveFormatting, Highlighter, Copy, Check, RotateCcw,
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  savedValue?: string;
}

type EditorMode = "visual" | "html" | "split";

const ALLOWED_HTML_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "del", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "table", "thead", "tbody", "tr", "th", "td",
  "hr", "figure", "figcaption", "mark", "span", "div", "iframe",
]);
const VOID_HTML_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const BLOCKED_HTML_TAGS = new Set(["script", "style", "object", "embed", "form", "input", "button", "textarea", "select"]);
const ALLOWED_HTML_ATTRIBUTES = new Set([
  "href", "target", "rel", "title", "src", "alt", "width", "height", "loading", "colspan", "rowspan", "class", "style", "allowfullscreen", "allow", "frameborder",
]);

function sanitizeSourceForEditor(source: string) {
  const template = document.createElement("template");
  template.innerHTML = source;

  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    const tag = element.tagName.toLowerCase();
    if (BLOCKED_HTML_TAGS.has(tag)) {
      element.remove();
      continue;
    }
    if (!ALLOWED_HTML_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const isAllowedImageData = tag === "img" && name === "src" && /^data:image\/(?:png|gif|jpe?g|webp);base64,/i.test(value);
      const unsafeUrl = ["href", "src"].includes(name) && !isAllowedImageData && /^[a-z][a-z\d+.-]*:/i.test(value) && !/^(?:https?:|mailto:|tel:)/i.test(value);
      const unsafeStyle = name === "style" && /(?:url\s*\(|expression\s*\(|@import)/i.test(value);
      if (name.startsWith("on") || name === "srcdoc" || !ALLOWED_HTML_ATTRIBUTES.has(name) || unsafeUrl || unsafeStyle) {
        element.removeAttribute(attribute.name);
      }
    }

    if (tag === "a" && element.getAttribute("target") === "_blank") {
      element.setAttribute("rel", "noopener noreferrer");
    }
  }

  return template.innerHTML;
}

function validateHtmlSource(source: string) {
  if (/<[^>]*$/.test(source.trim())) return "An HTML tag is incomplete. Finish or remove it before applying.";
  if ((source.match(/<!--/g)?.length ?? 0) > (source.match(/-->/g)?.length ?? 0)) return "An HTML comment is not closed.";

  const optionalEndTags = new Set(["p", "li", "dt", "dd", "rt", "rp", "optgroup", "option", "thead", "tbody", "tfoot", "tr", "td", "th"]);
  const voidTags = VOID_HTML_TAGS;
  const stack: string[] = [];
  const tokens = source.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>/g) ?? [];
  for (const token of tokens) {
    if (/^<!--|^<!/i.test(token)) continue;
    const closingTag = token.match(/^<\/\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
    const openingTag = token.match(/^<\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
    if (closingTag) {
      const index = stack.lastIndexOf(closingTag);
      if (index < 0) {
        if (!optionalEndTags.has(closingTag)) return `Unexpected closing tag </${closingTag}>.`;
        continue;
      }
      if (stack.slice(index + 1).some((tag) => !optionalEndTags.has(tag))) return `Close the nested <${stack.at(-1)}> tag before </${closingTag}>.`;
      stack.splice(index);
      continue;
    }
    if (!openingTag || voidTags.has(openingTag) || /\/>$/.test(token)) continue;
    const impliedClose = new Set(["p", "li", "dt", "dd", "option", "tr", "td", "th", "tbody", "thead", "tfoot"]);
    if (impliedClose.has(openingTag) && stack.at(-1) === openingTag) stack.pop();
    stack.push(openingTag);
  }
  const unclosedTag = stack.find((tag) => !optionalEndTags.has(tag));
  if (unclosedTag) return `The <${unclosedTag}> tag is not closed.`;

  const parsed = new DOMParser().parseFromString(source, "text/html");
  if (parsed.querySelector("parsererror")) return "The HTML could not be parsed. Check the markup and try again.";
  return null;
}

function formatHtmlSource(source: string) {
  const lines = source.replace(/>([^\S\r\n]*)(<)/g, (_match, whitespace: string, nextTag: string) => `>${whitespace || "\n"}${nextTag}`).split("\n");
  let depth = 0;
  return lines.map((line) => {
    const text = line.trim();
    if (!text) return "";
    const tags = text.match(/<[^>]+>/g) ?? [];
    const closingCount = tags.filter((tag) => /^<\//.test(tag)).length;
    const openingCount = tags.filter((tag) => {
      if (/^<\//.test(tag) || /^<!/.test(tag) || /^<\?/.test(tag) || /\/>$/.test(tag)) return false;
      const name = tag.match(/^<\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
      return !!name && !VOID_HTML_TAGS.has(name);
    }).length;
    const leadingClose = /^<\//.test(text) ? 1 : 0;
    const formatted = `${"  ".repeat(Math.max(0, depth - leadingClose))}${text}`;
    depth = Math.max(0, depth + openingCount - closingCount);
    return formatted;
  }).join("\n");
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-slate-200" />;
}

export function RichEditor({ value, onChange, placeholder = "Start writing your blog post...", savedValue = "" }: RichEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [source, setSource] = useState(value);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const htmlExtensions = useMemo(() => [html()], []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        link: false,
        underline: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      HorizontalRule,
      Youtube.configure({
        inline: false,
        width: 640,
        height: 360,
        allowFullscreen: true,
      }),
    ],
    content: value,
    immediatelyRender: true,
    onUpdate({ editor }) {
      const htmlContent = editor.getHTML();
      setSource(htmlContent);
      setSourceDirty(false);
      setSourceError(null);
      setSourceMessage(null);
      onChange(htmlContent);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[400px] focus:outline-none px-6 py-5 text-slate-800 leading-relaxed",
      },
    },
  });

  // Sync external content changes, including a local autosaved draft loaded by the form.
  useEffect(() => {
    // useEditor can expose its instance before TipTap has created the
    // ProseMirror schema/view (especially during the dev Strict Mode mount).
    // getHTML() reads the schema cache, so wait until initialization is done.
    if (!editor?.isInitialized || !editor.schema || sourceDirty) return;
    const editorHtml = editor.getHTML();
    if (value !== editorHtml) {
      editor.commands.setContent(value, { emitUpdate: false });
      // This mirrors the controlled form value into the source view; it does not apply user edits.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSource(value);
    }
  }, [editor, value, sourceDirty]);

  const applyHtmlSource = useCallback((htmlSource: string) => {
    if (!editor?.isInitialized || !editor.schema) return false;
    const validationError = validateHtmlSource(htmlSource);
    if (validationError) {
      setSourceError(validationError);
      setSourceMessage(null);
      return false;
    }

    const safeHtml = sanitizeSourceForEditor(htmlSource);
    editor.commands.setContent(safeHtml, { emitUpdate: false });
    const appliedHtml = editor.getHTML();
    // Keep the safe source formatting in CodeMirror; TipTap normalizes HTML
    // when serializing, which would otherwise undo Format HTML immediately.
    setSource(safeHtml);
    setSourceDirty(false);
    setSourceError(null);
    setSourceMessage(safeHtml === htmlSource ? "HTML applied to the visual editor." : "HTML applied. Unsupported or unsafe markup was removed.");
    onChange(appliedHtml);
    return true;
  }, [editor, onChange]);

  // Keep Split View live while allowing a short pause for normal code typing.
  useEffect(() => {
    if (!editor || !sourceDirty || mode !== "split") return;
    const timeout = window.setTimeout(() => applyHtmlSource(source), 500);
    return () => window.clearTimeout(timeout);
  }, [applyHtmlSource, editor, mode, source, sourceDirty]);

  useEffect(() => {
    if (isLinkDialogOpen && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [isLinkDialogOpen]);

  if (!editor?.isInitialized || !editor.schema) return null;

  const setLink = () => {
    const existing = editor.getAttributes("link").href;
    setLinkUrl(existing ?? "");
    setIsLinkDialogOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt("Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=...):");
    if (url?.trim()) {
      editor.commands.setYoutubeVideo({
        src: url.trim(),
        width: 640,
        height: 360,
      });
    }
  };

  const updateHtmlSource = (nextSource: string) => {
    setSource(nextSource);
    setSourceDirty(true);
    setSourceError(null);
    setSourceMessage(null);
    onChange(nextSource);
  };

  const validateSource = () => {
    const validationError = validateHtmlSource(source);
    setSourceError(validationError);
    setSourceMessage(validationError ? null : "HTML markup is valid and ready to apply.");
  };

  const formatSource = () => {
    setSource(formatHtmlSource(source));
    setSourceError(null);
    setSourceMessage("HTML formatted. Apply changes to sync them with the visual editor.");
  };

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setSourceError("Clipboard access is unavailable. Select and copy the HTML manually.");
    }
  };

  const resetSource = () => {
    if ((sourceDirty || source !== savedValue) && !window.confirm("Discard your current HTML changes and reset to the last saved article?")) return;
    const safeSavedHtml = sanitizeSourceForEditor(savedValue);
    editor.commands.setContent(safeSavedHtml, { emitUpdate: false });
    const resetHtml = editor.getHTML();
    setSource(resetHtml);
    setSourceDirty(false);
    setSourceError(null);
    setSourceMessage("Reset to the last saved article.");
    onChange(resetHtml);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-3.5 py-2.5 sm:px-4">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs" role="group" aria-label="Editor view">
          {(["visual", "html", "split"] as EditorMode[]).map((editorMode) => (
            <button
              key={editorMode}
              type="button"
              aria-pressed={mode === editorMode}
              onClick={() => setMode(editorMode)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                mode === editorMode
                  ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {editorMode === "html" ? "</> Edit HTML" : editorMode === "split" ? "Split View" : "Visual Editor"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {mode !== "visual" && (
            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-800">
              Direct HTML Editing Active
            </span>
          )}
          <span className={`text-[11px] font-semibold ${sourceDirty ? "text-amber-700" : "text-emerald-700"}`} aria-live="polite">
            {sourceDirty ? "• HTML changes ready to apply" : "• Editors in sync"}
          </span>
        </div>
      </div>

      {/* Sticky Toolbar */}
      {mode !== "html" && <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-sm">
        {/* Heading */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "h1"
            : editor.isActive("heading", { level: 2 }) ? "h2"
            : editor.isActive("heading", { level: 3 }) ? "h3"
            : editor.isActive("heading", { level: 4 }) ? "h4"
            : "p"
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val[1]) as 1|2|3|4 }).run();
          }}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough size={15} />
        </ToolbarButton>

        <Divider />

        {/* Text color */}
        <div className="relative flex items-center" title="Text Color">
          <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <span className="relative text-xs font-black" style={{ color: editor.getAttributes("textStyle").color ?? "#334155" }}>A</span>
            <input
              type="color"
              defaultValue="#334155"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>

        {/* Highlight */}
        <div className="relative flex items-center" title="Highlight Color">
          <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <Highlighter size={14} />
            <input
              type="color"
              defaultValue="#fde68a"
              onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <AlignJustify size={15} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Block Quote">
          <Quote size={15} />
        </ToolbarButton>

        <Divider />

        {/* Code */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code2 size={15} />
        </ToolbarButton>

        <Divider />

        {/* Link, Image, Video, Table, HR */}
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert Link">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Insert Image">
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertYoutube} title="Insert YouTube Video">
          <Video size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert Table">
          <TableIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus size={15} />
        </ToolbarButton>

        <Divider />

        {/* Clear formatting, Undo, Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>
      </div>}

      <div className={mode === "split" ? "grid grid-cols-1 gap-0 xl:grid-cols-2" : "grid grid-cols-1"}>
        {mode !== "html" && (
          <section className={`min-w-0 ${mode === "split" ? "border-b border-slate-200 xl:border-b-0 xl:border-r" : ""}`} aria-label="Visual article editor">
            {mode === "split" && <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Visual editor</h3>}
            <EditorContent editor={editor} />
          </section>
        )}

        {mode !== "visual" && (
          <section className="min-w-0" aria-label="HTML source editor">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2.5 sm:px-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Article HTML</h3>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {mode === "split" ? "Edit source safely; changes sync to the visual document after a short pause." : "Edit source safely, then apply your changes to sync the visual document."}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={copySource} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                  {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy HTML"}
                </button>
                <button type="button" onClick={formatSource} className="h-8 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Format HTML</button>
                <button type="button" onClick={validateSource} className="h-8 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Validate HTML</button>
                <button type="button" onClick={resetSource} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                  <RotateCcw size={13} />Reset to Last Saved
                </button>
                <button type="button" onClick={() => applyHtmlSource(source)} disabled={!sourceDirty} className="h-8 rounded-lg bg-orange-500 px-3 text-[11px] font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">Apply HTML Changes</button>
              </div>
            </div>
            <CodeMirror
              className="admin-rich-source"
              value={source}
              height={mode === "split" ? "420px" : "520px"}
              theme="light"
              extensions={[...htmlExtensions, EditorView.lineWrapping]}
              basicSetup={{ lineNumbers: true, foldGutter: true, bracketMatching: true, indentOnInput: true, closeBrackets: true, autocompletion: true, highlightActiveLine: true, highlightSelectionMatches: true, tabSize: 2 }}
              indentWithTab
              aria-label="Article HTML source"
              onChange={updateHtmlSource}
            />
            {(sourceError || sourceMessage) && (
              <p className={`border-t px-4 py-2 text-xs ${sourceError ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`} role={sourceError ? "alert" : "status"}>
                {sourceError ?? sourceMessage}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-3 text-sm font-black text-slate-900">Insert Link</h3>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setIsLinkDialogOpen(false); }}
              placeholder="https://example.com"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setIsLinkDialogOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              {editor.isActive("link") && (
                <button onClick={() => { editor.chain().focus().unsetLink().run(); setIsLinkDialogOpen(false); }} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                  Remove
                </button>
              )}
              <button onClick={applyLink} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

