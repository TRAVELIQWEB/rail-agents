import Image from "next/image";
import {
  getBlogSectionImages,
  type BlogSectionImageConfig,
} from "@/data/blog-section-images";

interface BlogArticleContentProps {
  slug: string;
  htmlContent: string;
}

interface ParsedHtmlSection {
  headingHtml: string;
  headingText: string;
  bodyHtml: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&ldquo;|&rdquo;|&quot;/gi, '"')
    .replace(/&lsquo;|&rsquo;|&#39;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, "-")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits sanitized article HTML into H2 sections without altering a single character
 * of the underlying headings, paragraphs, lists, tables, links, or FAQs.
 */
function splitHtmlByH2Sections(html: string): {
  preambleHtml: string;
  sections: ParsedHtmlSection[];
} {
  const h2Regex = /<h2\b[^>]*>[\s\S]*?<\/h2>/gi;
  const matches = Array.from(html.matchAll(h2Regex));

  if (matches.length === 0) {
    return { preambleHtml: html, sections: [] };
  }

  const preambleHtml = html.slice(0, matches[0].index ?? 0);
  const sections: ParsedHtmlSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const headingHtml = currentMatch[0];
    const startIdx = (currentMatch.index ?? 0) + headingHtml.length;
    const endIdx =
      i + 1 < matches.length ? (matches[i + 1].index ?? html.length) : html.length;
    const bodyHtml = html.slice(startIdx, endIdx);

    sections.push({
      headingHtml,
      headingText: decodeHtmlEntities(headingHtml),
      bodyHtml,
    });
  }

  return { preambleHtml, sections };
}

function splitAfterFirstParagraph(bodyHtml: string): {
  firstPart: string;
  restPart: string;
} {
  const closePIndex = bodyHtml.search(/<\/p>/i);
  if (closePIndex === -1) {
    return { firstPart: bodyHtml, restPart: "" };
  }
  const splitPoint = closePIndex + 4; // length of "</p>"
  return {
    firstPart: bodyHtml.slice(0, splitPoint),
    restPart: bodyHtml.slice(splitPoint),
  };
}

function SectionVisual({ image }: { image: BlogSectionImageConfig }) {
  const isHero = image.variant === "hero";
  const isSupporting = image.variant === "supporting";

  return (
    <figure
      className={`blog-editorial-figure my-6 sm:my-7 overflow-hidden ${
        isSupporting
          ? "w-full max-w-[560px]"
          : "w-full max-w-[780px]"
      }`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#e6d7c7]/85 bg-[#f8f4ee] shadow-[0_6px_22px_rgba(15,39,71,0.06)]">
        <Image
          src={image.src}
          alt={image.alt}
          width={isSupporting ? 960 : 1200}
          height={isSupporting ? 540 : 675}
          priority={isHero}
          loading={isHero ? undefined : "lazy"}
          sizes={
            isSupporting
              ? "(max-width: 640px) 100vw, 560px"
              : "(max-width: 768px) 100vw, 780px"
          }
          className="blog-section-img h-full w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
          style={{
            objectPosition: image.objectPosition ?? "center center",
            margin: 0,
          }}
        />
      </div>
      {image.caption && (
        <figcaption className="type-caption mt-2.5 text-left font-medium leading-relaxed text-slate-500 not-italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function BlogArticleContent({
  slug,
  htmlContent,
}: BlogArticleContentProps) {
  const sectionImages = getBlogSectionImages(slug);

  // Gracefully render articles that have no mapped section images
  if (sectionImages.length === 0) {
    return (
      <div
        className="blog-content max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  const { preambleHtml, sections } = splitHtmlByH2Sections(htmlContent);

  if (sections.length === 0) {
    return (
      <div
        className="blog-content max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  const usedImageIds = new Set<string>();
  const introHeroConfig = sectionImages.find(
    (img) => img.headingMatch === "__INTRO__"
  );

  return (
    <div className="blog-content max-w-none text-slate-800">
      {preambleHtml && (
        <div
          className="contents"
          dangerouslySetInnerHTML={{ __html: preambleHtml }}
        />
      )}

      {sections.map((section, idx) => {
        const hasInlineImg = /<img\b/i.test(section.bodyHtml);
        let matchedImage: BlogSectionImageConfig | undefined;

        if (!hasInlineImg) {
          if (idx === 0 && introHeroConfig && !usedImageIds.has(introHeroConfig.id)) {
            matchedImage = introHeroConfig;
            usedImageIds.add(introHeroConfig.id);
          } else {
            matchedImage = sectionImages.find(
              (img) =>
                img.headingMatch !== "__INTRO__" &&
                !usedImageIds.has(img.id) &&
                section.headingText
                  .toLowerCase()
                  .includes(img.headingMatch.toLowerCase())
            );
            if (matchedImage) {
              usedImageIds.add(matchedImage.id);
            }
          }
        }

        if (!matchedImage) {
          return (
            <div
              key={`sec-${idx}`}
              className="contents"
              dangerouslySetInnerHTML={{
                __html: section.headingHtml + section.bodyHtml,
              }}
            />
          );
        }

        if (matchedImage.placement === "after-intro") {
          return (
            <div key={`sec-${idx}`} className="contents">
              <div
                className="contents"
                dangerouslySetInnerHTML={{
                  __html: section.headingHtml + section.bodyHtml,
                }}
              />
              <SectionVisual image={matchedImage} />
            </div>
          );
        }

        if (matchedImage.placement === "after-heading") {
          return (
            <div key={`sec-${idx}`} className="contents">
              <div
                className="contents"
                dangerouslySetInnerHTML={{ __html: section.headingHtml }}
              />
              <SectionVisual image={matchedImage} />
              <div
                className="contents"
                dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
              />
            </div>
          );
        }

        // Default: "after-first-paragraph"
        const { firstPart, restPart } = splitAfterFirstParagraph(section.bodyHtml);
        return (
          <div key={`sec-${idx}`} className="contents">
            <div
              className="contents"
              dangerouslySetInnerHTML={{
                __html: section.headingHtml + firstPart,
              }}
            />
            <SectionVisual image={matchedImage} />
            {restPart && (
              <div
                className="contents"
                dangerouslySetInnerHTML={{ __html: restPart }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

