"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
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
  Upload, X, Play, AlertCircle,
} from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

const CustomBlockStyle = Extension.create({
  name: "customBlockStyle",
  addGlobalAttributes() {
    return [
      {
        types: [
          "heading",
          "paragraph",
          "blockquote",
          "bulletList",
          "orderedList",
          "listItem",
          "table",
          "tableRow",
          "tableCell",
          "tableHeader",
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: (el) => el.getAttribute("style"),
            renderHTML: (attrs) => {
              if (!attrs.style) return {};
              return { style: attrs.style };
            },
          },
        },
      },
    ];
  },
});

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  savedValue?: string;
  onUploadImage?: (file: File) => Promise<string>;
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

// Whitelist of clean, semantic CSS properties safe for rich content styling
const ALLOWED_CSS_PROPERTIES = new Set([
  "color", "background-color", "font-size", "font-weight", "font-style",
  "text-align", "text-decoration", "line-height", "margin", "margin-top",
  "margin-bottom", "margin-left", "margin-right", "padding", "padding-top",
  "padding-bottom", "padding-left", "padding-right", "border", "border-color",
  "border-width", "border-style", "border-radius", "width", "height", "max-width"
]);

function cleanInlineStyle(styleStr: string): string {
  if (!styleStr) return "";
  const cleaned: string[] = [];
  const rules = styleStr.split(";");
  for (const rule of rules) {
    const colonIdx = rule.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = rule.slice(0, colonIdx).trim().toLowerCase();
    const val = rule.slice(colonIdx + 1).trim();
    if (!prop || !val) continue;

    // Discard any Tailwind CSS internal variables (--tw-*) or IDE copy garbage
    if (prop.startsWith("--tw-") || prop.startsWith("--")) continue;

    // Discard dark editor background colors or dark theme text color artifacts
    // e.g. rgb(24, 24, 24), rgb(30, 30, 30), #1e1e1e, #0d1117, rgb(204, 204, 204)
    if (prop === "background-color" || prop === "background") {
      if (/rgb\(\s*(?:2[0-9]|1[0-9]|[0-9])\s*,\s*(?:2[0-9]|1[0-9]|[0-9])\s*,\s*(?:2[0-9]|1[0-9]|[0-9])\s*\)/i.test(val) ||
          /#(?:1[0-9a-f]{5}|0[0-9a-f]{5}|2[0-9a-f]{5})/i.test(val)) {
        continue;
      }
    }
    if (prop === "color") {
      // Discard light gray editor fonts like rgb(204, 204, 204) pasted from dark IDEs
      if (/rgb\(\s*20[0-4]\s*,\s*20[0-4]\s*,\s*20[0-4]\s*\)/i.test(val)) {
        continue;
      }
    }
    // Discard IDE font-family overrides like Segoe WPC, Consolas, Courier New unless specifically needed
    if (prop === "font-family") continue;

    if (ALLOWED_CSS_PROPERTIES.has(prop)) {
      // Prevent url(), expression(), javascript:
      if (!/(?:url\s*\(|expression\s*\(|@import|javascript:)/i.test(val)) {
        cleaned.push(`${prop}: ${val}`);
      }
    }
  }
  return cleaned.join("; ");
}

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
      
      if (name === "style") {
        const cleaned = cleanInlineStyle(value);
        if (cleaned) {
          element.setAttribute("style", cleaned);
        } else {
          element.removeAttribute("style");
        }
        continue;
      }

      if (name.startsWith("on") || name === "srcdoc" || !ALLOWED_HTML_ATTRIBUTES.has(name) || unsafeUrl) {
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

function extractYouTubeId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch {
    return null;
  }
}

// Format HTML neatly line-by-line for clean, readable source editing
function formatHtmlSource(source: string): string {
  // Normalize whitespace between tags
  const cleanSource = source
    .replace(/\r\n/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();

  // Split tags into individual lines
  const lines: string[] = [];
  let buffer = "";
  let inTag = false;

  for (let i = 0; i < cleanSource.length; i++) {
    const char = cleanSource[i];
    if (char === "<") {
      if (buffer.trim()) {
        lines.push(buffer.trim());
      }
      buffer = "<";
      inTag = true;
    } else if (char === ">" && inTag) {
      buffer += ">";
      lines.push(buffer);
      buffer = "";
      inTag = false;
    } else {
      buffer += char;
    }
  }
  if (buffer.trim()) {
    lines.push(buffer.trim());
  }

  // Re-indent neatly block by block
  const blockTags = new Set([
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "div",
    "ul", "ol", "li", "blockquote", "table", "thead",
    "tbody", "tr", "th", "td", "figure", "figcaption", "pre"
  ]);

  let depth = 0;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isClosing = /^<\/\s*([a-z0-9]+)/i.exec(line);
    const isOpening = /^<\s*([a-z0-9]+)(?:\s+[^>]*)?>$/i.exec(line);
    const isSelfClosing = /\/>$/.test(line) || (isOpening && VOID_HTML_TAGS.has(isOpening[1].toLowerCase()));

    if (isClosing) {
      const tag = isClosing[1].toLowerCase();
      if (blockTags.has(tag)) {
        depth = Math.max(0, depth - 1);
      }
      formattedLines.push(`${"  ".repeat(depth)}${line}`);
    } else if (isOpening && !isSelfClosing) {
      const tag = isOpening[1].toLowerCase();
      formattedLines.push(`${"  ".repeat(depth)}${line}`);
      if (blockTags.has(tag)) {
        depth++;
      }
    } else {
      // Content or self-closing
      formattedLines.push(`${"  ".repeat(depth)}${line}`);
    }
  }

  // Combine small inline elements (e.g. <p>Text</p> or <li>Item</li>) into single neat lines
  const result: string[] = [];
  for (let i = 0; i < formattedLines.length; i++) {
    const curr = formattedLines[i];
    const next1 = formattedLines[i + 1];
    const next2 = formattedLines[i + 2];

    const matchOpen = /^\s*<(h[1-6]|p|li|th|td)(?:\s+[^>]*)?>$/i.exec(curr);
    if (matchOpen && next1 && next2) {
      const tag = matchOpen[1].toLowerCase();
      const matchClose = new RegExp(`^\\s*<\\/${tag}>$`, "i").test(next2);
      const isContent = !/^<.*>$/.test(next1.trim());
      if (matchClose && isContent) {
        const indent = curr.match(/^\s*/)?.[0] ?? "";
        result.push(`${indent}${curr.trim()}${next1.trim()}${next2.trim()}`);
        i += 2;
        continue;
      }
    }
    result.push(curr);
  }

  return result.join("\n");
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

export function RichEditor({ value, onChange, placeholder = "Start writing your blog post...", savedValue = "", onUploadImage }: RichEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [source, setSource] = useState(value);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Link Dialog
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // YouTube Dialog State
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeStartTime, setYoutubeStartTime] = useState("");
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Image Dialog State
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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
      FontSize,
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
      CustomBlockStyle,
    ],
    content: value,
    immediatelyRender: false,
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
          "prose prose-slate max-w-none min-h-[380px] flex-1 focus:outline-none px-5 py-4 text-slate-800 leading-relaxed",
      },
      transformPastedHTML(pastedHtml) {
        return sanitizeSourceForEditor(pastedHtml);
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        const htmlData = event.clipboardData?.getData("text/html");
        // If htmlData is absent, but plain text contains full HTML markup (e.g. copied from code editor)
        if (!htmlData && text && /<\s*[a-z][\w:-]*(\s+[^>]*)?>[\s\S]*<\/\s*[a-z][\w:-]*\s*>/i.test(text)) {
          event.preventDefault();
          const safeHtml = sanitizeSourceForEditor(text);
          view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.text("")).scrollIntoView());
          // Insert parsed nodes
          editor?.commands.insertContent(safeHtml);
          return true;
        }
        return false;
      },
    },
  });

  // Sync external content changes, including a local autosaved draft loaded by the form.
  useEffect(() => {
    if (!editor || editor.isDestroyed || sourceDirty) return;
    const editorHtml = editor.getHTML();
    if (value !== editorHtml) {
      editor.commands.setContent(value, { emitUpdate: false });
      // This mirrors the controlled form value into the source view; it does not apply user edits.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSource(value);
    }
  }, [editor, value, sourceDirty]);

  const applyHtmlSource = useCallback((htmlSource: string) => {
    if (!editor || editor.isDestroyed) return false;
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

  // TipTap useEditor returns null until initialized on the client
  if (!editor) {
    return (
      <div className="overflow-hidden bg-white flex flex-col flex-1 h-full">
        <div className="h-12 border-b border-slate-200 bg-slate-50/80 px-4 flex items-center flex-shrink-0">
          <div className="h-6 w-52 rounded-lg bg-slate-200/80 animate-pulse" />
        </div>
        <div className="min-h-[380px] flex-1 p-5 space-y-3 bg-white">
          <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

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

  const handleModeChange = (targetMode: EditorMode) => {
    if (mode === targetMode) return;

    // When switching away from HTML editing mode to Visual or Split, automatically validate and apply
    if (mode === "html" && (targetMode === "visual" || targetMode === "split")) {
      const success = applyHtmlSource(source);
      if (!success) {
        // If HTML has a syntax error, inform user but still allow switching to visual with last valid DOM,
        // without discarding the invalid source so they can switch back and fix it!
        setMode(targetMode);
        return;
      }
    }

    // When switching from Visual to HTML, make sure source reflects the latest TipTap markup formatted line-by-line
    if (mode === "visual" && (targetMode === "html" || targetMode === "split")) {
      if (editor) {
        const latestHtml = editor.getHTML();
        setSource(formatHtmlSource(latestHtml));
        setSourceDirty(false);
      }
    }

    setMode(targetMode);
  };

  const openImageModal = () => {
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageError(null);
    setIsImageDialogOpen(true);
  };

  const applyImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setImageError("Please enter or upload an image URL.");
      return;
    }
    // Basic protocol validation
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/") && !trimmed.startsWith("data:image/")) {
      setImageError("Image URL must start with http://, https://, or /");
      return;
    }

    if (imageCaption.trim()) {
      const figureHtml = `<figure class="my-4"><img src="${trimmed}" alt="${(imageAlt || imageCaption).trim().replace(/"/g, '&quot;')}" class="rounded-xl w-full object-cover" /><figcaption class="mt-2 text-center text-xs text-slate-500 italic">${imageCaption.trim()}</figcaption></figure>`;
      editor.chain().focus().insertContent(figureHtml).run();
    } else {
      editor.chain().focus().setImage({
        src: trimmed,
        alt: imageAlt.trim() || undefined,
      }).run();
    }

    setIsImageDialogOpen(false);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  };

  const handleEditorImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!onUploadImage) {
      // Fallback to base64 if onUploadImage not provided
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    setImageUploading(true);
    setImageError(null);
    try {
      const uploadedUrl = await onUploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const openYoutubeModal = () => {
    setYoutubeUrl("");
    setYoutubeStartTime("");
    setYoutubeError(null);
    setIsYoutubeDialogOpen(true);
  };

  const applyYoutube = () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) {
      setYoutubeError("Please enter a YouTube video URL.");
      return;
    }

    const videoId = extractYouTubeId(trimmed);
    if (!videoId) {
      setYoutubeError("Invalid YouTube URL. Please enter a valid link (e.g. https://www.youtube.com/watch?v=...)");
      return;
    }

    let start = 0;
    if (youtubeStartTime.trim()) {
      const parsedStart = parseInt(youtubeStartTime.trim(), 10);
      if (!isNaN(parsedStart) && parsedStart > 0) {
        start = parsedStart;
      }
    }

    editor.commands.setYoutubeVideo({
      src: `https://www.youtube.com/watch?v=${videoId}`,
      width: 640,
      height: 360,
      start,
    });

    setIsYoutubeDialogOpen(false);
    setYoutubeUrl("");
    setYoutubeStartTime("");
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
    <div className="overflow-hidden bg-white flex flex-col flex-1 h-full">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-2.5 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 flex-shrink-0">
        <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs sm:inline-flex sm:w-auto" role="group" aria-label="Editor view mode">
          <button
            type="button"
            aria-pressed={mode === "visual"}
            onClick={() => handleModeChange("visual")}
            className={`min-h-11 min-w-0 rounded-lg px-1 py-2 text-[11px] leading-tight font-bold transition cursor-pointer sm:px-3.5 sm:py-1.5 sm:text-xs ${
              mode === "visual"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="sm:hidden">Visual</span>
            <span className="hidden sm:inline">Visual Editor</span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "html"}
            onClick={() => handleModeChange("html")}
            aria-label="Advanced: Edit HTML"
            className={`min-h-11 min-w-0 rounded-lg px-1 py-2 text-[11px] leading-tight font-bold transition cursor-pointer sm:px-3.5 sm:py-1.5 sm:text-xs ${
              mode === "html"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="sm:hidden">HTML</span>
            <span className="hidden sm:inline">&lt;/&gt; Advanced: Edit HTML</span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "split"}
            onClick={() => handleModeChange("split")}
            className={`min-h-11 min-w-0 rounded-lg px-1 py-2 text-[11px] leading-tight font-bold transition cursor-pointer sm:px-3.5 sm:py-1.5 sm:text-xs ${
              mode === "split"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="sm:hidden">Split</span>
            <span className="hidden sm:inline">Split View</span>
          </button>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          {mode !== "visual" && (
            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-800">
              HTML Mode Active
            </span>
          )}
          <span className={`text-[11px] font-semibold ${sourceDirty ? "text-amber-700" : "text-emerald-700"}`} aria-live="polite">
            {sourceDirty ? "• Auto-syncing HTML" : "• Editors in sync"}
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
            : editor.isActive("heading", { level: 5 }) ? "h5"
            : editor.isActive("heading", { level: 6 }) ? "h6"
            : "p"
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val[1]) as 1|2|3|4|5|6 }).run();
          }}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        {/* Font Size Selector */}
        <select
          value={editor.getAttributes("textStyle").fontSize || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(val).run();
            }
          }}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          title="Font Size"
        >
          <option value="">Size: Normal</option>
          <option value="12px">12px Small</option>
          <option value="14px">14px</option>
          <option value="16px">16px Default</option>
          <option value="18px">18px Medium</option>
          <option value="20px">20px Large</option>
          <option value="24px">24px XL</option>
          <option value="28px">28px 2XL</option>
          <option value="32px">32px 3XL</option>
          <option value="36px">36px 4XL</option>
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
            <span className="relative text-xs font-black" style={{ color: editor.getAttributes("textStyle").color ?? "#f4f4f5" }}>A</span>
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
        <ToolbarButton onClick={openImageModal} title="Insert Image">
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={openYoutubeModal} title="Insert YouTube Video">
          <Video size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} active={editor.isActive("table")} title="Insert Table">
          <TableIcon size={15} />
        </ToolbarButton>
        {editor.isActive("table") && (
          <div className="flex items-center gap-0.5 rounded-lg border border-orange-200 bg-orange-50/60 p-0.5">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-orange-800 hover:bg-orange-200"
              title="Add Row Below"
            >
              +Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-100"
              title="Delete Current Row"
            >
              -Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-orange-800 hover:bg-orange-200"
              title="Add Column Right"
            >
              +Col
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-100"
              title="Delete Current Column"
            >
              -Col
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-200"
              title="Delete Full Table"
            >
              Del Table
            </button>
          </div>
        )}
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

      <div
        className={
          mode === "split"
            ? "flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-stretch divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-0 min-w-0 box-border overflow-hidden"
            : "flex-1 flex flex-col min-h-0"
        }
      >
        {mode !== "html" && (
          <section className="min-w-0 flex-1 flex flex-col w-full min-h-0 box-border" aria-label="Visual article editor">
            {mode === "split" && (
              <div className="flex h-11 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 flex-shrink-0 box-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Visual Document</h3>
                <span className="text-[10px] font-semibold text-slate-400">Preview & Edit</span>
              </div>
            )}
            <div className={`flex-1 flex flex-col bg-white overflow-y-auto min-h-0 min-w-0 box-border ${mode !== "split" ? "min-h-[380px]" : ""}`}>
              <EditorContent editor={editor} className="flex-1 flex flex-col min-h-0 min-w-0" />
            </div>
          </section>
        )}

        {mode !== "visual" && (
          <section className="min-w-0 flex-1 flex flex-col w-full min-h-0 box-border relative overflow-hidden" aria-label="HTML source editor">
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 sm:px-4 flex-shrink-0 box-border ${
                mode === "split" ? "h-11 py-1 overflow-hidden" : "min-h-11 py-2"
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800 shrink-0">HTML Source</h3>
                {mode !== "split" ? (
                  <p className="text-[10px] text-slate-500 hidden sm:block">
                    Edit source and apply changes.
                  </p>
                ) : (
                  <span className="text-[10px] text-slate-400 hidden xl:inline">Auto-syncs</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={copySource}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Copy HTML to clipboard"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className={mode === "split" ? "hidden xl:inline" : ""}>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={formatSource}
                  className="h-7 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Format HTML markup"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={validateSource}
                  className="h-7 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Validate HTML"
                >
                  Validate
                </button>
                {mode !== "split" && (
                  <button
                    type="button"
                    onClick={resetSource}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw size={12} />Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => applyHtmlSource(source)}
                  disabled={!sourceDirty}
                  className="h-7 rounded-lg bg-orange-500 px-2.5 text-[11px] font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  title="Apply HTML changes immediately"
                >
                  {mode === "split" ? "Sync" : "Apply Changes"}
                </button>
              </div>
            </div>
            <div
              className={`flex-1 flex flex-col bg-white overflow-hidden min-h-0 min-w-0 box-border [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto ${
                mode !== "split" ? "min-h-[380px]" : ""
              }`}
            >
              <CodeMirror
                className="admin-rich-source flex-1 flex flex-col h-full min-h-0"
                value={source}
                height="100%"
                theme="light"
                extensions={[...htmlExtensions, EditorView.lineWrapping]}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  bracketMatching: true,
                  indentOnInput: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  tabSize: 2,
                }}
                indentWithTab
                aria-label="Article HTML source"
                onChange={updateHtmlSource}
              />
            </div>
            {(sourceError || sourceMessage) && (
              <div
                className={`absolute bottom-0 left-0 right-0 border-t px-3 py-1.5 text-[11px] font-medium backdrop-blur-xs flex items-center justify-between z-20 shadow-xs ${
                  sourceError
                    ? "border-red-200 bg-red-50/95 text-red-700"
                    : "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                }`}
                role={sourceError ? "alert" : "status"}
              >
                <span>{sourceError ?? sourceMessage}</span>
                <button
                  type="button"
                  onClick={() => { setSourceError(null); setSourceMessage(null); }}
                  className="ml-2 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Dismiss message"
                >
                  ✕
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="mb-3 text-sm font-black text-slate-900">Insert Link</h3>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setIsLinkDialogOpen(false); }}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-900 outline-none focus:border-orange-500"
            />
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setIsLinkDialogOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              {editor.isActive("link") && (
                <button onClick={() => { editor.chain().focus().unsetLink().run(); setIsLinkDialogOpen(false); }} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer">
                  Remove
                </button>
              )}
              <button onClick={applyLink} className="flex-1 rounded-xl bg-orange-600 py-2 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer">
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Video Dialog */}
      {isYoutubeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Play size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Embed YouTube Video</h3>
                  <p className="text-[11px] text-slate-500">Insert responsive YouTube embed directly into your article.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsYoutubeDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {youtubeError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{youtubeError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL *</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setYoutubeError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Time (Seconds, optional)</label>
                <input
                  type="number"
                  min="0"
                  value={youtubeStartTime}
                  onChange={(e) => setYoutubeStartTime(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* Live Preview if valid ID */}
              {extractYouTubeId(youtubeUrl) && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                    title="YouTube video preview"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsYoutubeDialogOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyYoutube}
                className="flex-1 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer shadow-sm shadow-orange-600/20"
              >
                Insert Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {isImageDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Insert Image</h3>
                  <p className="text-[11px] text-slate-500">Add an image URL or upload directly with caption & alt text.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {imageError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{imageError}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* File upload trigger */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload File (Optional)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:bg-orange-50/40 transition">
                  <Upload size={14} className="text-orange-600" />
                  <span>{imageUploading ? "Uploading image..." : "Choose Image file from computer"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={imageUploading}
                    onChange={handleEditorImageFileUpload}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageError(null);
                  }}
                  placeholder="https://example.com/image.jpg or /images/..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Descriptive text for visually impaired readers and search engines"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Figure 1: Official IRCTC Agent Portal interface"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* Preview image */}
              {imageUrl && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  {imageCaption && <p className="mt-1 text-center text-[10px] text-slate-500 italic">{imageCaption}</p>}
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsImageDialogOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyImage}
                className="flex-1 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer shadow-sm shadow-orange-600/20"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
