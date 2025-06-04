"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface SanitizedHtmlProps {
  content: string;
  className?: string;
}

export function SanitizedHtml({ content, className }: SanitizedHtmlProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  useEffect(() => {
    // DOMPurify is only available in the browser
    if (typeof window !== "undefined") {
      // Pre-process content to preserve whitespace if needed
      let processedContent = content;
      
      // Convert plain text line breaks to <br> tags if not already HTML
      if (!content.includes("<") && !content.includes(">")) {
        processedContent = content
          .split("\n")
          .map(line => line.trim())
          .join("<br>");
      }
      
      // Apply DOMPurify sanitization
      const sanitized = DOMPurify.sanitize(processedContent, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "a",
          "hr",
          "span", 
          "div", 
          "pre", 
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "style"],
      });
      
      setSanitizedContent(sanitized);
    }
  }, [content]);

  return (
    <div
      className={`${className} whitespace-pre-wrap`} 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
