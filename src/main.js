import { soundEngine } from './audio.js';
import { ParticleEngine } from './particles.js';

// Initialize Particle Engine Canvas
let particleEngine;
window.addEventListener('DOMContentLoaded', () => {
  particleEngine = new ParticleEngine('particles-canvas');
  initApp();
});

// Create Particle helper function for particle loops
window.createParticle = function() {
  if (particleEngine) {
    particleEngine.spawnAmbientParticle();
  }
};

// Navigation & Screen Control (Guarantees single screen active with zero overlap)
export function switchScreen(fromId, toId) {
  soundEngine.playChime(600);

  // Screen ID alias map for seamless compatibility
  const aliasMap = {
    'screen-proposal': 'screen-anniversary-card',
    'screen-confirm': 'screen-confirm-card',
    'screen-text-response': 'screen-custom-message-card'
  };
  const targetId = aliasMap[toId] || toId;

  const allScreens = document.querySelectorAll('.screen');
  const toScreen = document.getElementById(targetId) || document.getElementById(toId);

  // Immediately deactivate and hide all inactive screens
  allScreens.forEach(screen => {
    if (screen !== toScreen) {
      screen.classList.remove('active');
      screen.style.display = 'none';
      screen.style.opacity = '0';
      screen.style.pointerEvents = 'none';
    }
  });

  // Activate target screen exclusively
  if (toScreen) {
    toScreen.style.display = 'flex';
    toScreen.classList.add('active');
    toScreen.style.opacity = '1';
    toScreen.style.transform = 'translateY(0) scale(1)';
    toScreen.style.pointerEvents = 'auto';
  }
}

window.switchScreen = switchScreen;

// App Configuration State
let appConfig = {
  partnerName: 'Madhu Bangaram',
  proposalText: 'Happy 1st Anniversary, Madhu Bangaram! ❤️<br><span style="font-size: 1.25rem; font-weight: 800; opacity: 0.95; color: #ff8fab; display: inline-block; margin-top: 6px;">I LOVE YOU MADHU SREE ❤️</span>'
};

function initApp() {
  localStorage.removeItem('for_you_config');
  updateConfigDOM();
  startCountdown();
  setupEventListeners();
}

function updateConfigDOM() {
  const titleEl = document.getElementById('letter-recipient-title');
  if (titleEl) titleEl.innerText = `for ${appConfig.partnerName.toLowerCase()}`;

  const proposalEl = document.getElementById('proposal-text');
  if (proposalEl) proposalEl.innerHTML = appConfig.proposalText;

  const certBody = document.getElementById('cert-body');
  if (certBody) {
    certBody.innerHTML = `This certifies that <strong>Madhu Sree</strong> & <strong>Nirup</strong> are officially bound by love forever!
    <br/><br/>
    Entitled to unlimited dates, late night talks, infinite coffee cups, and endless hugs.`;
  }
}

// Sound Control Toggle
document.getElementById('btn-sound')?.addEventListener('click', () => {
  const isMuted = soundEngine.toggleMute();
  document.getElementById('btn-sound').innerText = isMuted ? '🔇' : '🔊';
});

// 1. Countdown Matrix Logic
function startCountdown() {
  let count = 3;
  const numEl = document.getElementById('countdown-num');

  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      numEl.innerText = count;
      soundEngine.playChime(400 + (3 - count) * 150);
    } else {
      clearInterval(countInterval);
      switchScreen('screen-countdown', 'screen-loader');
      startLoader();
    }
  }, 1000);
}

// 2. Loader Logic (Slower, realistic scan with anticipation)
function startLoader() {
  soundEngine.startBgMusic();
  const fill = document.getElementById('progress-bar');
  const pct = document.getElementById('loader-pct');
  const status = document.getElementById('loader-status');
  let val = 0;

  const loaderInterval = setInterval(() => {
    val += 1;
    fill.style.width = val + '%';
    pct.innerText = val + '%';

    if (val === 18) {
      status.innerText = "Scanning universe for magic... ✨";
    } else if (val === 42) {
      status.innerText = "Searching for the prettiest smile... 🌸";
    } else if (val === 68) {
      status.innerText = "Calibrating heartbeat frequency... 💓";
    } else if (val === 88) {
      status.innerText = "Gathering 365 days of memories... 💌";
    }

    if (val >= 100) {
      clearInterval(loaderInterval);
      status.innerText = "Found 1 Result ❤️";
      soundEngine.playChime(800);
      const pill = document.getElementById('found-pill');
      if (pill) pill.style.display = 'inline-flex';
      setTimeout(() => {
        switchScreen('screen-loader', 'screen-envelope');
      }, 1800);
    }
  }, 85);
}

