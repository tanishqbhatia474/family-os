import { useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function DocumentViewer() {
  const [params] = useSearchParams();
  const url = params.get("url");

  const [useIframe, setUseIframe] = useState(false);

  if (!url) {
    return <div style={{ padding: 40 }}>Invalid document</div>;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {!useIframe && (
        <img
          src={url}
          alt="Document"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain"
          }}
          onError={() => {
            // Only now do we load iframe
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
        />
      )}
    </div>
  );
}
