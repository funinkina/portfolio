(function () {
  var PROJECTS = [
    { name: 'spectacle-ocr-screenshot', desc: 'C++/Qt OCR & QR tool for KDE · ⭐89' },
    { name: 'deadenv',                  desc: 'Go CLI secrets manager, AES-256-GCM · ⭐15' },
    { name: 'weekly-commits',           desc: 'GNOME top-bar GitHub activity · ⭐27' },
    { name: 'bloop',                    desc: 'WhatsApp chat analyzer' },
    { name: 'query-md',                 desc: 'Markdown query engine' },
    { name: 'dem-super-resolution',     desc: 'Deep learning super-resolution' },
    { name: 'gnome-ocr-screenshot',     desc: 'GNOME OCR screenshot integration' },
    { name: 'rsync-backup',             desc: 'Automated rsync backup utility' },
  ];

  var BLOG = [
    'How I Became a Linux Kernel Contributor',
    'Debugging a Printer Driver for Linux',
    'Terminal Emulator Under the Hood',
    'Explaining Inodes',
    'Analyzing the MCP Hype',
    'Building OCR in Plasma\'s Spectacle',
    'Audio Formats: A Primer',
    'DeepSeek on a Raspberry Pi',
  ];

  function lines() {
    return Array.prototype.slice.call(arguments);
  }

  var COMMANDS = {
    help: function () {
      return lines(
        'available commands:',
        '',
        '  whoami          — who built this',
        '  ls              — list sections',
        '  ls projects     — list projects',
        '  ls blog         — recent posts',
        '  skills          — tech stack',
        '  cat resume      — work experience',
        '  open <path>     — navigate  (e.g. open /blog)',
        '  clear           — clear terminal',
        '  exit  /  q      — close'
      );
    },

    whoami: function () {
      return lines(
        'Aryan K. (funinkina)',
        'Systems & Backend Engineer · Bangalore, India',
        'Final-year CS undergrad · 250+ GitHub stars',
        '',
        'Currently: Backend Intern @ SuperDash',
        '→ https://funinkina.co.in'
      );
    },

    ls: function (arg) {
      if (arg === 'projects') {
        return ['projects/'].concat(
          PROJECTS.map(function (p) { return '  ' + p.name + '   ' + p.desc; })
        );
      }
      if (arg === 'blog') {
        return ['blog/'].concat(
          BLOG.map(function (b, i) { return '  ' + (i + 1) + '.  ' + b; })
        );
      }
      return lines('blog/   projects/   tags/');
    },

    skills: function () {
      return lines(
        'languages:   Go · Python · C++ · TypeScript · Bash',
        'backend:     FastAPI · WebSockets · gRPC · REST',
        'infra:       AWS · GCP · Docker · PostgreSQL · Redis',
        'systems:     Linux · Qt · Tesseract · GNOME Shell',
        'ai/ml:       PyTorch · TTS models · LLM pipelines'
      );
    },

    resume: function () {
      return lines(
        '=== EXPERIENCE ===',
        '',
        'Backend Engineer Intern  ·  SuperDash  ·  Jun 2025–',
        '  · Cut call latency 500ms → 100ms  (80% reduction)',
        '  · Migrated SQS → EventBridge, -60% cloud cost',
        '  · TTS inference: 1000ms → <200ms  (5× speedup)',
        '',
        'Python Developer Intern  ·  Weya.ai  ·  Dec–Feb 2025',
        '  · 100+ concurrent WebSocket connections',
        '  · Built Calendar / Meet / WhatsApp integrations',
        '',
        'Research Intern  ·  NIT Jalandhar  ·  May–Jul 2024',
        '  · 95% accuracy on waterborne disease prediction',
        '  · Co-authored peer-reviewed indexed journal paper',
        '',
        '=== EDUCATION ===',
        '',
        'B.Tech Computer Science  ·  2021–2025',
        'Amazon ML Summer School 2024  (selected from 1M+ applicants)'
      );
    },

    open: function (path) {
      if (!path) return lines('usage:  open <path>   e.g.  open /blog');
      var dest = path.startsWith('/') ? path : '/' + path;
      setTimeout(function () { window.location.href = dest; }, 300);
      return lines('navigating to ' + dest + ' ...');
    },

    clear:  function () { return '__CLEAR__'; },
    exit:   function () { return '__EXIT__'; },
    q:      function () { return '__EXIT__'; },
  };

  var overlay   = document.getElementById('terminal-overlay');
  var input     = document.getElementById('terminal-input');
  var output    = document.getElementById('terminal-output');
  var closeBtn  = document.getElementById('terminal-close-btn');

  if (!overlay || !input || !output || !closeBtn) return;

  var cmdHistory = [];
  var histIdx    = -1;

  function openTerminal() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.focus();
    if (!output.children.length) {
      appendLines([
        "funinkina's corner  v1.0.0",
        "type 'help' for available commands",
        '',
      ]);
    }
  }

  function closeTerminal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function appendLines(arr) {
    arr.forEach(function (line) {
      var p = document.createElement('p');
      p.textContent = line;
      output.appendChild(p);
    });
    var body = output.parentElement;
    body.scrollTop = body.scrollHeight;
  }

  function appendCommand(cmd) {
    var p = document.createElement('p');
    p.innerHTML = '<span class="terminal-prompt">funinkina@corner:~$&nbsp;</span>' + esc(cmd);
    output.appendChild(p);
  }

  function run(raw) {
    var cmd = raw.trim();
    if (!cmd) return;

    cmdHistory.unshift(cmd);
    histIdx = -1;

    appendCommand(cmd);

    var handler = null;
    var arg     = '';

    if (cmd === 'cat resume') {
      handler = COMMANDS.resume;
    } else if (cmd in COMMANDS) {
      handler = COMMANDS[cmd];
    } else if (cmd.startsWith('ls ')) {
      handler = COMMANDS.ls;
      arg = cmd.slice(3).trim();
    } else if (cmd.startsWith('open ')) {
      handler = COMMANDS.open;
      arg = cmd.slice(5).trim();
    }

    if (!handler) {
      appendLines(['bash: ' + cmd.split(' ')[0] + ': command not found', '']);
      return;
    }

    var result = handler(arg);
    if (result === '__EXIT__')  { closeTerminal(); return; }
    if (result === '__CLEAR__') { output.innerHTML = ''; return; }
    if (Array.isArray(result))  { appendLines(result.concat([''])); }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) {
        histIdx++;
        input.value = cmdHistory[histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = cmdHistory[histIdx];
      } else {
        histIdx = -1;
        input.value = '';
      }
    } else if (e.key === 'Escape') {
      closeTerminal();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.innerHTML = '';
    }
    e.stopPropagation();
  });

  closeBtn.addEventListener('click', closeTerminal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeTerminal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== '`') return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;
    e.preventDefault();
    overlay.classList.contains('open') ? closeTerminal() : openTerminal();
  });
})();
