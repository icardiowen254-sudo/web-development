let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];
function searchNotes(word) {
  const searchWord = word.toLowerCase();

  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchWord)
  );
}
console.log(searchNotes("javascript"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]

console.log(searchNotes("pizza"));
// Expected: []
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }

  return longest;
}
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

const originalNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = originalNotes;
function countByCategory() {
  const counts = {};

  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

notes = [];

console.log(countByCategory());
// Expected: {}

notes = originalNotes;
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${
    counts.work || 0
  } work, ${counts.study || 0} study.`;
}
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

notes = [{ id: 6, text: "Study JavaScript", category: "study" }];

console.log(getSummary());
// Expected: "1 note: 0 personal, 0 work, 1 study."

notes = originalNotes;
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();

  return notes.some(
    (note) => note.text.trim().toLowerCase() === cleanedText
  );
}
console.log(isDuplicate("  Buy milk and bread  "));
// Expected: true

console.log(isDuplicate("Buy eggs"));
// Expected: false
function addNote(text, category) {
  const cleanedText = text.trim();

  if (cleanedText.length < 1 || cleanedText.length > 200) {
    console.log("Note not added: text must be 1–200 characters.");
    return false;
  }

  if (isDuplicate(cleanedText)) {
    console.log("Note not added: duplicate note.");
    return false;
  }

  const validCategories = ["personal", "work", "study"];

  if (!validCategories.includes(category)) {
    console.log("Note not added: invalid category.");
    return false;
  }

  const newNote = {
    id: notes.length + 1,
    text: cleanedText,
    category: category,
  };

  notes.push(newNote);

  console.log("Note added successfully.");
  return true;
}
console.log(addNote("Finish JavaScript practice", "study"));
// Expected: true

console.log(addNote("Buy milk and bread", "personal"));
// Expected: false (duplicate note)

console.log(addNote("", "personal"));
// Expected: false (invalid length)

console.log(addNote("New task", "school"));
// Expected: false (invalid category)