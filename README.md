# Regex Challenge Game

A web-based learning game built with **HTML, CSS, and JavaScript only** (no frameworks, no external libraries). The app presents a randomly selected regular expression and the player types a string that must **fully match** the pattern. The game evaluates the answer, tracks points with a time-based scoring system, and shows a final result screen.

## 🎯 Features

| Requirement | Implementation |
| --- | --- |
| Start Game | Modern game-style welcome screen with a **Start Game** button, animated regex preview, and rule cards |
| Random Regex Challenge | Regexes drawn **randomly** (without repeats) from a predefined bank |
| Player Input | Textbox for typing the candidate string, submitted via button or **Enter** |
| Validation | `new RegExp(pattern).test(input)` evaluates the string; shows **Correct!** or **Incorrect!** |
| Score | **+10 points** per correct answer, **−1 point per second** taken (never below 0); timer of **30 s** per round |
| End Game | Final score, correct/missed/skipped counts and best streak on a results screen |
| Extras | Hint toggle (shows a sample matching string), Skip button, score/timer HUD, animations, responsive layout |

## 🚀 How to Play

1. Click **Start Game**.
2. Read the pattern shown in the yellow code box.
3. Type a string that **fully matches** the pattern (e.g. for `^[a-z]{3}$` type `cat`).
4. Press **Check Answer** (or Enter).
   - **Correct!** → you earn `10 − seconds_used` points and move to the next round.
   - **Incorrect!** → you may try again or press **Skip**.
   - Running out of the 30-second timer counts the round as missed.
5. After 10 rounds you reach the results screen with your final score.

## 🧩 Regex Bank (examples)

| Pattern | What it matches | Sample (hint) |
| --- | --- | --- |
| `^[a-z]{3}$` | exactly 3 lowercase letters | `cat` |
| `^#[0-9A-Fa-f]{6}$` | hex color code | `#FF5733` |
| `^\d{4}-\d{2}-\d{2}$` | date `YYYY-MM-DD` | `2026-08-06` |
| `^[\w.+-]+@[\w-]+\.[\w.]+$` | an email address | `name@mail.com` |
| `^\(\d{3}\) \d{3}-\d{4}$` | phone number | `(555) 123-4567` |
| `^(cat\|dog\|bird)$` | one of the listed words | `dog` |
| `^[a-zA-Z0-9_]{3,16}$` | username, 3–16 chars | `john_01` |

The full set of 15 patterns lives in the `REGEX_LIST` array in `script.js`.

## 📁 File Structure

```
.
├── index.html   # Structure: welcome, game, and results screens
├── style.css    # Styling, responsiveness, and animations
├── script.js    # Game logic: random selection, validation, scoring, timer
└── README.md    # This documentation
```

## 🛠 How to Run

Requires no build step. Any of these works:

- **Simple:** double-click `index.html`, or open it in a browser.
- **Local server (recommended):** `npx serve .` then open the printed URL.
- **GitHub Pages / Vercel:** push this folder to a repository and enable the static-site deployment (no configuration needed).

## ⚙️ Customization

All game settings are constants near the top of `script.js`:

- `TIME_LIMIT` — seconds allowed per round (default `30`).
- `BASE_POINTS` — points for a correct answer (default `10`).
- `POINT_DECAY` — points deducted per second (default `1`).
- `ROUNDS` — number of challenges per game (default `10`).
- `REGEX_LIST` — add or remove patterns and their hints.

## 📝 Grading Rubric Coverage

- **Program functionality** — each requirement is implemented and wired to buttons/forms.
- **Correct regex implementation** — JS-native `RegExp` evaluation, patterns verified.
- **User interface & usability** — clean HUD, timer ring, pop/error feedback, hints, responsive design.
- **Code organization & readability** — modular IIFE, named functions, clear section comments.
- **Documentation** — this README explains features, rules, scoring, setup, and customization.

## 👥 Group Members

- Merjohn Pagente