// 3. Envelope Unseal & Physical Letter Rollout Logic
window.openEnvelope = () => {
  soundEngine.playEnvelopeOpen();
  const box = document.getElementById('envelope-box');
  const paperInside = document.getElementById('envelope-paper-inside');
  const stage = document.getElementById('envelope-stage');
  const tip = document.getElementById('envelope-tip');
  const parchment = document.getElementById('letter-parchment');

  if (box.classList.contains('open')) return;

  // Step 1: Open Flap
  box.classList.add('open');
  if (tip) tip.style.opacity = '0';

  // Step 2: Paper slides up out of envelope pocket
  setTimeout(() => {
    soundEngine.playChime(650);
    if (paperInside) paperInside.classList.add('slide-up');
  }, 350);

  // Step 3: Envelope rolls down/away, full paper parchment unrolls smoothly!
  setTimeout(() => {
    soundEngine.playChime(850);
    if (stage) stage.classList.add('rolled-away');
    if (parchment) parchment.classList.add('unrolled');
  }, 780);
};

// -------------------------------------------------------------
// GOOGLE APPS SCRIPT INTEGRATION & PROPOSAL STATE TRACKER
// -------------------------------------------------------------

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWZUXMLmThXPe73JCcE-VmE9nI34-UKyWGxAzObJU4wCN0wVdxkHxGpvP1823BJOq2KA/exec";

// Response tracker across screens
const proposalData = {
  step1: "",
  step2: "",
  step3Text: ""
};

// Generic sender function to your Google Sheet
function sendPayloadToSheet(payload) {
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // Essential for Google Apps Script web apps
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "Step1_Proposal": payload.step1 || "",
      "Step2_Confirmation": payload.step2 || "",
      "Step3_Her_Custom_Message": payload.step3Text || ""
    })
  }).catch(err => console.error("Sheet logging error:", err));
}

window.sendPayloadToSheet = sendPayloadToSheet;
window.proposalData = proposalData;

// -------------------------------------------------------------
// SCREEN 1: "Happy 1st Anniversary, Madhu Bangaram!"
// -------------------------------------------------------------
let notSureDodgeCount = 0;
const notSureReplies = ["Sure? 🥺", "Nahi Na 🥺", "Pakka? 💔", "Think again! 🙈", "Ek Baar Aur 😭"];
let yesScale = 1;

function onStep1Accepted() {
  soundEngine.playChime(750);
  proposalData.step1 = "PROPOSAL ACCEPTED 💖";
  sendPayloadToSheet({
    step1: proposalData.step1,
    step2: "",
    step3Text: ""
  });
  // Transition to Screen 2
  switchScreen('screen-anniversary-card', 'screen-confirm-card');
}

function onStep1NotSureDodge(btnElement) {
  soundEngine.playBoing();
  notSureDodgeCount++;
  // Log hesitation attempt in background
  sendPayloadToSheet({
    step1: `NOT SURE (Attempt #${notSureDodgeCount})`,
    step2: "",
    step3Text: ""
  });

  const btn = btnElement || document.getElementById('btn-no');
  if (btn) {
    const offsetX = (Math.random() - 0.5) * 160;
    const offsetY = (Math.random() - 0.5) * 120;
    btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    btn.innerText = notSureReplies[notSureDodgeCount % notSureReplies.length];
  }

  const yesBtn = document.getElementById('btn-yes');
  if (yesBtn && yesScale < 1.6) {
    yesScale += 0.06;
    yesBtn.style.transform = `scale(${yesScale})`;
  }
}

