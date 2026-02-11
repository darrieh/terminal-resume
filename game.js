const input = document.getElementById('input');
const output = document.getElementById('output');
const startTime = Date.now();

let isTyping = false;
let interviewMode = false;
let interviewStep = 0;
let history = [];
let historyIndex = -1;

const availableCommands = [
  'help', 'whoami', 'hostname', 'ls',
  'cat aboutme.txt', 'cat hobbies.txt',
  'cat square_consultancy.log', 'cat zenzero.log', 'cat shelly.log',
  'sudo', 'clear', 'history', 'interview',
  'contact', 'date', 'uptime', 'fortune',
  'rm -rf /', 'download resume'
];

const fortunes = [
  "There are only 10 types of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, sees two tables, and asks: 'Can I join you?'",
  "// This code works. Don't ask me why.",
  "It's not a bug, it's an undocumented feature.",
  "The best thing about a boolean is even if you're wrong, you're only off by a bit.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "A programmer's wife says: 'Get bread. If they have eggs, get a dozen.' He returns with 12 loaves.",
  "!false — it's funny because it's true.",
  "There are two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
  "The cloud is just someone else's computer.",
  "The first 90% of the code takes 90% of the time. The remaining 10% takes the other 90%.",
  "If debugging is removing bugs, then programming must be putting them in.",
  "sudo make me a sandwich.",
  "I'd tell you a UDP joke, but you might not get it.",
  "To understand recursion, you must first understand recursion."
];

const interviewQuestions = [
  {
    question: "Where do you see yourself in 5 years?",
    responses: [
      "Interesting... very diplomatic. HR would love you.",
      "Bold answer. I'll pretend I didn't hear that.",
      "That's exactly what the last candidate said. They're still in the waiting room."
    ]
  },
  {
    question: "What is your greatest weakness?",
    responses: [
      "Hmm, that's either very honest or very rehearsed.",
      "At least you didn't say 'I work too hard'. Points for creativity.",
      "Noted. We'll use that against you later in the process."
    ]
  },
  {
    question: "Describe yourself in three words.",
    responses: [
      "That's... technically words. I'll allow it.",
      "Shakespeare couldn't have said it better. Well, he probably could have.",
      "Adding that to your permanent file right now..."
    ]
  },
  {
    question: "Why should we hire Bozhidar?",
    responses: [
      "Compelling argument! But the real question is... can he fix the printer?",
      "You make a strong case. We'll take it under advisement.",
      "Hmm, even ChatGPT couldn't have answered that better."
    ]
  }
];

// ─── Utilities ───

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setPromptMode(mode) {
  const promptEl = document.querySelector('#input-line .prompt');
  if (mode === 'interview') {
    promptEl.textContent = 'interview';
    promptEl.classList.add('interview-prompt');
  } else {
    promptEl.textContent = 'bozhidar@stoyanov:~';
    promptEl.classList.remove('interview-prompt');
  }
}

// ─── Typing Engine ───

async function typeLine(text, className, speed) {
  className = className || 'output-line';
  speed = speed || 15;
  const div = document.createElement('div');
  div.className = className;
  output.appendChild(div);

  for (let i = 0; i < text.length; i++) {
    div.textContent += text[i];
    output.scrollTop = output.scrollHeight;
    await sleep(speed);
  }
  return div;
}

function printLine(text, className) {
  className = className || 'output-line';
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
  return div;
}

function printHTML(html) {
  output.innerHTML += html;
  output.scrollTop = output.scrollHeight;
}

function printPrompt(cmd) {
  printHTML(
    '<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">' +
    escapeHTML(cmd) +
    '</span></div>'
  );
}

function printInterviewPrompt(cmd) {
  printHTML(
    '<div><span class="prompt interview-prompt">interview</span> <span class="user-command">' +
    escapeHTML(cmd) +
    '</span></div>'
  );
}

async function typeLines(lines, speed) {
  speed = speed || 15;
  isTyping = true;
  input.contentEditable = 'false';

  try {
    for (let i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (typeof line === 'string') {
        await typeLine(line, 'output-line', speed);
      } else if (line.text !== undefined) {
        await typeLine(line.text, line.className || 'output-line', line.speed || speed);
      } else if (line.html !== undefined) {
        printHTML(line.html);
        if (line.delay) await sleep(line.delay);
      } else if (line.delay !== undefined) {
        await sleep(line.delay);
      } else if (line.action) {
        await line.action();
      }
    }
  } finally {
    isTyping = false;
    input.contentEditable = 'true';
    input.focus();
  }
}

