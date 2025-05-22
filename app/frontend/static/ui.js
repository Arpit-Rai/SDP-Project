// ui.js
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// Theme Toggle
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'light' ? '🌞' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeIcon.textContent = newTheme === 'light' ? '🌞' : '🌙';
  localStorage.setItem('theme', newTheme);
});

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.getAttribute('data-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) content.classList.add('active');
    });
  });
});

// Form submission
const form = document.getElementById('processForm');
const outputDiv = document.getElementById('output');
const transcriptEl = document.getElementById('transcript');
const summaryEl = document.getElementById('summary');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('urlInput').value;

  try {
    const response = await fetch('/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Request failed');

    const data = await response.json();
    transcriptEl.textContent = data.transcript;
    summaryEl.textContent = data.summary;
    renderSocialPosts(data);
    outputDiv.style.display = 'block';
    saveToHistory(url, data);

  } catch (err) {
    alert('Error processing the video: ' + err.message);
    console.error(err);
  }
});

function renderSocialPosts(data) {
  const socialPostsEl = document.getElementById('socialPosts');
  socialPostsEl.innerHTML = '';

  const platformLabels = {
    twitter: '🐦 Twitter',
    instagram: '📸 Instagram',
    shorts_title: '🎬 Shorts'
  };

  ['twitter', 'instagram', 'shorts_title'].forEach((platform) => {
    const post = data.social_posts?.[platform];
    if (!post) return;

    const card = document.createElement('div');
    card.className = 'social-post-block';

    const title = document.createElement('h4');
    title.textContent = platformLabels[platform] || platform;

    const content = document.createElement('pre');
    content.textContent = post;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(post);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(copyBtn);
    socialPostsEl.appendChild(card);
  });
}

// History
function saveToHistory(url, data) {
  const historyList = document.getElementById('historyList');
  const newItem = document.createElement('div');
  newItem.className = 'history-item';
  const title = data.title || url.substring(url.lastIndexOf('=') + 1);
  const now = new Date();
  const dateStr = now.toLocaleDateString() + ' - ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  newItem.innerHTML = `<div class="history-item-title">${title}</div><div class="history-item-date">${dateStr}</div>`;
  historyList.prepend(newItem);
}

document.querySelector('.logout-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to log out?')) {
    alert('Logged out successfully!');
    // window.location.href = '/login';
  }
});

document.getElementById('historyList').addEventListener('click', (e) => {
  const historyItem = e.target.closest('.history-item');
  if (historyItem) {
    alert('Loading this transcription...');
    document.querySelector('[data-tab="transcriber"]').click();
  }
});