import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedStates, setCopiedStates] = useState({});

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process video');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the video');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetForm = () => {
    setUrl('');
    setResult(null);
    setError('');
    setCopiedStates({});
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2, #ffffff, #fdf2f8)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.1rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '2rem',
      marginBottom: '2rem',
      maxWidth: '800px',
      margin: '0 auto 2rem auto'
    },
    inputGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#dc2626'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    button: {
      flex: 1,
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    primaryButton: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    primaryButtonHover: {
      backgroundColor: '#b91c1c'
    },
    primaryButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      flex: 'none'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      marginTop: '1rem',
      color: '#b91c1c',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    copyButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      color: '#4b5563',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    content: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '1rem',
      maxHeight: '300px',
      overflowY: 'auto',
      lineHeight: '1.6',
      color: '#374151',
      whiteSpace: 'pre-wrap'
    },
    socialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '1rem'
    },
    socialCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem'
    },
    socialHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    socialTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1f2937',
      textTransform: 'capitalize'
    },
    socialCopyButton: {
      padding: '0.25rem 0.5rem',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      color: '#4b5563',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    socialContent: {
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      padding: '0.75rem',
      fontSize: '0.9rem',
      color: '#374151',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.5'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #dc2626',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem auto'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Social Media content generator</h1>
        <p style={styles.subtitle}>
          Transform YouTube videos into transcripts, summaries, and social media content
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <div style={styles.label}>YouTube URL</div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={styles.input}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(loading ? styles.primaryButtonDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Processing...
              </>
            ) : (
              <>
                📥 Process Video
              </>
            )}
          </button>

          {result && (
            <button
              onClick={resetForm}
              style={{...styles.button, ...styles.secondaryButton}}
            >
              Reset
            </button>
          )}
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {result && (
        <div>
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                📄 Transcript
              </div>
              <button
                onClick={() => copyToClipboard(result.transcript, 'transcript')}
                style={styles.copyButton}
              >
                {copiedStates.transcript ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={styles.content}>
              {result.transcript}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                📝 Summary
              </div>
              <button
                onClick={() => copyToClipboard(result.summary, 'summary')}
                style={styles.copyButton}
              >
                {copiedStates.summary ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={styles.content}>
              {result.summary}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              📱 Social Media Posts
            </div>
            
            <div style={styles.socialGrid}>
              {Object.entries(result.social_posts).map(([platform, content]) => (
                <div key={platform} style={styles.socialCard}>
                  <div style={styles.socialHeader}>
                    <div style={styles.socialTitle}>
                      {platform}
                    </div>
                    <button
                      onClick={() => copyToClipboard(content, platform)}
                      style={styles.socialCopyButton}
                    >
                      {copiedStates[platform] ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div style={styles.socialContent}>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={styles.card}>
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>
              Processing Your Video
            </h3>
            <p style={{color: '#6b7280'}}>
              This may take a few minutes depending on the video length...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
