import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [theme, setTheme] = useState("light");
  const [regenLoading, setRegenLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Theme styles
  const isDark = theme === "dark";
  const themeStyles = {
    background: isDark ? "#000" : "linear-gradient(135deg, #fef2f2, #ffffff, #fdf2f8)",
    color: isDark ? "#f3f4f6" : "#1f2937",
    transition: "background 0.5s, color 0.5s",
    minHeight: "100vh",
    minWidth: "100vw",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    boxSizing: "border-box",
  };

  // Animation for result cards
  const fadeIn = {
    animation: "fadeIn 0.7s",
  };

  // Toggle theme
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process video");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred while processing the video");
    } finally {
      setLoading(false);
    }
  };

  // Regenerate social posts
  const handleRegenerate = async () => {
    if (!result || !result.summary) return;
    setRegenLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: result.summary }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to regenerate posts");
      }
      const data = await response.json();
      setResult((prev) => ({
        ...prev,
        social_posts: data.social_posts,
      }));
    } catch (err) {
      setError(err.message || "An error occurred while regenerating posts");
    } finally {
      setRegenLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process file");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred while processing the file");
    } finally {
      setUploadLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setUrl("");
    setResult(null);
    setError("");
    setCopiedStates({});
  };

  return (
    <div style={themeStyles}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background: ${isDark ? "#000" : "linear-gradient(135deg, #fef2f2, #ffffff, #fdf2f8)"};
          }
        `}
      </style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>Social Media Content Generator</h1>
          <p style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>
            Transform YouTube videos into transcripts, summaries, and social media content
          </p>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            background: isDark ? "#f3f4f6" : "#232526",
            color: isDark ? "#232526" : "#f3f4f6",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1.2rem",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "background 0.3s, color 0.3s",
          }}
        >
          {isDark ? "🌞 Light" : "🌙 Dark"}
        </button>
      </div>

      <div
        style={{
          background: isDark ? "#2d2d2d" : "white",
          borderRadius: "12px",
          boxShadow: isDark
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.1)",
          padding: "2rem",
          marginBottom: "2rem",
          maxWidth: "800px",
          margin: "0 auto 2rem auto",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>YouTube URL</div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              background: isDark ? "#232526" : "#fff",
              color: isDark ? "#f3f4f6" : "#232526",
              marginBottom: "1rem",
            }}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              background: "#dc2626",
              color: "white",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    border: "4px solid #f3f4f6",
                    borderTop: "4px solid #dc2626",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "0.5rem",
                  }}
                ></div>
                Processing...
              </>
            ) : (
              <>📥 Process Video</>
            )}
          </button>
          {result && (
            <button
              onClick={resetForm}
              style={{
                background: "#6b7280",
                color: "white",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
        </div>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "1rem",
              marginTop: "1rem",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      <div
        style={{
          background: isDark ? "#2d2d2d" : "white",
          borderRadius: "12px",
          boxShadow: isDark
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.1)",
          padding: "2rem",
          marginBottom: "2rem",
          maxWidth: "800px",
          margin: "0 auto 2rem auto",
        }}
      >
        <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
          Or Upload Audio/Video File
        </div>
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "1rem",
            outline: "none",
            background: isDark ? "#232526" : "#fff",
            color: isDark ? "#f3f4f6" : "#232526",
            marginBottom: "1rem",
          }}
          disabled={uploadLoading}
        />
        <button
          onClick={handleFileUpload}
          disabled={uploadLoading || !selectedFile}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: uploadLoading ? "not-allowed" : "pointer",
            background: "#2563eb",
            color: "white",
            opacity: uploadLoading ? 0.7 : 1,
            width: "100%",
          }}
        >
          {uploadLoading ? "Uploading..." : "Upload & Process"}
        </button>
      </div>

      {result && (
        <div style={fadeIn}>
          <div
            style={{
              background: isDark ? "#2d2d2d" : "white",
              borderRadius: "12px",
              boxShadow: isDark
                ? "0 10px 25px rgba(0,0,0,0.4)"
                : "0 10px 25px rgba(0,0,0,0.1)",
              padding: "2rem",
              marginBottom: "2rem",
              maxWidth: "800px",
              margin: "0 auto 2rem auto",
              ...fadeIn,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>📄 Transcript</div>
              <button
                onClick={() => copyToClipboard(result.transcript, "transcript")}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {copiedStates.transcript ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <div
              style={{
                background: isDark ? "#232526" : "#f9fafb",
                borderRadius: "8px",
                padding: "1rem",
                maxHeight: "300px",
                overflowY: "auto",
                lineHeight: "1.6",
                color: isDark ? "#f3f4f6" : "#374151",
                whiteSpace: "pre-wrap",
              }}
            >
              {result.transcript}
            </div>
          </div>

          <div
            style={{
              background: isDark ? "#2d2d2d" : "white",
              borderRadius: "12px",
              boxShadow: isDark
                ? "0 10px 25px rgba(0,0,0,0.4)"
                : "0 10px 25px rgba(0,0,0,0.1)",
              padding: "2rem",
              marginBottom: "2rem",
              maxWidth: "800px",
              margin: "0 auto 2rem auto",
              ...fadeIn,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>📝 Summary</div>
              <button
                onClick={() => copyToClipboard(result.summary, "summary")}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {copiedStates.summary ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <div
              style={{
                background: isDark ? "#232526" : "#f9fafb",
                borderRadius: "8px",
                padding: "1rem",
                maxHeight: "300px",
                overflowY: "auto",
                lineHeight: "1.6",
                color: isDark ? "#f3f4f6" : "#374151",
                whiteSpace: "pre-wrap",
              }}
            >
              {result.summary}
            </div>
          </div>

          <div
            style={{
              background: isDark ? "#2d2d2d" : "white",
              borderRadius: "12px",
              boxShadow: isDark
                ? "0 10px 25px rgba(0,0,0,0.4)"
                : "0 10px 25px rgba(0,0,0,0.1)",
              padding: "2rem",
              marginBottom: "2rem",
              maxWidth: "800px",
              margin: "0 auto 2rem auto",
              ...fadeIn,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>📱 Social Media Posts</div>
              <button
                onClick={handleRegenerate}
                disabled={regenLoading}
                style={{
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  padding: "0.5rem 1.2rem",
                  cursor: regenLoading ? "not-allowed" : "pointer",
                  opacity: regenLoading ? 0.7 : 1,
                  marginLeft: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {regenLoading ? (
                  <>
                    <div
                      style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        border: "3px solid #f3f4f6",
                        borderTop: "3px solid #2563eb",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginRight: "0.5rem",
                      }}
                    ></div>
                    Regenerating...
                  </>
                ) : (
                  <>🔄 Regenerate</>
                )}
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginTop: "1rem",
              }}
            >
              {Object.entries(result.social_posts).map(([platform, content]) => (
                <div
                  key={platform}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1rem",
                    background: isDark ? "#232526" : "#f9fafb",
                    ...fadeIn,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: isDark ? "#f3f4f6" : "#1f2937",
                        textTransform: "capitalize",
                      }}
                    >
                      {platform}
                    </div>
                    <button
                      onClick={() => copyToClipboard(content, platform)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        color: "#4b5563",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {copiedStates[platform] ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div
                    style={{
                      background: isDark ? "#232526" : "#f9fafb",
                      borderRadius: "6px",
                      padding: "0.75rem",
                      fontSize: "0.9rem",
                      color: isDark ? "#f3f4f6" : "#374151",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.5",
                    }}
                  >
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{
            background: isDark ? "#2d2d2d" : "white",
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 10px 25px rgba(0,0,0,0.4)"
              : "0 10px 25px rgba(0,0,0,0.1)",
            padding: "2rem",
            marginBottom: "2rem",
            maxWidth: "800px",
            margin: "0 auto 2rem auto",
          }}
        >
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                border: "4px solid #f3f4f6",
                borderTop: "4px solid #dc2626",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem auto",
              }}
            ></div>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: isDark ? "#f3f4f6" : "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Processing Your Video
            </h3>
            <p style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>
              This may take a few minutes depending on the video length...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