window.onStep1Accepted = onStep1Accepted;
window.onStep1NotSureDodge = onStep1NotSureDodge;
window.goToConfirmProposal = onStep1Accepted;
window.dodgeNo = onStep1NotSureDodge;

// -------------------------------------------------------------
// SCREEN 2: "Did you really accept my proposal? 🥺"
// -------------------------------------------------------------
let noDodgeCount = 0;
const noReplies = ["Really? 🥺", "No way 🙈", "Are you sure? 💔", "Try again 🥺"];
let yesConfirmScale = 1;

function onStep2Confirmed() {
  soundEngine.playChime(750);
  proposalData.step2 = "YES, 100% FOREVER! 💖";
  sendPayloadToSheet({
    step1: proposalData.step1,
    step2: proposalData.step2,
    step3Text: ""
  });
  // Transition to Screen 3
  switchScreen('screen-confirm-card', 'screen-custom-message-card');
}

function onStep2NoDodge(btnElement) {
  soundEngine.playBoing();
  noDodgeCount++;
  sendPayloadToSheet({
    step1: proposalData.step1,
    step2: `NO (Attempt #${noDodgeCount})`,
    step3Text: ""
  });

  const btn = btnElement || document.getElementById('btn-no-confirm');
  if (btn) {
    const offsetX = (Math.random() - 0.5) * 160;
    const offsetY = (Math.random() - 0.5) * 120;
    btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    btn.innerText = noReplies[noDodgeCount % noReplies.length];
  }

  const yesBtn = document.getElementById('btn-yes-confirm');
  if (yesBtn && yesConfirmScale < 1.5) {
    yesConfirmScale += 0.06;
    yesBtn.style.transform = `scale(${yesConfirmScale})`;
  }
}

window.onStep2Confirmed = onStep2Confirmed;
window.onStep2NoDodge = onStep2NoDodge;
window.goToTextResponseScreen = onStep2Confirmed;
window.dodgeNoConfirm = onStep2NoDodge;

// -------------------------------------------------------------
// SCREEN 3: "Did you accept my proposal for real? 🥺" (Textarea)
// -------------------------------------------------------------
function onSubmitFinalAnswer() {
  const messageInput = document.getElementById('sweet-answer-input') || document.getElementById('user-text-response');
  const errorTip = document.getElementById('text-response-error');
  const textVal = messageInput ? messageInput.value.trim() : "";

  if (!textVal) {
    soundEngine.playBoing();
    if (errorTip) {
      errorTip.style.display = 'block';
      errorTip.classList.remove('shake-anim');
      void errorTip.offsetWidth; // trigger reflow
      errorTip.classList.add('shake-anim');
    }
    if (messageInput) messageInput.focus();
    return;
  }

  if (errorTip) errorTip.style.display = 'none';

  proposalData.step3Text = textVal;

  // Submit complete entry with her typed response
  sendPayloadToSheet(proposalData);

  // Update certificate with her typed answer
  const certRespBox = document.getElementById('cert-user-response');
  const certQuote = document.getElementById('cert-response-quote');
  if (certRespBox && certQuote) {
    certQuote.innerText = `"${textVal}"`;
    certRespBox.style.display = 'block';
  }

  // Play fanfare celebration sound
  soundEngine.playFanfare();

  // Transition to final celebration / fireworks
  switchScreen('screen-custom-message-card', 'screen-finale');

  if (particleEngine) {
    particleEngine.triggerCelebration();
  }
  
  if (typeof createParticle === "function") {
    for (let i = 0; i < 40; i++) {
      setTimeout(createParticle, i * 60);
    }
  }
}

window.onSubmitFinalAnswer = onSubmitFinalAnswer;
window.submitTextResponse = onSubmitFinalAnswer;
window.sheSaidYes = onSubmitFinalAnswer;

// Certificate Modal Viewers
window.openCertificateModal = () => {
  soundEngine.playChime(900);
  document.getElementById('cert-modal').classList.add('active');
  if (particleEngine) particleEngine.triggerCelebration();
};

window.closeCertificateModal = () => {
  document.getElementById('cert-modal').classList.remove('active');
};

function setupEventListeners() {
  // Key bindings or shortcut keys if needed
}
