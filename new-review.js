#!/usr/bin/env node

// Adds a plain-text review file to the reviews JSON.
// The text file should contain the review body with paragraphs separated by
// blank lines. Markup is preserved for the site to render:
//   *italic*   **bold**   [link text](url)   > pull quote paragraph

const fs = require('fs');

const USAGE = `Usage: node new-review.js <review.txt> --title "..." --author "..." --rating <1-5> --thumbnail "..." [--deck "..."] [--slug "..."] [--date "..."] [--json path]

  review.txt     Plain-text review, paragraphs separated by blank lines
  --title        Movie title (required)
  --author       Review author (required)
  --rating       1 to 5 in half-star steps, e.g. 3.5 (required)
  --thumbnail    Hero image URL (required)
  --deck         Hero excerpt; auto-generated from the first sentence if omitted
  --slug         URL slug; generated from the title if omitted
  --date         Review date, e.g. "July 28, 2026"; defaults to today
  --json         JSON file to update (default: movie-reviews.json)`;

function fail(message) {
    console.error('Error: ' + message + '\n');
    console.error(USAGE);
    process.exit(1);
}

// --- Parse arguments ---
const args = process.argv.slice(2);
const file = args[0] && !args[0].startsWith('--') ? args[0] : null;
const flags = {};
for (let i = file ? 1 : 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
        flags[args[i].slice(2)] = args[i + 1];
        i++;
    }
}

// --- Validate input ---
if (!file) fail('missing review text file.');
if (!fs.existsSync(file)) fail('file not found: ' + file);
['title', 'author', 'rating', 'thumbnail'].forEach(name => {
    if (!flags[name]) fail('missing required flag --' + name);
});

const rating = Number(flags.rating);
if (!Number.isFinite(rating) || rating < 1 || rating > 5 || rating % 0.5 !== 0) {
    fail('--rating must be from 1 to 5 in half-star steps (e.g. 3.5).');
}

// --- Normalize the body: CRLF -> LF, one paragraph per blank-line block ---
const raw = fs.readFileSync(file, 'utf8');
const paragraphs = raw
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
if (paragraphs.length === 0) fail(file + ' contains no review text.');
const body = paragraphs.join('\n\n');

// --- Slug ---
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const slug = flags.slug ? slugify(flags.slug) : slugify(flags.title);

// --- Deck: use --deck if given, otherwise first sentence of the body ---
const deck = flags.deck && flags.deck.trim()
    ? flags.deck.trim()
    : (paragraphs[0].includes('. ') ? paragraphs[0].split('. ')[0] + '.' : paragraphs[0]);

// --- Date: use --date if given, otherwise today (e.g. "July 28, 2026") ---
const date = flags.date && flags.date.trim()
    ? flags.date.trim()
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// --- Append to the JSON file ---
const jsonPath = flags.json || 'movie-reviews.json';
if (!fs.existsSync(jsonPath)) fail('JSON file not found: ' + jsonPath);

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const existing = data.reviews.find(r => r.slug === slug);
if (existing) {
    fail('a review with slug "' + slug + '" already exists ("' + existing.title + '"). Use --slug to override.');
}

data.reviews.push({
    slug,
    thumbnail: flags.thumbnail,
    title: flags.title,
    deck,
    author: flags.author,
    rating,
    date,
    body
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4) + '\n');

console.log('Added "' + flags.title + '" to ' + jsonPath);
console.log('Slug:       ' + slug);
console.log('Paragraphs: ' + paragraphs.length);
console.log('Deck:       ' + deck);
console.log('Preview:    http://localhost:8000/review.html?movie=' + slug);
