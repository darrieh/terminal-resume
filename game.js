const input = document.getElementById('input');
const output = document.getElementById('output');

const availableCommands = [
  'help',
  'whoami',
  'hostname',
  'ls',
  'cat readme.md',
  'cd projects',
  'sudo make me a sandwich',
  'clear'
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
      output.innerHTML += `<div class="output-line">whoami &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tells three names.</div>`;
      output.innerHTML += `<div class="output-line">hostname &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tells where do I come from.</div>`;
      output.innerHTML += `<div class="output-line">ls &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; shows more things about me.</div>`;
      output.innerHTML += `<div class="output-line">cat &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; read those things.</div>`;
      break;
    case 'whoami':
      output.innerHTML += `<div class="output-line">Bozhidar Asenov Stoyanov</div>`;
      break;
    case 'hostname':
      output.innerHTML += `<div class="output-line">test.local</div>`;
      break;
    case 'ls':
      output.innerHTML += `<div class="output-line">documents/  projects/  hobbies/  dreams/</div>`;
      break;
    case 'cat readme.md':
      output.innerHTML += `<div class="output-line">Hello! I'm Bob Marley, a sysadmin who loves Linux, reggae music, and solving problems with a bash script!</div>`;
      break;
    case 'cd projects':
      output.innerHTML += `<div class="output-line">Moved into /projects. Try 'ls' here!</div>`;
      break;
    case 'sudo make me a sandwich':
      output.innerHTML += `<div class="output-line">Okay. 🥪 (sudo privileges confirmed)</div>`;
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    default:
      output.innerHTML += `<div class="output-line error">bash: ${cmd}: command not found. Type 'help' to view a list of available commands.</div>`;
  }

  output.scrollTop = output.scrollHeight;
}

// Start typing whenever you click on the terminal
document.getElementById('terminal').addEventListener('click', () => {
  input.focus();
});

window.onload = displayWelcome;
