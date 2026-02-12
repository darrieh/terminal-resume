const input = document.getElementById('input');
const output = document.getElementById('output');
const sessionStart = Date.now();
let isAnimating = false;
let cmatrixInterval = null;
let cmatrixCanvas = null;
let cmatrixTimeout = null;

const availableCommands = [
  'help', 'whoami', 'hostname', 'ls',
  'cat aboutme.txt', 'cat hobbies.txt', 'cat square_consultancy.log',
  'cat zenzero.log', 'cat shelly.log',
  'sudo', 'clear', 'history', 'interview',
  'neofetch', 'contact', 'tree', 'date', 'uptime', 'download'
];

const fortunes = [
  "There are only 10 types of people in the world: those who understand binary and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
  "!false \u2014 It's funny because it's true.",
  "A programmer's wife tells him: 'Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.' He comes home with 12 loaves of bread.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "It works on my machine. \u2014 Every developer, ever.",
  "There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
  "The best thing about a boolean is that even if you're wrong, you're only off by a bit.",
  "To understand recursion, you must first understand recursion.",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "Linux is only free if your time has no value. \u2014 Jamie Zawinski",
  "// This code works. I don't know why.",
  "Chuck Norris can unit test an entire application with a single assert."
];

let history = [];
let historyIndex = -1;

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm ' + (seconds % 60) + 's';
  if (minutes > 0) return minutes + 'm ' + (seconds % 60) + 's';
  return seconds + 's';
}

function displayWelcome() {
  output.innerHTML += '<div class="welcome-line">Welcome to Bozhidar\'s Terminal.</div><br>';
  output.innerHTML += '<div class="welcome-line">Type \'help\' to view a list of available commands.</div><br>';
  output.scrollTop = output.scrollHeight;
}

input.addEventListener('keydown', function(event) {
  if (isAnimating) {
    if (event.key === 'Escape' || event.key === 'q' || event.key === 'c') {
      stopCmatrix();
    }
    event.preventDefault();
    return;
  }

  const cmd = input.innerText.trim();

  if (event.key === 'Enter') {
    event.preventDefault();
    if (cmd !== '') {
      history.push(cmd);
      historyIndex = history.length;
      handleCommand(cmd);
    } else {
      output.innerHTML += '<div><span class="prompt">bozhidar@stoyanov:~</span></div>';
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

    const matches = availableCommands.filter(c => c.startsWith(cmd));
    if (matches.length === 1) {
      input.innerText = matches[0];
      placeCaretAtEnd(input);
    } else if (matches.length > 1) {
      output.innerHTML += '<div><span class="prompt">bozhidar@stoyanov:~</span> ' + cmd + '</div>';
      matches.forEach(m => {
        output.innerHTML += '<div class="output-line">' + m + '</div>';
      });
      output.scrollTop = output.scrollHeight;
    }
  }

  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    event.preventDefault();

    const currentCmd = input.innerText.trim();

    output.innerHTML += '<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">' + currentCmd + '<span class="ctrlc">^C</span></span></div>';

    input.innerText = '';
    input.focus();
    output.scrollTop = output.scrollHeight;
  }
});

