// Terminal Portfolio JavaScript

class Terminal {
  constructor() {
    this.input = document.getElementById("terminalInput");
    this.content = document.getElementById("terminalContent");
    this.helpButton = document.getElementById("helpButton");
    this.helpMenu = document.getElementById("helpMenu");

    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentSection = "home";
    this.autoCompleteMatches = [];
    this.autoCompleteIndex = -1;
    this.currentSuggestion = "";
    this.lastCommand = "";
    this.binaryRows = [];

    this.commands = {
      help: this.showHelp.bind(this),
      about: this.showAbout.bind(this),
      projects: this.showProjects.bind(this),
      experience: this.showExperience.bind(this),
      contact: this.showContact.bind(this),
      resume: this.showResume.bind(this),
      clear: this.clearTerminal.bind(this),
      ls: this.listSections.bind(this),
      whoami: this.whoAmI.bind(this),
      pwd: this.showCurrentPath.bind(this),
      matrix: this.matrixEffect.bind(this),
      hack: this.hackEffect.bind(this),
      coffee: this.showCoffee.bind(this),
      uptime: this.showUptime.bind(this),
    };

    // Secret commands - not shown in help or autocomplete
    this.secretCommands = {
      pacman: this.spawnPacman.bind(this),
      rabbit: this.spawnRabbit.bind(this),
      ghost: this.spawnGhost.bind(this),
      cookies: this.spawnCookies.bind(this),
      tableflip: this.spawnTableFlip.bind(this),
      dance: this.spawnDancers.bind(this),
      chase: this.spawnChase.bind(this),
      runner: this.spawnRunner.bind(this),
      spawn: this.forceSpawnRandom.bind(this),
    };

    this.init();
    this.startBackgroundAnimations();
    this.startBinaryBackground();
    this.setupResizeHandler();
  }

