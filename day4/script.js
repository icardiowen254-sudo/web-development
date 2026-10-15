const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearButton = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");
const saveStatus = document.getElementById("save-status");

const DRAFT_KEY = "quicknotes-day4-draft";
const THEME_KEY = "quicknotes-day4-theme";
const CHARACTER_LIMIT = 200;
const WARNING_LIMIT = 180;

function updateCounters() {
  const characterTotal = noteText.value.length;
  const trimmedText = noteText.value.trim();
  const wordTotal = trimmedText ? trimmedText.split(/\s+/).length : 0;

  charCount.textContent = `${characterTotal} / ${CHARACTER_LIMIT} characters`;
  wordCount.textContent = `${wordTotal} ${wordTotal === 1 ? "word" : "words"}`;

  charCount.classList.remove("warning", "over");
  if (characterTotal > CHARACTER_LIMIT) {
    charCount.classList.add("over");
  } else if (characterTotal > WARNING_LIMIT) {
    charCount.classList.add("warning");
  }
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, noteText.value);
    saveStatus.textContent = "Draft saved automatically.";
  } catch (error) {
    saveStatus.textContent = "Could not save draft in this browser.";
  }
}

function restoreDraft() {
  try {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft !== null) {
      noteText.value = savedDraft;
    }
  } catch (error) {
    saveStatus.textContent = "Draft storage is unavailable.";
  }
  updateCounters();
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

function restoreTheme() {
  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "light";
  } catch (error) {
    // Keep the default light theme if storage is unavailable.
  }
  applyTheme(savedTheme);
}

noteText.addEventListener("input", () => {
  updateCounters();
  saveDraft();
});

clearButton.addEventListener("click", () => {
  noteText.value = "";
  updateCounters();
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    // The text and counters are still cleared if storage is unavailable.
  }
  saveStatus.textContent = "Note cleared.";
  noteText.focus();
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(nextTheme);
  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    // Theme still changes for this session if storage is unavailable.
  }
});

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    noteText.value = "";
    updateCounters();
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      // Keep the clear action working if storage is unavailable.
    }
    saveStatus.textContent = "Note cleared.";
  }
});

restoreDraft();
restoreTheme();