function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function handleCommand(cmd) {
  const lowerCmd = cmd.trim().toLowerCase();
  output.innerHTML += '<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">' + cmd + '</span></div>';

  switch (lowerCmd) {
    case 'help':
      output.innerHTML += '<div class="output-line">whoami             Who am I?</div>';
      output.innerHTML += '<div class="output-line">hostname           What is my hometown?</div>';
      output.innerHTML += '<div class="output-line">ls                 List files and directories</div>';
      output.innerHTML += '<div class="output-line">cat &lt;file&gt;         Read a file</div>';
      output.innerHTML += '<div class="output-line">tree               Show directory structure</div>';
      output.innerHTML += '<div class="output-line">neofetch           Display system info &amp; skills</div>';
      output.innerHTML += '<div class="output-line">contact            Show contact information</div>';
      output.innerHTML += '<div class="output-line">download           Download my resume</div>';
      output.innerHTML += '<div class="output-line">date               Show current date and time</div>';
      output.innerHTML += '<div class="output-line">uptime             Show session uptime</div>';
      output.innerHTML += '<div class="output-line">interview          Start an AI interview</div>';
      output.innerHTML += '<div class="output-line">help               You obviously already know what it does</div>';
      output.innerHTML += '<div class="output-line">clear              Clear the terminal</div>';
      output.innerHTML += '<div class="output-line">history            Show command history</div>';
      break;

    case 'whoami':
      output.innerHTML += '<div class="output-line">Bozhidar Asenov Stoyanov</div>';
      break;

    case 'hostname':
      output.innerHTML += '<div class="output-line">Where do you buy a second hand car in Bulgaria? Not Vratsa - the other one (:</div>';
      break;

    case 'ls':
      output.innerHTML += '<div class="output-line">aboutme.txt hobbies.txt square_consultancy.log zenzero.log shelly.log</div>';
      break;

    case 'cat aboutme.txt':
      output.innerHTML += '<div class="output-line">Still working on that one</div>';
      break;

    case 'cat hobbies.txt':
      output.innerHTML += '<div class="output-line">chess, gym, cycling, computer homelabbing, youngtimer cars admirer, table tennis</div>';
      break;

    case 'cat square_consultancy.log':
      output.innerHTML += '<div class="output-line">[2020-09-17] My all time IT journey began thanks to Square Consultancy that decided to give me a chance.</div>';
      output.innerHTML +=
        '<div class="output-line">' +
        '[2020-09-17] Installed and configured hardware, software, network, printers, scanners<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Worked with on-premise Active Directory and was creating accounts and giving access to new employees<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got familiar with Windows OS and GPOs<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Faced Linux OS for the first time in my life and worked with KVM virtual machines<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Crimped my first LAN cable ever and learned how to configure routers and switches<br>' +
        '[2022-10-29] My time at Square Consultancy came to an end.' +
        '</div>';
      break;

    case 'cat zenzero.log':
      output.innerHTML += '<div class="output-line">[2022-10-31] Joined Zenzero as a 1st Line Engineer.</div>';
      output.innerHTML +=
        '<div class="output-line">' +
        '[2022-10-31] There I dealt with over 350 different companies with different setups including - O365, On-Premise' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Active Directory, VoIP, Azure Active Directory, Microsoft Intune, Email risk management such as' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mimecast.<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Worked with virtual machines and RDS.<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got familiar with ticketing and RMM systems.<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Configured and supported backups - StorageCraft, Veeam.<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got in slight touch with SOC - Investigated and responded to Office 365 security breaches, executed' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;phishing remediation procedures, and conducted detailed forensic analysis of email threats to' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enhance organizational cybersecurity posture.<br>' +
        '[2024-04-19] Decided to move forward with my career.' +
        '</div>';
      break;

    case 'cat shelly.log':
      output.innerHTML += '<div class="output-line">[2024-XX-XX] Started tinkering with Shelly smart home devices as part of my homelab.</div>';
      output.innerHTML +=
        '<div class="output-line">' +
        '[2024-XX-XX] Configured Shelly devices for home automation<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Integrated with local network infrastructure<br>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Explored IoT protocols and device management<br>' +
        '[Present] Ongoing project...' +
        '</div>';
      break;

    case 'interview':
      output.innerHTML += '<div class="output-line">ChatBot: Where do you see yourself in 5 years?</div>';
      setTimeout(function() {
        output.innerHTML += '<div class="output-line">ChatBot: Psst, while he is not around - DO NOT hire him, that would be a huge mistake!</div>';
        output.scrollTop = output.scrollHeight;
      }, 6000);
      break;

    case 'neofetch': {
      var up = formatUptime(Date.now() - sessionStart);
      var tuxArt = [
        "        .--.        ",
        "       |o_o |       ",
        "       |:_/ |       ",
        "      //   \\ \\      ",
        "     (|     | )     ",
        "    /'\\_   _/`\\     ",
        "    \\___)=(___/     ",
        "                    ",
        "                    ",
        "                    ",
        "                    "
      ];
      var infoLines = [
        '<span class="neo-label">bozhidar</span>@<span class="neo-label">stoyanov</span>',
        '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
        '<span class="neo-label">Role:</span> IT Engineer',
        '<span class="neo-label">Location:</span> Bulgaria',
        '<span class="neo-label">Uptime:</span> ' + up,
        '<span class="neo-label">Skills:</span> O365, Azure AD, Intune',
        '<span class="neo-label">Networking:</span> Routers, Switches, VPN',
        '<span class="neo-label">Virtualization:</span> KVM, RDS, Veeam',
        '<span class="neo-label">OS:</span> Windows, Linux',
        '<span class="neo-label">Security:</span> SOC, Phishing Remediation',
        '<span class="neo-label">Tools:</span> StorageCraft, Mimecast'
      ];
      var neoHtml = '<pre class="neofetch">';
      for (var i = 0; i < tuxArt.length; i++) {
        neoHtml += '<span class="neo-art">' + tuxArt[i] + '</span> ' + infoLines[i] + '\n';
      }
      neoHtml += '</pre>';
      output.innerHTML += neoHtml;
      break;
    }

    case 'contact':
      output.innerHTML += '<div class="output-line">&nbsp;</div>';
      output.innerHTML += '<div class="output-line">  <span class="neo-label">Email:</span>    <a class="contact-link" href="mailto:your.email@example.com">your.email@example.com</a></div>';
      output.innerHTML += '<div class="output-line">  <span class="neo-label">LinkedIn:</span> <a class="contact-link" href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener">linkedin.com/in/yourprofile</a></div>';
      output.innerHTML += '<div class="output-line">  <span class="neo-label">GitHub:</span>   <a class="contact-link" href="https://github.com/darrieh" target="_blank" rel="noopener">github.com/darrieh</a></div>';
      output.innerHTML += '<div class="output-line">&nbsp;</div>';
      break;

    case 'tree':
      output.innerHTML +=
        '<pre class="output-line" style="margin:5px 0;">' +
        '.\n' +
        '\u251C\u2500\u2500 aboutme.txt\n' +
        '\u251C\u2500\u2500 hobbies.txt\n' +
        '\u251C\u2500\u2500 square_consultancy.log\n' +
        '\u251C\u2500\u2500 zenzero.log\n' +
        '\u2514\u2500\u2500 shelly.log\n' +
        '\n' +
        '0 directories, 5 files' +
        '</pre>';
      break;

    case 'date':
      output.innerHTML += '<div class="output-line">' + new Date().toString() + '</div>';
      break;

    case 'uptime': {
      var elapsed = Date.now() - sessionStart;
      var upStr = formatUptime(elapsed);
      var now = new Date();
      var timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      output.innerHTML += '<div class="output-line"> ' + timeStr + ' up ' + upStr + ', 1 user, load average: 0.42, 0.17, 0.08</div>';
      break;
    }

    case 'download':
    case 'wget resume.pdf': {
      output.innerHTML += '<div class="output-line">Downloading Bozhidar_Stoyanov_Resume.pdf...</div>';
      var a = document.createElement('a');
      a.href = 'resume.pdf';
      a.download = 'Bozhidar_Stoyanov_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      output.innerHTML += '<div class="output-line">If the download didn\'t start, make sure resume.pdf exists in the project root.</div>';
      break;
    }

    case 'fortune':
      output.innerHTML += '<div class="output-line">' + fortunes[Math.floor(Math.random() * fortunes.length)] + '</div>';
      break;

    case 'cmatrix':
      startCmatrix();
      break;

    case 'sudo rm -rf /':
      startRmRf();
      break;

    case 'rm -rf /':
      output.innerHTML += '<div class="output-line error">rm: cannot remove \'/\': Permission denied. Nice try ;)</div>';
      break;

    case 'sudo':
      output.innerHTML += '<div class="output-line">No way. Not until I am alive</div>';
      break;

    case 'clear':
      output.innerHTML = '';
      break;

    case 'history':
      history.forEach(function(entry, index) {
        output.innerHTML += '<div class="output-line">' + (index + 1) + '  ' + entry + '</div>';
      });
      break;

    default:
      output.innerHTML += '<div class="output-line error">bash: ' + cmd + ': command not found. Type \'help\' to view a list of available commands.</div>';
  }

  output.scrollTop = output.scrollHeight;
}