  init() {
    this.cursor = document.getElementById("cursor");
    this.suggestionText = document.getElementById("suggestionText");

    this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.input.addEventListener("input", this.handleInput.bind(this));

    this.helpButton.addEventListener("click", this.toggleHelpMenu.bind(this));

    // Add click handlers for help menu commands
    const helpCommands = document.querySelectorAll(".help-command");
    helpCommands.forEach((cmd) => {
      cmd.addEventListener("click", (e) => {
        const command = e.target.dataset.command;
        this.executeCommand(command);
        this.hideHelpMenu();
      });
    });

    // Hide help menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.helpButton.contains(e.target) &&
        !this.helpMenu.contains(e.target)
      ) {
        this.hideHelpMenu();
      }
    });

    // Focus input when clicking anywhere in terminal
    document.addEventListener("click", () => {
      this.input.focus();
    });

    // Update cursor position
    setInterval(() => {
      this.updateCursorPosition();
    }, 50);

    this.input.focus();
  }

  handleKeyDown(e) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (this.currentSuggestion) {
          // Accept suggestion and execute
          this.input.value = this.currentSuggestion;
          this.clearSuggestion();
          this.processCommand();
        } else {
          this.processCommand();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.navigateHistory(1);
        break;
      case "Tab":
        e.preventDefault();
        this.handleTabComplete();
        break;
      case " ":
        if (this.currentSuggestion) {
          e.preventDefault();
          // Accept suggestion without executing
          this.input.value = this.currentSuggestion;
          this.clearSuggestion();
        }
        break;
    }
  }

  handleInput(e) {
    // Reset autocomplete when user types
    this.clearSuggestion();
    this.updateSuggestion();
  }

  processCommand() {
    const command = this.input.value.trim();
    if (!command) return;

    // Add to history
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;

    // Display command
    this.addLine(`user@portfolio:~$ ${command}`, "command-line");

    // Execute command
    this.executeCommand(command);

    // Clear input
    this.input.value = "";
  }

  executeCommand(commandString) {
    const parts = commandString.toLowerCase().trim().split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    if (this.commands[command]) {
      this.lastCommand = command;
      this.executeWithLoading(command, args);
    } else if (this.secretCommands[command]) {
      this.lastCommand = command;
      // Execute secret commands immediately without loading
      this.secretCommands[command](args);
      this.scrollToBottom();
      this.displayCommandInBinary(command);
    } else if (command) {
      this.addLine(`Command not found: ${command}`, "error-line");
      this.addLine(`Type 'help' to see available commands`, "warning-line");
      this.scrollToBottom();
    }
  }

  executeWithLoading(command, args) {
    // Commands that should auto-clear before executing
    const autoClearCommands = [
      "about",
      "projects",
      "experience",
      "contact",
      "resume",
    ];

    // Different commands have different loading times for realism
    const loadingTimes = {
      help: 1500,
      about: 1800,
      projects: 2000,
      experience: 1900,
      contact: 1600,
      resume: 2200,
      clear: 1500,
      ls: 1500,
      whoami: 1500,
      pwd: 1500,
      matrix: 3000,
      hack: 2800,
      coffee: 2500,
      uptime: 1700,
    };

    const loadingTime = loadingTimes[command] || 1500;

    // Add loading animation
    const loadingId = this.showLoading(command);

    // Execute command after delay
    setTimeout(() => {
      this.hideLoading(loadingId);

      // Auto-clear for main section commands
      if (autoClearCommands.includes(command)) {
        this.content.innerHTML = "";
      }

      this.commands[command](args);
      this.scrollToBottom();

      // Display command in binary background
      this.displayCommandInBinary(command);
    }, loadingTime);
  }

  showLoading(command) {
    const loadingEl = document.createElement("div");
    loadingEl.className = "loading-line";
    loadingEl.innerHTML = `> Executing ${command}<span class="loading-dots"></span>`;

    const loadingId = "loading_" + Date.now();
    loadingEl.id = loadingId;

    this.content.appendChild(loadingEl);
    this.scrollToBottom();

    return loadingId;
  }

  hideLoading(loadingId) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = "";
      return;
    }

    this.input.value = this.commandHistory[this.historyIndex] || "";
  }

  handleTabComplete() {
    const input = this.input.value.toLowerCase().trim();

    // Find matches
    const matches = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(input)
    );

    if (matches.length === 0) {
      return; // No matches
    }

    if (matches.length === 1) {
      // Only one match, show it as suggestion
      this.currentSuggestion = matches[0];
      this.updateSuggestionDisplay();
    } else {
      // Multiple matches, cycle through them
      if (
        this.autoCompleteMatches.length === 0 ||
        !this.arraysEqual(this.autoCompleteMatches, matches)
      ) {
        this.autoCompleteMatches = matches;
        this.autoCompleteIndex = 0;
      } else {
        this.autoCompleteIndex =
          (this.autoCompleteIndex + 1) % this.autoCompleteMatches.length;
      }

      this.currentSuggestion = this.autoCompleteMatches[this.autoCompleteIndex];
      this.updateSuggestionDisplay();
    }
  }

  updateSuggestion() {
    const input = this.input.value.toLowerCase().trim();

    if (input.length === 0) {
      this.clearSuggestion();
      return;
    }

    // Find first match
    const matches = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(input)
    );

    if (matches.length > 0 && matches[0] !== input) {
      this.currentSuggestion = matches[0];
      this.updateSuggestionDisplay();
    } else {
      this.clearSuggestion();
    }
  }

  updateSuggestionDisplay() {
    if (this.currentSuggestion && this.currentSuggestion !== this.input.value) {
      // Show the full command text behind the input
      this.suggestionText.textContent = this.currentSuggestion;
      this.positionSuggestion();
    } else {
      this.clearSuggestion();
    }
  }

  positionSuggestion() {
    const prompt = document.querySelector(".prompt");
    const promptWidth = prompt.offsetWidth;

    // Position suggestion text at the start of input area with offset
    this.suggestionText.style.left = 16 + promptWidth + 2 + "px"; // +2px right offset
    this.suggestionText.style.top = "-2px"; // -2px up offset
  }

  clearSuggestion() {
    this.currentSuggestion = "";
    this.suggestionText.textContent = "";
    this.autoCompleteMatches = [];
    this.autoCompleteIndex = -1;
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  addLine(text, className = "") {
    const line = document.createElement("div");
    line.className = `output-line ${className}`;
    line.innerHTML = text;
    this.content.appendChild(line);

    // Add click handlers for any command links in this line
    this.addClickHandlers(line);
  }

  addClickHandlers(element) {
    const commandLinks = element.querySelectorAll(".cmd-link");
    commandLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const command = link.dataset.command;
        this.executeCommand(command);
        this.input.focus();
      });
    });
  }

  createCommandLink(command, description) {
    return `<span class="cmd-link" data-command="${command}">${command}</span>${
      description ? " - " + description : ""
    }`;
  }

  scrollToBottom() {
    this.content.scrollTop = this.content.scrollHeight;
  }

  clearTerminal() {
    this.content.innerHTML = "";
    this.addLine("Terminal cleared", "success-line");
  }

  toggleHelpMenu() {
    this.helpMenu.classList.toggle("show");
  }

  hideHelpMenu() {
    this.helpMenu.classList.remove("show");
  }

  updateCursorPosition() {
    const prompt = document.querySelector(".prompt");
    const inputText = this.input.value;

    // Create a temporary span to measure text width
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.fontFamily = getComputedStyle(this.input).fontFamily;
    tempSpan.style.fontSize = getComputedStyle(this.input).fontSize;
    tempSpan.style.whiteSpace = "pre"; // Preserve spaces
    // Use a non-breaking space to ensure spaces are measured correctly
    tempSpan.textContent = inputText.replace(/ /g, "\u00A0");
    document.body.appendChild(tempSpan);

    const textWidth = tempSpan.offsetWidth;
    const promptWidth = prompt.offsetWidth;

    // Position cursor one character width after the text (or after prompt if no text)
    const charWidth = this.getCharWidth();
    this.cursor.style.left = 16 + promptWidth + textWidth + charWidth + "px";

    document.body.removeChild(tempSpan);
  }

  getCharWidth() {
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.fontFamily = getComputedStyle(this.input).fontFamily;
    tempSpan.style.fontSize = getComputedStyle(this.input).fontSize;
    tempSpan.textContent = "M"; // Use M as average character width
    document.body.appendChild(tempSpan);

    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return width;
  }

  // Command implementations
  showHelp() {
    this.addLine("Available commands:", "section-header");
    this.addLine("");
    this.addLine(this.createCommandLink("help", "Show this help message"));
    this.addLine(this.createCommandLink("about", "Learn about me"));
    this.addLine(this.createCommandLink("projects", "View my projects"));
    this.addLine(this.createCommandLink("experience", "See my work history"));
    this.addLine(
      this.createCommandLink("contact", "Get my contact information")
    );
    this.addLine(this.createCommandLink("resume", "Download my resume"));
    this.addLine(this.createCommandLink("clear", "Clear the terminal"));
    this.addLine(this.createCommandLink("ls", "List available sections"));
    this.addLine(this.createCommandLink("whoami", "Quick introduction"));
    this.addLine(this.createCommandLink("pwd", "Show current section"));
    this.addLine("");
    this.addLine("Fun commands:", "section-header");
    this.addLine(this.createCommandLink("matrix", "Enter the matrix"));
    this.addLine(this.createCommandLink("hack", "Initiate hack sequence"));
    this.addLine(this.createCommandLink("coffee", "Brew some coffee"));
    this.addLine(this.createCommandLink("uptime", "System information"));
    this.addLine("");
    this.addLine("Navigation tips:", "success-line");
    this.addLine("• Use Tab for auto-complete");
    this.addLine("• Use Up/Down arrows for command history");
    this.addLine("• Click the blinking ? for a visual menu");
    this.addLine(
      '• <span class="highlight">Click any command above to execute it!</span>'
    );
  }

  showAbout() {
    this.addLine("About Me", "section-header");
    this.addLine("");
    this.addLine("> Initializing personal profile...");
    this.addLine("");
    this.addLine("Name: [Your Name Here]");
    this.addLine("Role: Full Stack Developer / Cybersecurity Enthusiast");
    this.addLine("Location: [Your Location]");
    this.addLine("");
    this.addLine("Bio:");
    this.addLine(
      "Passionate developer with a love for clean code, cybersecurity,"
    );
    this.addLine("and terminal interfaces. I enjoy building applications that");
    this.addLine(
      "solve real-world problems while maintaining security best practices."
    );
    this.addLine("");
    this.addLine(
      "Interests: Penetration Testing, Web Development, Open Source,"
    );
    this.addLine("Linux Systems, Network Security, Coffee ☕");
    this.addLine("");
    this.addLine("📧 Email: your.email@domain.com");
    this.addLine("🔗 LinkedIn: linkedin.com/in/yourprofile");
    this.addLine("🐙 GitHub: github.com/yourusername");
  }

  showProjects() {
    this.addLine("Projects Directory", "section-header");
    this.addLine("");
    this.addLine("drwxr-xr-x  project1/     Web Application Security Scanner");
    this.addLine("drwxr-xr-x  project2/     Terminal-based Task Manager");
    this.addLine("drwxr-xr-x  project3/     Encrypted Chat Application");
    this.addLine("drwxr-xr-x  project4/     Network Monitoring Dashboard");
    this.addLine("");
    this.addLine("Featured Projects:", "success-line");
    this.addLine("");
    this.addLine("1. Security Scanner Tool");
    this.addLine("   └─ Python-based web vulnerability scanner");
    this.addLine("   └─ Features: SQL injection, XSS detection");
    this.addLine(
      '   └─ GitHub: <a href="https://github.com/yourusername/security-scanner" target="_blank">github.com/yourusername/security-scanner</a>'
    );
    this.addLine("");
    this.addLine("2. Terminal Portfolio (This site!)");
    this.addLine("   └─ CLI-inspired personal website");
    this.addLine("   └─ Technologies: HTML, CSS, JavaScript");
    this.addLine("   └─ Features: Command history, auto-complete");
    this.addLine(
      "   └─ Try: " +
        this.createCommandLink("matrix", "") +
        ", " +
        this.createCommandLink("hack", "") +
        ", " +
        this.createCommandLink("coffee", "")
    );
    this.addLine("");
    this.addLine(
      '<span class="highlight">Click command links above to try them!</span>'
    );
    this.addLine(
      "Type " +
        this.createCommandLink("ls", "") +
        " to see all available sections"
    );
  }

  showExperience() {
    this.addLine("Work Experience", "section-header");
    this.addLine("");
    this.addLine("> cat /var/log/career.log");
    this.addLine("");
    this.addLine("[2023-Present] Senior Developer @ Tech Company");
    this.addLine("├─ Led security-focused development team");
    this.addLine("├─ Implemented secure coding practices");
    this.addLine("└─ Technologies: React, Node.js, PostgreSQL, AWS");
    this.addLine("");
    this.addLine("[2021-2023] Full Stack Developer @ Previous Company");
    this.addLine("├─ Built and maintained web applications");
    this.addLine("├─ Performed security audits and penetration testing");
    this.addLine("└─ Technologies: Python, Django, Docker, Linux");
    this.addLine("");
    this.addLine("[2020-2021] Junior Developer @ First Company");
    this.addLine("├─ Frontend development and UI/UX improvement");
    this.addLine("├─ Learned cybersecurity fundamentals");
    this.addLine("└─ Technologies: JavaScript, HTML/CSS, Git");
    this.addLine("");
    this.addLine("Skills:", "success-line");
    this.addLine("Programming: Python, JavaScript, TypeScript, Go, C++");
    this.addLine("Web: React, Node.js, Express, Django, FastAPI");
    this.addLine("Security: Penetration Testing, OWASP, Nmap, Burp Suite");
    this.addLine("Systems: Linux, Docker, AWS, Kubernetes, Nginx");
    this.addLine("Databases: PostgreSQL, MongoDB, Redis");
  }

  showContact() {
    this.addLine("Contact Information", "section-header");
    this.addLine("");
    this.addLine("> Establishing secure communication channels...");
    this.addLine("");
    this.addLine("📧 Email: your.email@domain.com");
    this.addLine("🔗 LinkedIn: https://linkedin.com/in/yourprofile");
    this.addLine("🐙 GitHub: https://github.com/yourusername");
    this.addLine("🐦 Twitter: @yourusername");
    this.addLine("");
    this.addLine("💬 Discord: yourusername#1234");
    this.addLine("📱 Signal: Available upon request");
    this.addLine("🔐 GPG Key: [Fingerprint]");
    this.addLine("");
    this.addLine("Response Time: Usually within 24 hours");
    this.addLine("Preferred Contact: Email for professional inquiries");
    this.addLine("");
    this.addLine("📍 Location: [Your City, Country]");
    this.addLine("🕒 Timezone: [Your Timezone]");
  }

  showResume() {
    this.addLine("Resume Access", "section-header");
    this.addLine("");
    this.addLine("> Generating PDF export...");
    this.addLine("> Encrypting sensitive data...");
    this.addLine("> Ready for download");
    this.addLine("");
    this.addLine(
      "📄 Resume.pdf [1.2MB] - Last updated: " + new Date().toLocaleDateString()
    );
    this.addLine("");
    this.addLine(
      'Download link: <a href="#" onclick="alert(\'Add your resume link here!\')">Click here to download</a>'
    );
    this.addLine("");
    this.addLine("Alternative formats available:");
    this.addLine("├─ PDF (Recommended)");
    this.addLine("├─ Plain text");
    this.addLine("└─ JSON (Machine readable)");
  }

  listSections() {
    this.addLine("Available Sections", "section-header");
    this.addLine("");
    this.addLine("total 6 sections");
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink(
        "about",
        ""
      )}        Personal information`
    );
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink(
        "projects",
        ""
      )}     Portfolio showcase`
    );
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink("experience", "")}   Work history`
    );
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink(
        "contact",
        ""
      )}      Communication channels`
    );
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink(
        "resume",
        ""
      )}       CV and credentials`
    );
    this.addLine(
      `drwxr-xr-x ${this.createCommandLink(
        "help",
        ""
      )}         Command reference`
    );
    this.addLine("");
    this.addLine(
      '<span class="highlight">Click any section name to navigate</span>'
    );
  }

  whoAmI() {
    this.addLine("user");
    this.addLine("");
    this.addLine("Current user: Portfolio Visitor");
    this.addLine("Access level: Guest");
    this.addLine("Session: Active");
    this.addLine("Shell: /bin/portfolio");
  }

  showCurrentPath() {
    this.addLine(`/home/user/portfolio/${this.currentSection}`);
  }

  matrixEffect() {
    this.addLine("Entering the Matrix...", "success-line");
    this.addLine("");
    let matrix = "";
    for (let i = 0; i < 5; i++) {
      let line = "";
      for (let j = 0; j < 50; j++) {
        line += Math.random() > 0.7 ? "1" : "0";
      }
      matrix += line + "\n";
    }
    this.addLine('<pre class="ascii-art">' + matrix + "</pre>");
    this.addLine("Welcome to the real world.", "success-line");
  }

  hackEffect() {
    this.addLine("> Initializing hack sequence...", "warning-line");
    this.addLine("> Scanning for vulnerabilities...");
    this.addLine("> Buffer overflow detected at 0x7fff5fbff7a0");
    this.addLine("> Injecting payload...");
    this.addLine("> Bypassing authentication...");
    this.addLine("> Access granted!", "success-line");
    this.addLine("");
    this.addLine("Just kidding! This is just for fun 😄", "error-line");
    this.addLine("Always hack ethically and responsibly!");
  }

  showCoffee() {
    const coffeeArt = `
        <span class="steam-line steam-1">(  )</span>   <span class="steam-line steam-2">(   )</span>  <span class="steam-line steam-3">)</span>
         <span class="steam-line steam-2">) (</span>   <span class="steam-line steam-3">)  (</span>  <span class="steam-line steam-1">(</span>
         <span class="steam-line steam-3">( )</span>  <span class="steam-line steam-1">(    )</span> <span class="steam-line steam-2">)</span>
         _____________
        <_____________> ___
        |             |/ _ \\
        |               | | |
        |               |_| |
     ___|             |\\___/
    /    \\___________/    \\
   /                      \\
   \\______________________/
        `;
    this.addLine('<pre class="ascii-art coffee-art">' + coffeeArt + "</pre>");
    this.addLine("☕ Coffee brewing... Please wait");
    this.addLine("Perfect fuel for coding sessions!", "success-line");
  }

  showUptime() {
    const uptime = Math.floor(
      Date.now() / 1000 - performance.timeOrigin / 1000
    );
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    this.addLine("System Information", "section-header");
    this.addLine("");
    this.addLine(`Uptime: ${hours}h ${minutes}m ${seconds}s`);
    this.addLine("System: TerminalPortfolio v1.0");
    this.addLine("Kernel: WebBrowser");
    this.addLine("Architecture: x86_64");
    this.addLine("Shell: /bin/portfolio");
    this.addLine(`Memory Usage: ${Math.floor(Math.random() * 50 + 20)}%`);
    this.addLine(`CPU Usage: ${Math.floor(Math.random() * 30 + 5)}%`);
    this.addLine("Status: All systems operational", "success-line");
  }

  // Background Animation System
  startBackgroundAnimations() {
    this.backgroundContainer = document.getElementById("backgroundAnimations");

    // Start the random animation scheduler
    this.scheduleNextAnimation();
  }

  scheduleNextAnimation() {
    // Random delay between 15-60 seconds
    const delay = Math.random() * 45000 + 15000;

    setTimeout(() => {
      this.spawnBackgroundCharacter();
      this.scheduleNextAnimation();
    }, delay);
  }

  spawnBackgroundCharacter() {
    // Create mini-invasion with 3-6 characters
    const invasionSize = Math.floor(Math.random() * 4) + 3; // 3 to 6 characters

    for (let i = 0; i < invasionSize; i++) {
      // Stagger spawning slightly
      setTimeout(() => {
        this.spawnSingleCharacter();
      }, i * Math.random() * 1000); // 0-1 second stagger
    }
  }

  spawnSingleCharacter() {
    const characters = [
      { char: "ᗧ●●●●>", type: "runner", color: "#ffff00" }, // Pac-man inspired
      { char: "🐰", type: "hopper", color: "#ffffff" }, // Rabbit (Alice reference)
      { char: "ᗤ ●", type: "chaser", color: "#00ffff" }, // Ghost chasing dot
      { char: "◉ ◉ ◉ ◉", type: "runner", color: "#8B4513" }, // Cookie trail
      { char: "(╯°□°）╯", type: "runner", color: "#ff6600" }, // Table flip (hacker frustration)
      { char: "└[∵┌]└[ ∵ ]┘[┐∵]┘", type: "runner", color: "#00ff00" }, // Dancing figures
      { char: "●●●ᗣ", type: "chaser", color: "#0080ff" }, // Blue creature chasing cookies
      { char: "ᕕ( ᐛ )ᕗ", type: "runner", color: "#ff00ff" }, // Happy running person
    ];

    const character = characters[Math.floor(Math.random() * characters.length)];

    // Random direction (50% chance each way)
    const fromLeft = Math.random() > 0.5;
    const animationType = fromLeft ? character.type : character.type + "-left";

    const element = document.createElement("div");
    element.className = `bg-character ${animationType}`;
    element.textContent = character.char;
    element.style.color = character.color;
    element.style.top = Math.random() * 70 + 10 + "%"; // Random vertical position (10-80%)

    // Random speed variation (80% to 120% of base speed)
    const speedMultiplier = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    element.style.animationDuration = this.getAnimationDuration(
      character.type,
      speedMultiplier
    );

    this.backgroundContainer.appendChild(element);

    // Remove element after animation completes (longer for slower speeds)
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 20000); // Increased cleanup time for slower animations
  }

  getAnimationDuration(type, multiplier) {
    const baseDurations = {
      runner: 15,
      chaser: 18,
      hopper: 12,
    };

    const duration = (baseDurations[type] || 15) / multiplier;
    return duration + "s";
  }

  // Secret command methods
  spawnPacman() {
    this.addLine("👾 Pac-Man spotted!", "warning-line");
    this.spawnSpecificCharacter({
      char: "ᗧ●●●●>",
      type: "runner",
      color: "#ffff00",
    });
  }

  spawnRabbit() {
    this.addLine("🐰 Following the white rabbit...", "success-line");
    this.spawnSpecificCharacter({
      char: "🐰",
      type: "hopper",
      color: "#ffffff",
    });
  }

  spawnGhost() {
    this.addLine("👻 Ghost in the machine!", "error-line");
    this.spawnSpecificCharacter({
      char: "ᗤ ●",
      type: "chaser",
      color: "#00ffff",
    });
  }

  spawnCookies() {
    this.addLine("🍪 Cookie trail detected!", "warning-line");
    this.spawnSpecificCharacter({
      char: "◉ ◉ ◉ ◉",
      type: "runner",
      color: "#8B4513",
    });
  }

  spawnTableFlip() {
    this.addLine("(╯°□°）╯ Hacker rage mode activated!", "error-line");
    this.spawnSpecificCharacter({
      char: "(╯°□°）╯",
      type: "runner",
      color: "#ff6600",
    });
  }

  spawnDancers() {
    this.addLine("💃 Dance party in the terminal!", "success-line");
    this.spawnSpecificCharacter({
      char: "└[∵┌]└[ ∵ ]┘[┐∵]┘",
      type: "runner",
      color: "#00ff00",
    });
  }

  spawnChase() {
    this.addLine("🏃 Cookie monster on the hunt!", "warning-line");
    this.spawnSpecificCharacter({
      char: "●●●ᗣ",
      type: "chaser",
      color: "#0080ff",
    });
  }

  spawnRunner() {
    this.addLine("🏃‍♂️ Someone's in a hurry!", "success-line");
    this.spawnSpecificCharacter({
      char: "ᕕ( ᐛ )ᕗ",
      type: "runner",
      color: "#ff00ff",
    });
  }

  forceSpawnRandom() {
    this.addLine("🎲 Summoning mini-invasion...", "warning-line");
    console.log("Force spawning random characters...");
    console.log("Background container exists:", !!this.backgroundContainer);
    this.spawnBackgroundCharacter();
  }

  spawnSpecificCharacter(character) {
    if (!this.backgroundContainer) {
      this.addLine(
        "Background animation system not initialized!",
        "error-line"
      );
      return;
    }

    // Random direction (50% chance each way)
    const fromLeft = Math.random() > 0.5;
    const animationType = fromLeft ? character.type : character.type + "-left";

    const element = document.createElement("div");
    element.className = `bg-character ${animationType}`;
    element.textContent = character.char;
    element.style.color = character.color;
    element.style.top = Math.random() * 70 + 10 + "%"; // Random vertical position (10-80%)

    // Random speed variation (80% to 120% of base speed)
    const speedMultiplier = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    element.style.animationDuration = this.getAnimationDuration(
      character.type,
      speedMultiplier
    );

    this.backgroundContainer.appendChild(element);

    // Remove element after animation completes (longer for slower speeds)
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 20000);
  }

  // Binary Background System
  startBinaryBackground() {
    console.log("Starting binary background system...");
    console.log("Background container:", this.backgroundContainer);

    // Calculate how many rows we need to fill the screen
    const screenHeight = window.innerHeight;
    const lineHeight = 20; // Approximate height per line in pixels
    const numRows = Math.floor(screenHeight / lineHeight);

    console.log(
      `Creating ${numRows} binary rows for screen height ${screenHeight}px`
    );

    // Create fixed rows at different heights
    for (let i = 0; i < numRows; i++) {
      const rowPosition = (i / numRows) * 100; // Convert to percentage
      this.createDynamicBinaryRow(rowPosition, i);
    }
  }

  createDynamicBinaryRow(topPercent, rowIndex) {
    if (!this.backgroundContainer) {
      console.log("No background container found!");
      return;
    }

    // Create row element
    const element = document.createElement("div");
    element.className = "binary-stream"; // Remove binary-row class (no CSS animation)
    element.style.top = topPercent + "%";
    element.style.left = "0"; // Position at left edge of screen
    element.dataset.rowIndex = rowIndex;

    this.backgroundContainer.appendChild(element);

    // Pre-load with initial random binary to fill screen
    const initialContent = this.generateInitialBinaryContent();

    this.binaryRows.push({
      element: element,
      content: initialContent,
      commandQueue: [],
      isDisplayingCommand: false,
    });

    // Set initial content
    element.innerHTML = initialContent;

    // Start the dynamic generation for this row
    this.startDynamicGeneration(rowIndex);

    console.log(
      `Created dynamic binary row ${rowIndex} at ${topPercent.toFixed(1)}%`
    );
  }

  startDynamicGeneration(rowIndex) {
    const row = this.binaryRows[rowIndex];

    // Generate characters continuously as they enter screen - SAME speed for all rows
    const generateInterval = 400; // Matrix-like effect speed

    setInterval(() => {
      this.addCharacterToRow(rowIndex);
    }, generateInterval);
  }

  addCharacterToRow(rowIndex) {
    const row = this.binaryRows[rowIndex];
    if (!row) return;

    let newCharacter;
    let isCommand = false;

    if (row.commandQueue.length > 0 && !row.isDisplayingCommand) {
      // Start displaying command in binary
      row.isDisplayingCommand = true;
      row.currentCommand = row.commandQueue.shift();
      row.commandChars = row.currentCommand.split("");
      row.commandPosition = 0;
      console.log(
        `Starting to display "${row.currentCommand}" character by character`
      );
    }

    if (
      row.isDisplayingCommand &&
      row.commandPosition < row.commandChars.length
    ) {
      // Display next command character
      newCharacter = row.commandChars[row.commandPosition];
      isCommand = true;
      row.commandPosition++;

      if (row.commandPosition >= row.commandChars.length) {
        row.isDisplayingCommand = false;
        console.log(`Finished displaying command for row ${rowIndex}`);
      }
    } else {
      // Generate random character (printable ASCII)
      const randomCharCode = Math.floor(Math.random() * 95) + 32; // ASCII 32-126
      newCharacter = String.fromCharCode(randomCharCode);
      isCommand = false;
    }

    // Convert character to 8-bit binary
    const binaryBits = newCharacter.charCodeAt(0).toString(2).padStart(8, "0");

    // Create colored spans for each bit
    const colorClass = isCommand ? "binary-command" : "binary-random";
    const binarySpans = binaryBits
      .split("")
      .map((bit) => `<span class="${colorClass}">${bit}</span>`)
      .join("");

    // Add the 8-bit character with spaces
    row.content = row.content + binarySpans + "  ";

    // Remove old content from the LEFT to maintain screen width
    const maxBlocks = this.calculateMaxScreenBlocks();
    const currentBlocks = this.countBinaryBlocks(row.content);
    if (currentBlocks > maxBlocks) {
      row.content = this.removeFirstBlock(row.content);
    }

    row.element.innerHTML = row.content;
  }

  countBinaryBlocks(htmlContent) {
    // Count 8-bit blocks by counting double spaces (each block ends with '  ')
    return (htmlContent.match(/  /g) || []).length;
  }

  removeFirstBlock(htmlContent) {
    // Remove the first 8-bit block and its trailing spaces
    // Pattern: 8 spans + 2 spaces
    const blockPattern = /^(<span class="[^"]*">[01]<\/span>){8}  /;
    const match = htmlContent.match(blockPattern);
    if (match) {
      return htmlContent.substring(match[0].length);
    }
    return htmlContent;
  }

  generateInitialBinaryContent() {
    // Generate initial screen-full of random binary by characters
    let content = "";
    const blocksNeeded = this.calculateMaxScreenBlocks();

    for (let i = 0; i < blocksNeeded; i++) {
      // Generate random character (printable ASCII)
      const randomCharCode = Math.floor(Math.random() * 95) + 32; // ASCII 32-126
      const randomChar = String.fromCharCode(randomCharCode);

      // Convert to 8-bit binary
      const binaryBits = randomChar.charCodeAt(0).toString(2).padStart(8, "0");

      // Create spans for each bit
      const binarySpans = binaryBits
        .split("")
        .map((bit) => `<span class="binary-random">${bit}</span>`)
        .join("");

      content += binarySpans + "  "; // Add 8 bits + 2 spaces
    }

    console.log("Initial content blocks:", blocksNeeded);
    return content;
  }

  calculateMaxScreenBlocks() {
    // Calculate how many 8-bit blocks fit on screen width using actual measurement
    const screenWidth = window.innerWidth;

    // Create a temporary element to measure actual width of one binary block
    const tempEl = document.createElement("div");
    tempEl.style.position = "absolute";
    tempEl.style.visibility = "hidden";
    tempEl.style.fontFamily = "monospace";
    tempEl.style.fontSize = "12px";
    tempEl.style.letterSpacing = "2px";
    tempEl.style.whiteSpace = "nowrap";

    // Sample 8-bit block with 2 spaces
    tempEl.innerHTML = '<span class="binary-random">01010101</span>  ';
    document.body.appendChild(tempEl);

    const actualBlockWidth = tempEl.offsetWidth;
    document.body.removeChild(tempEl);

    const blocksNeeded = Math.floor(screenWidth / actualBlockWidth) + 1; // Reasonable buffer for coverage
    console.log(
      `Screen width: ${screenWidth}px, Actual block width: ${actualBlockWidth}px, Blocks needed: ${blocksNeeded}`
    );
    return blocksNeeded;
  }

  setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener("resize", () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  handleResize() {
    // Recalculate and pad all rows when window is resized
    const newMaxBlocks = this.calculateMaxScreenBlocks();

    this.binaryRows.forEach((row, index) => {
      const currentBlocks = this.countBinaryBlocks(row.content);
      console.log(
        `Row ${index}: Current blocks: ${currentBlocks}, New max: ${newMaxBlocks}`
      );

      if (currentBlocks < newMaxBlocks) {
        // Add more blocks to fill wider screen
        const blocksToAdd = newMaxBlocks - currentBlocks;
        console.log(`Adding ${blocksToAdd} blocks to row ${index}`);
        const additionalContent = this.generateRandomBlocks(blocksToAdd);
        row.content = additionalContent + row.content; // Add to front
        row.element.innerHTML = row.content;
      }
    });

    console.log(`Resized: adjusted binary rows for ${newMaxBlocks} blocks`);
  }

  generateRandomBlocks(numBlocks) {
    let content = "";
    for (let i = 0; i < numBlocks; i++) {
      // Generate random character (printable ASCII)
      const randomCharCode = Math.floor(Math.random() * 95) + 32;
      const randomChar = String.fromCharCode(randomCharCode);

      // Convert to 8-bit binary
      const binaryBits = randomChar.charCodeAt(0).toString(2).padStart(8, "0");

      // Create spans for each bit
      const binarySpans = binaryBits
        .split("")
        .map((bit) => `<span class="binary-random">${bit}</span>`)
        .join("");

      content += binarySpans + "  "; // Add 8 bits + 2 spaces
    }
    return content;
  }

  removeFirstCharacter(htmlContent) {
    // Remove the first element (binary character or spaces) from the HTML content
    const firstElementMatch = htmlContent.match(
      /^(<span class="[^"]*">[01]<\/span>|  )/
    );
    if (firstElementMatch) {
      return htmlContent.substring(firstElementMatch[0].length);
    }
    return htmlContent;
  }

  displayCommandInBinary(command) {
    // Add command to random rows for display
    const numRowsToUse = Math.min(3, this.binaryRows.length);
    const selectedRows = [];

    while (selectedRows.length < numRowsToUse) {
      const randomIndex = Math.floor(Math.random() * this.binaryRows.length);
      if (!selectedRows.includes(randomIndex)) {
        selectedRows.push(randomIndex);
      }
    }

    selectedRows.forEach((rowIndex) => {
      this.binaryRows[rowIndex].commandQueue.push(command);
    });

    console.log(`Displaying "${command}" in binary across rows:`, selectedRows);
  }

  stringToBinary(str) {
    // Convert string to binary representation
    return str
      .split("")
      .map((char) => {
        return char.charCodeAt(0).toString(2).padStart(8, "0");
      })
      .join("");
  }

  generateContinuousBinaryStream() {
    // Create a very long stream to ensure seamless looping
    let stream = "";
    const numBlocks = 30; // Extra long to cover wide screens and provide seamless loop

    for (let block = 0; block < numBlocks; block++) {
      // Generate 8-character binary block
      for (let i = 0; i < 8; i++) {
        stream += Math.random() > 0.5 ? "1" : "0";
      }
      // Add spaces between blocks (except after last block)
      if (block < numBlocks - 1) {
        stream += "  "; // Two spaces between blocks
      }
    }

    // Add extra content to ensure seamless animation
    stream += "  " + stream.substring(0, 50); // Repeat first part for smooth loop

    return stream;
  }

  generateBinaryBlock() {
    // Keep this for backward compatibility with character spawns
    return this.generateContinuousBinaryStream();
  }
}

// Initialize terminal when page loads
document.addEventListener("DOMContentLoaded", () => {
  new Terminal();
});
