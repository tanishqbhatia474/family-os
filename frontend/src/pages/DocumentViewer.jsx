import { useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function DocumentViewer() {
  const [params] = useSearchParams();
  const url = params.get("url");

  const [useIframe, setUseIframe] = useState(false);

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] px-4">
        <div className="text-center space-y-3">
          <div className="text-4xl sm:text-5xl mb-4">📄</div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text)]">
            Invalid document
          </h2>
          <p className="text-sm sm:text-base text-[var(--muted)]">
            No document URL provided
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      {!useIframe && (
        <img
          src={url}
          alt="Document"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain"
          }}
          onError={() => {
            // Fallback to iframe if image fails to load
            setUseIframe(true);
          }}
        />
      )}

      {useIframe && (
        <iframe
          src={url}
          title="Document Viewer"
          style={{
            width: "100%",
            height: "100%",
            border: "none"
          }}
          sandbox="allow-same-origin allow-scripts"
        />
      )}
    </div>
  );
}