// ─── Welcome ───

function displayWelcome() {
  typeLines([
    { text: "Welcome to Bozhidar's Terminal.", className: 'welcome-line' },
    { html: '<br>' },
    { text: "Type 'help' to view a list of available commands.", className: 'welcome-line' },
    { html: '<br>' }
  ]);
}

// ─── Input Handler ───

input.addEventListener('keydown', function(event) {
  if (isTyping) {
    event.preventDefault();
    return;
  }

  var cmd = input.innerText.trim();

  if (event.key === 'Enter') {
    event.preventDefault();
    if (cmd !== '') {
      history.push(cmd);
      historyIndex = history.length;
      if (interviewMode) {
        handleInterviewResponse(cmd);
      } else {
        handleCommand(cmd);
      }
    } else {
      if (interviewMode) {
        printHTML('<div><span class="prompt interview-prompt">interview</span></div>');
      } else {
        printHTML('<div><span class="prompt">bozhidar@stoyanov:~</span></div>');
      }
    }
    input.innerText = '';
  }

  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (history.length > 0 && historyIndex > 0) {
      historyIndex--;
      input.innerText = history[historyIndex];
      placeCaretAtEnd(input);
    }
  }

  else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (history.length > 0 && historyIndex < history.length - 1) {
      historyIndex++;
      input.innerText = history[historyIndex];
    } else {
      input.innerText = '';
      historyIndex = history.length;
    }
    placeCaretAtEnd(input);
  }

  else if (event.key === 'Tab') {
    event.preventDefault();
    if (cmd.length === 0) return;

    var matches = availableCommands.filter(function(c) { return c.startsWith(cmd); });
    if (matches.length === 1) {
      input.innerText = matches[0];
      placeCaretAtEnd(input);
    } else if (matches.length > 1) {
      printPrompt(cmd);
      matches.forEach(function(m) { printLine(m); });
    }
  }

  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    event.preventDefault();
    var currentCmd = input.innerText.trim();

    if (interviewMode) {
      printHTML(
        '<div><span class="prompt interview-prompt">interview</span> <span class="user-command">' +
        escapeHTML(currentCmd) +
        '<span class="ctrlc">^C</span></span></div>'
      );
      interviewMode = false;
      interviewStep = 0;
      setPromptMode('normal');
      printLine('Interview cancelled.', 'output-line');
    } else {
      printHTML(
        '<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">' +
        escapeHTML(currentCmd) +
        '<span class="ctrlc">^C</span></span></div>'
      );
    }

    input.innerText = '';
    input.focus();
    output.scrollTop = output.scrollHeight;
  }
});

// ─── Command Handler ───

