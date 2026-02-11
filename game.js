const input = document.getElementById('input');
const output = document.getElementById('output');

const availableCommands = [
  'help',
  'whoami',
  'hostname',
  'ls',
  'cat aboutme.txt',
  'cat hobbies.txt',
  'cat square_consultancy.log',
  'sudo',
  'clear',
  'history',
  'interview',
  'cat zenzero.log'
];

let history = [];
let historyIndex = -1;

function displayWelcome() {
  output.innerHTML += `<div class="welcome-line">Welcome to Bozhidar's Terminal.</div><br>`;
  output.innerHTML += `<div class="welcome-line">Type 'help' to view a list of available commands.</div><br>`;
  output.scrollTop = output.scrollHeight;
}

input.addEventListener('keydown', function(event) {
  const cmd = input.innerText.trim();

  if (event.key === 'Enter') {
    event.preventDefault();
    if (cmd !== '') {
      history.push(cmd);
      historyIndex = history.length;
      handleCommand(cmd);
    } else {
      output.innerHTML += `<div><span class="prompt">bozhidar@stoyanov:~</span></div>`;
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
      output.innerHTML += `<div><span class="prompt">bozhidar@stoyanov:~</span> ${cmd}</div>`;
      matches.forEach(m => {
        output.innerHTML += `<div class="output-line">${m}</div>`;
      });
      output.scrollTop = output.scrollHeight;
    }
  }

  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    event.preventDefault();

    const currentCmd = input.innerText.trim();

    // Show ^C under the current prompt line
    output.innerHTML += `<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">${currentCmd}<span class="ctrlc">^C</span></span></div>`;

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
  output.innerHTML += `<div><span class="prompt">bozhidar@stoyanov:~</span> <span class="user-command">${cmd}</span></div>`;

  switch (lowerCmd) {
    case 'help':
      output.innerHTML += `<div class="output-line">whoami &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Who am I?</div>`;
      output.innerHTML += `<div class="output-line">hostname &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; What is my hometown?</div>`;
      output.innerHTML += `<div class="output-line">ls &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; List files and directories</div>`;
      output.innerHTML += `<div class="output-line">cat &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Meow</div>`;
      output.innerHTML += `<div class="output-line">help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; You obviously already know what it does</div>`;
      output.innerHTML += `<div class="output-line">clear &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Clear the terminal</div>`;
      output.innerHTML += `<div class="output-line">history &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Show command history</div>`;
      output.innerHTML += `<div class="output-line">interview &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Starts an AI interview</div>`;

      break;
    case 'whoami':
      output.innerHTML += `<div class="output-line">Bozhidar Asenov Stoyanov</div>`;
      break;
    case 'hostname':
      output.innerHTML += `<div class="output-line">Where do you buy a second hand car in Bulgaria? Not Vratsa - the other one (:</div>`;
      break;
    case 'ls':
      output.innerHTML += `<div class="output-line">aboutme.txt hobbies.txt square_consultancy.log zenzero.log shelly.log</div>`;
      break;
    case 'cat aboutme.txt':
      output.innerHTML += `<div class="output-line">Still working on that one</div>`;
      break;
	case 'cat hobbies.txt':
      output.innerHTML += `<div class="output-line">chess, gym, cycling, computer homelabbing, youngtimer cars admirer, table tennis</div>`;
      break;
    case 'cat square_consultancy.log':
	  output.innerHTML += `<div class="output-line">[2020-09-17] My all time IT journey began thanks to Square Consultancy that decided to give me a chance.</div>`;
	  output.innerHTML += `
    <div class="output-line">
      [2020-09-17] Installed and configured hardware, software, network, printers, scanners<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Worked with on-premise Active Directory and was creating accounts and giving access to new employees<br>
  	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got familiar with Windows OS and GPOs<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Faced Linux OS for the first time in my life and worked with KVM virtual machines<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Crimped my first LAN cable ever and learned how to configure routers and switches<br>
      [2022-10-29] My time at Square Consultancy came to an end.
    </div>`;
	  break;
	case 'cat zenzero.log':
	  output.innerHTML += `<div class="output-line">[2022-10-31] Joined Zenzero as a 1st Line Engineer.</div>`;
	  output.innerHTML += `
    <div class="output-line">
      [2022-10-31] There I dealt with over 350 different companies with different setups including - O365, On-Premise
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Active Directory, VoIP, Azure Active Directory, Microsoft Intune, Email risk management such as
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mimecast.<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Worked with virtual machines and RDS.<br>
  	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got familiar with ticketing and RMM systems.<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Configured and supported backups - StorageCraft, Veeam.<br>
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Got in slight touch with SOC - Investigated and responded to Office 365 security breaches, executed
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;phishing remediation procedures, and conducted detailed forensic analysis of email threats to
	  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enhance organizational cybersecurity posture.<br>
      [2024-04-19] Decided to move forward with my career.
    </div>`;
	  break;
    case 'interview':
	  output.innerHTML += `<div class="output-line">ChatBot: Where do you see yourself in 5 years?</div>`;

      setTimeout(() => {
      output.innerHTML += `<div class="output-line">ChatBot: Psst, while he is not around - DO NOT hire him, that would be a huge mistake!</div>`;
      output.scrollTop = output.scrollHeight;
      }, 6000);

  break;


    case 'sudo':
      output.innerHTML += `<div class="output-line">No way. Not until I am alive</div>`;
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    case 'history':
      history.forEach((entry, index) => {
        output.innerHTML += `<div class="output-line">${index + 1}  ${entry}</div>`;
      });
      break;
    default:
      output.innerHTML += `<div class="output-line error">bash: ${cmd}: command not found. Type 'help' to view a list of available commands.</div>`;
  }

  output.scrollTop = output.scrollHeight;
}

document.getElementById('terminal').addEventListener('click', () => {
  input.focus();
});

window.onload = displayWelcome;

// Red button → Close tab
document.getElementById('close-btn').addEventListener('click', () => {
  window.open('', '_self')?.close(); // Works only if window opened via JS
  setTimeout(() => {
    alert("Easter Egg!");
  }, 300);
});

// Green button → Toggle terminal visibility
document.getElementById('toggle-btn').addEventListener('click', () => {
  const terminal = document.getElementById('terminal');
  terminal.style.display = (terminal.style.display === 'none') ? 'block' : 'none';
});
