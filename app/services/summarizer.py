from transformers import pipeline

# Load once
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text: str, max_chunk: int = 1000) -> str:
    """
    Summarizes long transcripts in chunks.
    Returns the combined summary.
    """
    text = text.strip().replace("\n", " ")
    chunks = [text[i:i + max_chunk] for i in range(0, len(text), max_chunk)]
    
    summaries = []
    for chunk in chunks:
        summary = summarizer(chunk, max_length=130, min_length=30, do_sample=False)[0]['summary_text']
        summaries.append(summary)

    return " ".join(summaries)