async function handleCommand(cmd) {
  var lowerCmd = cmd.trim().toLowerCase();
  printPrompt(cmd);

  switch (lowerCmd) {
    case 'help':
      await typeLines([
        'Available commands:',
        { html: '<br>' },
        '  whoami              Who am I?',
        '  hostname            What is my hometown?',
        '  ls                  List files and directories',
        '  cat <file>          View file contents',
        '  contact             Get in touch with me',
        '  date                Show current date and time',
        '  uptime              How long have you been here?',
        '  fortune             Get a random tech joke',
        '  download resume     Download my resume as PDF',
        '  interview           Start an interactive AI interview',
        '  history             Show command history',
        '  clear               Clear the terminal',
        '  help                Show this help message',
      ], 8);
      break;

    case 'whoami':
      await typeLines(['Bozhidar Asenov Stoyanov']);
      break;

    case 'hostname':
      await typeLines(['Where do you buy a second hand car in Bulgaria? Not Vratsa - the other one (:']);
      break;

    case 'ls':
      await typeLines(['aboutme.txt  hobbies.txt  square_consultancy.log  zenzero.log  shelly.log']);
      break;

    case 'cat aboutme.txt':
      await typeLines(['Still working on that one']);
      break;

    case 'cat hobbies.txt':
      await typeLines(['chess, gym, cycling, computer homelabbing, youngtimer cars admirer, table tennis']);
      break;

    case 'cat square_consultancy.log':
      await typeLines([
        '[2020-09-17] My all time IT journey began thanks to Square Consultancy.',
        '[2020-09-17] Installed and configured hardware, software, network, printers, scanners',
        '             Worked with on-premise Active Directory, creating accounts and managing access',
        '             Got familiar with Windows OS and GPOs',
        '             Faced Linux OS for the first time and worked with KVM virtual machines',
        '             Crimped my first LAN cable and learned to configure routers and switches',
        '[2022-10-29] My time at Square Consultancy came to an end.'
      ], 10);
      break;

    case 'cat zenzero.log':
      await typeLines([
        '[2022-10-31] Joined Zenzero as a 1st Line Engineer.',
        '[2022-10-31] Dealt with 350+ companies with setups including:',
        '             O365, On-Premise AD, VoIP, Azure AD, Microsoft Intune, Mimecast',
        '             Worked with virtual machines and RDS',
        '             Got familiar with ticketing and RMM systems',
        '             Configured and supported backups - StorageCraft, Veeam',
        '             Got in touch with SOC - Investigated O365 security breaches,',
        '             executed phishing remediation, conducted forensic analysis',
        '             of email threats to enhance organizational cybersecurity posture',
        '[2024-04-19] Decided to move forward with my career.'
      ], 10);
      break;

    case 'cat shelly.log':
      await typeLines(['[ACCESS DENIED] This file is classified. Try again with sudo... just kidding, sudo is disabled too.']);
      break;

    case 'contact':
      await typeLines([
        { text: "Let's get in touch:", speed: 18 },
        { html: '<br>' },
        { html: '<div class="output-line">  Email:    <a href="mailto:your@email.com" class="terminal-link">your@email.com</a></div>', delay: 150 },
        { html: '<div class="output-line">  GitHub:   <a href="https://github.com/darrieh" target="_blank" class="terminal-link">github.com/darrieh</a></div>', delay: 150 },
        { html: '<div class="output-line">  LinkedIn: <a href="https://linkedin.com/in/yourprofile" target="_blank" class="terminal-link">linkedin.com/in/yourprofile</a></div>', delay: 150 },
      ]);
      break;

    case 'date':
      await typeLines([new Date().toString()]);
      break;

    case 'uptime': {
      var elapsed = Date.now() - startTime;
      var totalSeconds = Math.floor(elapsed / 1000);
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;
      var parts = [];
      if (hours > 0) parts.push(hours + 'h');
      if (minutes > 0 || hours > 0) parts.push(minutes + 'm');
      parts.push(seconds + 's');
      var uptimeStr = parts.join(' ');
      await typeLines([
        'Session uptime: ' + uptimeStr,
        "You've been exploring this terminal for " + uptimeStr + '. Time flies when you\'re having fun!'
      ]);
      break;
    }

    case 'fortune':
      await typeLines([
        { html: '<br>' },
        { text: '  " ' + fortunes[Math.floor(Math.random() * fortunes.length)] + ' "', className: 'fortune-text' },
        { html: '<br>' },
      ]);
      break;

    case 'download resume':
    case 'download':
    case 'wget resume.pdf':
      await typeLines([
        'Connecting to bozhidar-stoyanov.dev... connected.',
        { delay: 400 },
        'HTTP request sent, awaiting response... 200 OK',
        { delay: 300 },
        { text: '████████████████████████████████ 100%', speed: 25 },
        { delay: 200 },
        'resume.pdf saved. Check your downloads folder!',
        {
          action: function() {
            var link = document.createElement('a');
            link.href = 'resume.pdf';
            link.download = 'Bozhidar_Stoyanov_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      ]);
      break;

    case 'rm -rf /':
      await rmrfAnimation();
      break;

    case 'interview':
      interviewMode = true;
      interviewStep = 0;
      setPromptMode('interview');
      await typeLines([
        '┌─────────────────────────────────────────┐',
        '│       INTERACTIVE INTERVIEW MODE         │',
        '│   Type your answers. Ctrl+C to quit.     │',
        '└─────────────────────────────────────────┘',
        { html: '<br>' },
        { text: 'Interviewer (1/' + interviewQuestions.length + '): ' + interviewQuestions[0].question, className: 'interview-question', speed: 20 },
      ]);
      break;

    case 'sudo':
      await typeLines(['No way. Not until I am alive']);
      break;

    case 'clear':
      output.innerHTML = '';
      break;

    case 'history':
      await typeLines(
        history.map(function(entry, i) { return '  ' + (i + 1) + '  ' + entry; }),
        5
      );
      break;

    default:
      await typeLines([
        { text: 'bash: ' + cmd + ': command not found. Type \'help\' for available commands.', className: 'output-line error' }
      ]);
  }
}

// ─── Interview Handler ───

async function handleInterviewResponse(cmd) {
  printInterviewPrompt(cmd);

  var q = interviewQuestions[interviewStep];
  var response = q.responses[Math.floor(Math.random() * q.responses.length)];

  await typeLines([
    { html: '<br>' },
    { text: 'Interviewer: ' + response, className: 'interview-response', speed: 20 },
    { html: '<br>' },
  ]);

  interviewStep++;

  if (interviewStep < interviewQuestions.length) {
    await typeLines([
      {
        text: 'Interviewer (' + (interviewStep + 1) + '/' + interviewQuestions.length + '): ' + interviewQuestions[interviewStep].question,
        className: 'interview-question',
        speed: 20
      },
    ]);
  } else {
    await typeLines([
      { delay: 800 },
      { text: 'Interviewer: Thank you for your time. Let me review my notes...', className: 'interview-question', speed: 25 },
      { delay: 1500 },
      { text: 'Interviewer: After careful evaluation...', className: 'interview-question', speed: 30 },
      { delay: 1500 },
      { text: "Interviewer: We've decided to hire Bozhidar. You were just here for moral support.", className: 'interview-response', speed: 20 },
      { html: '<br>' },
      '┌─────────────────────────────────────────┐',
      '│          INTERVIEW COMPLETE              │',
      '└─────────────────────────────────────────┘',
    ]);
    interviewMode = false;
    interviewStep = 0;
    setPromptMode('normal');
  }
}

// ─── rm -rf / Easter Egg ───

async function rmrfAnimation() {
  var fakeFiles = [
    '/bin/bash', '/etc/passwd', '/usr/lib/libc.so', '/var/log/syslog',
    '/home/bozhidar/.bashrc', '/boot/vmlinuz', '/dev/null',
    '/usr/share/fonts/', '/tmp/*', '/opt/lampp/',
    '/root/.ssh/', '/sys/kernel/', '/proc/cpuinfo',
    '/home/bozhidar/resume.pdf', '/home/bozhidar/.vimrc',
    '/usr/bin/sudo', '/etc/shadow'
  ];

  isTyping = true;
  input.contentEditable = 'false';

  try {
    for (var i = 0; i < fakeFiles.length; i++) {
      await typeLine('removing ' + fakeFiles[i] + '...', 'output-line error', 6);
      await sleep(60);
    }

    await sleep(400);

    // Glitch effect — scramble existing terminal content
    var glitchChars = '█▓▒░╔╗╚╝║═@#$%&*!?<>{}[]';
    var allDivs = output.querySelectorAll('div');

    for (var round = 0; round < 4; round++) {
      for (var j = 0; j < allDivs.length; j++) {
        if (Math.random() > 0.4 && allDivs[j].textContent.length > 0) {
          var glitched = '';
          for (var k = 0; k < allDivs[j].textContent.length; k++) {
            glitched += Math.random() > 0.3
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : allDivs[j].textContent[k];
          }
          allDivs[j].textContent = glitched;
        }
      }
      await sleep(180);
    }

    await sleep(300);

    // Fade to black — remove lines one by one from top
    var remaining = output.querySelectorAll('div');
    for (var r = 0; r < remaining.length; r++) {
      remaining[r].style.opacity = '0';
      if (r % 3 === 0) await sleep(20);
    }

    await sleep(600);
    output.innerHTML = '';
    await sleep(1200);

    // Recovery
    await typeLine('kernel panic - not syncing: VFS: Unable to mount root fs', 'output-line error', 20);
    await sleep(1000);
    await typeLine('...', 'output-line', 200);
    await sleep(800);
    await typeLine('Just kidding. Everything is fine. Probably.', 'welcome-line', 25);
    await sleep(400);
    await typeLine("Type 'help' to continue.", 'welcome-line', 20);
  } finally {
    isTyping = false;
    input.contentEditable = 'true';
    input.focus();
  }
}

// ─── Terminal Chrome ───

document.getElementById('terminal').addEventListener('click', function() {
  if (!isTyping) input.focus();
});

window.onload = displayWelcome;

document.getElementById('close-btn').addEventListener('click', function() {
  window.open('', '_self')?.close();
  setTimeout(function() {
    alert('Easter Egg!');
  }, 300);
});

document.getElementById('toggle-btn').addEventListener('click', function() {
  var terminal = document.getElementById('terminal');
  terminal.style.display = (terminal.style.display === 'none') ? 'block' : 'none';
});