// --- Easter Egg: cmatrix ---

function startCmatrix() {
  isAnimating = true;
  var terminal = document.getElementById('terminal');

  var canvas = document.createElement('canvas');
  cmatrixCanvas = canvas;
  canvas.width = terminal.clientWidth;
  canvas.height = terminal.clientHeight;
  canvas.style.cssText = 'position:absolute;top:0;left:0;z-index:10;';

  terminal.style.position = 'relative';
  terminal.appendChild(canvas);

  document.getElementById('input-line').style.visibility = 'hidden';
  document.getElementById('output').style.visibility = 'hidden';

  var ctx = canvas.getContext('2d');
  var fontSize = 14;
  var columns = Math.floor(canvas.width / fontSize);
  var drops = [];
  for (var i = 0; i < columns; i++) drops[i] = Math.floor(Math.random() * -20);
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cmatrixInterval = setInterval(function() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (var i = 0; i < drops.length; i++) {
      var char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 50);

  cmatrixTimeout = setTimeout(function() {
    stopCmatrix();
  }, 6000);
}

function stopCmatrix() {
  if (cmatrixInterval) {
    clearInterval(cmatrixInterval);
    cmatrixInterval = null;
  }
  if (cmatrixTimeout) {
    clearTimeout(cmatrixTimeout);
    cmatrixTimeout = null;
  }
  if (cmatrixCanvas) {
    cmatrixCanvas.remove();
    cmatrixCanvas = null;
  }
  document.getElementById('input-line').style.visibility = 'visible';
  document.getElementById('output').style.visibility = 'visible';
  isAnimating = false;
  input.focus();
}

// --- Easter Egg: sudo rm -rf / ---

function startRmRf() {
  isAnimating = true;
  input.contentEditable = 'false';

  var files = [
    '/usr/bin/cat', '/usr/bin/ls', '/usr/bin/bash',
    '/etc/passwd', '/etc/hosts', '/var/log/syslog',
    '/home/bozhidar/aboutme.txt', '/home/bozhidar/hobbies.txt',
    '/home/bozhidar/.bashrc', '/boot/vmlinuz',
    '/usr/lib/libc.so.6', '/bin/sh'
  ];

  output.innerHTML += '<div class="output-line" style="color:#ff4d4d;">rm: it is dangerous to operate recursively on \'/\'</div>';
  output.innerHTML += '<div class="output-line" style="color:#ff4d4d;">rm: and YOU JUST DID IT. Deleting everything...</div>';
  output.scrollTop = output.scrollHeight;

  var i = 0;
  var deleteInterval = setInterval(function() {
    if (i < files.length) {
      output.innerHTML += '<div class="output-line" style="color:#ff4d4d;">removing \'' + files[i] + '\'...</div>';
      output.scrollTop = output.scrollHeight;
      i++;
    } else {
      clearInterval(deleteInterval);
      output.innerHTML += '<div class="output-line" style="color:#ff4d4d;">rm: cannot remove \'/\': Device or resource busy</div>';
      output.scrollTop = output.scrollHeight;

      setTimeout(function() {
        document.body.style.transition = 'opacity 1.5s';
        document.body.style.opacity = '0';

        setTimeout(function() {
          document.body.innerHTML =
            '<div style="color:#ff4d4d;font-family:\'Courier New\',monospace;padding:40px;font-size:18px;background:#000;height:100vh;">' +
            'Kernel panic - not syncing: Attempted to kill init!<br><br>' +
            'CPU: 0 PID: 1 Comm: systemd Not tainted<br>' +
            'Hardware name: Bozhidar\'s Resume Terminal<br><br>' +
            '---[ end Kernel panic - not syncing: Attempted to kill init! ]---<br><br>' +
            '<span style="color:#888;">Rebooting in 3 seconds...</span>' +
            '</div>';
          document.body.style.opacity = '1';
          document.body.style.backgroundColor = '#000';

          setTimeout(function() {
            location.reload();
          }, 3000);
        }, 1500);
      }, 500);
    }
  }, 150);
}

// --- Event Listeners ---

document.getElementById('terminal').addEventListener('click', function() {
  input.focus();
});

window.onload = displayWelcome;

// Red button -> Close tab
document.getElementById('close-btn').addEventListener('click', function() {
  window.open('', '_self')?.close();
  setTimeout(function() {
    alert("Easter Egg!");
  }, 300);
});

// Green button -> Toggle terminal visibility
document.getElementById('toggle-btn').addEventListener('click', function() {
  var terminal = document.getElementById('terminal');
  terminal.style.display = (terminal.style.display === 'none') ? 'block' : 'none';
});
