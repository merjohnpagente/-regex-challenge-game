/*******************************************************
 * Regex Challenge Game
 * ------------------------------------------------------
 * Pure HTML/CSS/JavaScript game. No external libraries.
 * ------------------------------------------------------
 * Scoring rules:
 *  - +10 points for a correct answer.
 *  - -1 point for every second taken to answer
 *    (so a 4-second answer earns 10 - 4 = 6 points).
 *  - Points never go below 0 for a correct answer.
 *  - Each round has a 30-second limit. If time runs out
 *    the round is marked incorrect.
 ******************************************************/

(() => {
  "use strict";

  /* ============ CONFIG ============ */
  const TIME_LIMIT = 30; // seconds per round
  const BASE_POINTS = 10; // points for a correct answer
  const POINT_DECAY = 1; // points deducted per second
  const ROUNDS = 10; // number of challenges per game

  /* ============ REGEX BANK ============ */
  const REGEX_LIST = [
    { pattern: "^[a-z]{3}$", hint: "cat" },
    { pattern: "^\\d{4}$", hint: "1234" },
    { pattern: "^[A-Z]{2}\\d{3}$", hint: "AB123" },
    { pattern: "^\\d{2}:\\d{2}$", hint: "14:30" },
    { pattern: "^\\d{4}-\\d{2}-\\d{2}$", hint: "2026-08-06" },
    { pattern: "^#[0-9A-Fa-f]{6}$", hint: "#FF5733" },
    { pattern: "^[a-zA-Z0-9_]{3,16}$", hint: "john_01" },
    { pattern: "^[\\w.+-]+@[\\w-]+\\.[\\w.]+$", hint: "name@mail.com" },
    { pattern: "^\\(\\d{3}\\) \\d{3}-\\d{4}$", hint: "(555) 123-4567" },
    { pattern: "^[0-9]{4,6}$", hint: "98765" },
    { pattern: "^ab+c$", hint: "abbbc" },
    { pattern: "^(cat|dog|bird)$", hint: "dog" },
    { pattern: "^[a-z]+[0-9]+$", hint: "abc123" },
    { pattern: "^(\\d{1,3}\\.){3}\\d{1,3}$", hint: "192.168.1.1" },
    { pattern: "^[bcdfghjklmnpqrstvwxyz]{4}$", hint: "brst" }
  ];

  /* ============ STATE ============ */
  const state = {
    ongoing: false,
    round: 0,
    totalRounds: ROUNDS,
    currentChallenge: null,
    currentIndex: -1,
    usedIndices: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    incorrect: 0,
    timeLeft: TIME_LIMIT,
    timer: null
  };

  /* ============ DOM ============ */
  const $ = (id) => document.getElementById(id);

  const screens = {
    welcome: $("screen-welcome"),
    game: $("screen-game"),
    results: $("screen-results")
  };

  const el = {
    regexDisplay: $("regex-display"),
    feedback: $("feedback"),
    feedbackDetail: $("feedback-detail"),
    timerDigit: $("timer-digit"),
    timerRing: $("timer-ring"),
    hudRound: $("hud-round"),
    hudScore: $("hud-score"),
    answerInput: $("answer-input"),
    hintLine: $("hint-line"),
    resultEmoji: $("emoji-result"),
    resultMessage: $("result-message"),
    statScore: $("stat-score"),
    statCorrect: $("stat-correct"),
    statIncorrect: $("stat-incorrect"),
    statStreak: $("stat-best-streak")
  };

  /* ============ NAVIGATION ============ */
  function showScreen(name) {
    Object.keys(screens).forEach((key) => {
      screens[key].classList.remove("active");
    });
    screens[name].classList.add("active", "fade-in");
  }

  /* ============ RANDOM REGEX SELECTION ============ */
  function pickRandomChallenge() {
    const available = REGEX_LIST
      .map((ch, index) => ({ ch, index }))
      .filter((item) => !state.usedIndices.includes(item.index));

    if (available.length === 0) return null;

    const pick = available[Math.floor(Math.random() * available.length)];
    state.usedIndices.push(pick.index);
    return { ...pick.ch, index: pick.index };
  }

  /* ============ RENDER ============ */
  function renderChallenge() {
    el.regexDisplay.textContent = state.currentChallenge.pattern;
    el.hudRound.textContent = `${state.round} / ${state.totalRounds}`;
    el.hudScore.textContent = state.score;
    el.answerInput.value = "";
    el.hintLine.classList.add("hidden");
    el.hintLine.textContent = "";
    clearFeedback();
    el.answerInput.focus();
  }

  function clearFeedback() {
    el.feedback.className = "feedback";
    el.feedbackDetail.textContent = "";
  }

  function showFeedback(type, message) {
    const badge = document.createElement("span");
    badge.className = "feedback-badge";
    badge.textContent = message;
    el.feedback.className = "feedback " + type;
    el.feedbackDetail.replaceChildren(badge);
  }

  function shakeRegexBox() {
    const box = el.regexDisplay.closest(".regex-box");
    box.classList.remove("wrong-bounce");
    void box.offsetWidth; // restart animation
    box.classList.add("wrong-bounce");
  }

  function updateTimerVisual() {
    const fraction = state.timeLeft / TIME_LIMIT;
    const degrees = fraction * 360;
    el.timerRing.style.background =
      `conic-gradient(var(--accent-2) ${degrees}deg, rgba(255,255,255,0.12) ${degrees}deg)`;

    if (state.timeLeft <= 10) {
      el.timerRing.classList.add("danger");
      el.timerRing.style.background =
        `conic-gradient(var(--incorrect) ${degrees}deg, rgba(255,255,255,0.12) ${degrees}deg)`;
    } else {
      el.timerRing.classList.remove("danger");
    }
    el.timerDigit.textContent = state.timeLeft;
  }

  /* ============ TIMER ============ */
  function startTimer() {
    stopTimer();
    state.timeLeft = TIME_LIMIT;
    updateTimerVisual();
    state.timer = setInterval(() => {
      state.timeLeft -= 1;
      updateTimerVisual();
      if (state.timeLeft <= 0) {
        stopTimer();
        onTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  }

  function secondsUsed() {
    return TIME_LIMIT - state.timeLeft;
  }

  /* ============ VALIDATION & SCORING ============ */
  function isMatch(input) {
    try {
      return new RegExp(state.currentChallenge.pattern).test(input);
    } catch (error) {
      return false;
    }
  }

  function nextChallenge() {
    if (state.round >= state.totalRounds) {
      endGame();
      return;
    }

    state.round += 1;
    state.currentChallenge = pickRandomChallenge();

    if (!state.currentChallenge) {
      endGame();
      return;
    }

    renderChallenge();
    startTimer();
  }

  function handleCorrect() {
    stopTimer();
    const taken = secondsUsed();
    const points = Math.max(0, BASE_POINTS - taken * POINT_DECAY);
    const suffix = taken + (taken === 1 ? " second" : " seconds");

    state.score += points;
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);

    showFeedback(
      "correct",
      `Correct! +${points} pts (answered in ${suffix})`
    );
    el.hudScore.textContent = state.score;

    setTimeout(nextChallenge, 1400);
  }

  function handleIncorrect(message) {
    state.incorrect += 1;
    state.streak = 0;
    stopTimer();
    showFeedback("incorrect", message);
    shakeRegexBox();
  }

  function onTimeUp() {
    state.incorrect += 1;
    state.streak = 0;
    showFeedback("incorrect", "Time's up! That round is missed.");
    setTimeout(nextChallenge, 1400);
  }

  /* ============ ANSWER SUBMISSION ============ */
  function handleSubmit(event) {
    event.preventDefault();
    if (!state.ongoing || !state.timer) return;

    const input = el.answerInput.value;
    if (input.length === 0) {
      clearFeedback();
      shakeRegexBox();
      el.answerInput.focus();
      return;
    }

    if (isMatch(input)) {
      handleCorrect();
    } else {
      handleIncorrect("Incorrect! Try again or skip.");
      el.answerInput.focus();
    }
  }

  /* ============ HINT & SKIP ============ */
  function showHint() {
    if (!state.ongoing || !state.currentChallenge) return;
    el.hintLine.textContent =
      `💡 Hint: a matching string could be: ${state.currentChallenge.hint}`;
    el.hintLine.classList.remove("hidden");
  }

  function skipChallenge() {
    if (!state.ongoing) return;
    state.incorrect += 1;
    state.streak = 0;
    nextChallenge();
  }

  /* ============ START / END ============ */
  function startGame() {
    state.ongoing = true;
    state.round = 0;
    state.score = 0;
    state.correct = 0;
    state.incorrect = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.usedIndices = [];
    state.currentChallenge = null;

    showScreen("game");
    nextChallenge();
  }

  function endGame() {
    stopTimer();
    state.ongoing = false;
    showScreen("results");
    renderResults();
  }

  function renderResults() {
    el.statScore.textContent = state.score;
    el.statCorrect.textContent = state.correct;
    el.statIncorrect.textContent = state.incorrect;
    el.statStreak.textContent = state.bestStreak;

    const total = state.correct + state.incorrect;
    const ratio = total > 0 ? state.correct / total : 0;

    if (ratio === 1 && state.correct === state.totalRounds) {
      el.resultEmoji.textContent = "🏆";
      el.resultMessage.textContent =
        "Perfect game! You matched every single pattern flawlessly.";
    } else if (ratio >= 0.7) {
      el.resultEmoji.textContent = "🎉";
      el.resultMessage.textContent =
        "Great job! You really know your way around regular expressions.";
    } else if (ratio >= 0.4) {
      el.resultEmoji.textContent = "👍";
      el.resultMessage.textContent =
        "Not bad! Practice a bit more and you will master the patterns.";
    } else {
      el.resultEmoji.textContent = "📚";
      el.resultMessage.textContent =
        "Keep practicing — every great regex wizard started somewhere!";
    }
  }

  /* ============ EVENT LISTENERS ============ */
  $("btn-start").addEventListener("click", startGame);
  $("btn-play-again").addEventListener("click", startGame);
  $("btn-hint").addEventListener("click", showHint);
  $("btn-skip").addEventListener("click", skipChallenge);
  $("answer-form").addEventListener("submit", handleSubmit);
})();

/*******************************************************
 * Welcome-screen intro animation
 * ------------------------------------------------------
 * Types sample regex patterns into the fake code editor
 * on the start screen. Runs only while the welcome
 * screen is visible and stops when the game starts.
 ******************************************************/
(() => {
  const samples = [
    { p: "^[a-z]{3}$", e: "cat" },
    { p: "^\\d{2}:\\d{2}$", e: "14:30" },
    { p: "^#[0-9A-Fa-f]{6}$", e: "#FF5733" },
    { p: "^(cat|dog|bird)$", e: "dog" },
    { p: "^[A-Z]{2}\\d{3}$", e: "AB123" }
  ];

  const codeText = document.getElementById("code-text");
  const codeBlurb = document.getElementById("code-blurb");
  const btnStart = document.getElementById("btn-start");

  if (!codeText || !codeBlurb || !btnStart) return;

  let index = 0;
  let charIndex = 0;
  let timer = null;

  function introVisible() {
    const welcome = document.getElementById("screen-welcome");
    return welcome && welcome.classList.contains("active");
  }

  function stopIntro() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function tick() {
    if (!introVisible()) return;

    const sample = samples[index];

    if (charIndex < sample.p.length) {
      charIndex += 1;
      codeText.textContent = sample.p.slice(0, charIndex);
      codeBlurb.textContent = "\u00A0";
      timer = setTimeout(tick, 70);
    } else {
      codeBlurb.textContent = `\u2713 matches "${sample.e}"`;
      timer = setTimeout(() => {
        if (!introVisible()) return;
        index = (index + 1) % samples.length;
        charIndex = 0;
        codeText.textContent = "";
        codeBlurb.textContent = "\u00A0";
        timer = setTimeout(tick, 90);
      }, 1600);
    }
  }

  btnStart.addEventListener("click", stopIntro);
  timer = setTimeout(tick, 700);
})();
