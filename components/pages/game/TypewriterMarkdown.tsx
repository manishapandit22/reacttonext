"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function TypewriterMarkdown({
  content,
  components,
  delay = 200,
}) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const fullContent = useRef(content || "");
  const currentIndex = useRef(0);
  const timeoutRef = useRef(null);
  const tokens = useRef([]);

  const tokenizeMarkdown = (text) => {
    const regex =
      /(\s+|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|`[^`]+`|\*\*.*?\*\*|\*.*?\*|#[^\n]+|\n|[^\s\n]+)/g;
    const matches = text.match(regex) || [];
    return matches.filter(Boolean);
  };

  useEffect(() => {
    if (content !== fullContent.current) {
      fullContent.current = content || "";
      tokens.current = tokenizeMarkdown(fullContent.current);
      currentIndex.current = 0;
      setDisplayText("");
      setIsComplete(false);
    }

    const typeNextToken = () => {
      if (!tokens.current.length) return;

      if (currentIndex.current < tokens.current.length) {
        setDisplayText((prev) => {
          const newTokens = tokens.current.slice(0, currentIndex.current + 1);
          return newTokens.join("");
        });
        currentIndex.current++;

        const nextDelay = delay + Math.random() * delay * 0.5;
        timeoutRef.current = setTimeout(typeNextToken, nextDelay);
      } else {
        setIsComplete(true);
      }
    };

    if (tokens.current.length && currentIndex.current === 0) {
      timeoutRef.current = setTimeout(typeNextToken, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay]);

  return (
    <div className="typewriter-container">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              style={{ maxWidth: "100%", height: "auto" }}
              alt={props.alt || "Image"}
            />
          ),
          ...components,
        }}
        skipHtml={false}
      >
        {displayText}
      </ReactMarkdown>
      {!isComplete && <span className="cursor-blink">|</span>}
    </div>
  );
}
