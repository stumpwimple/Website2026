# Hacker CLI Personal Webpage Design Document

## Overview
A personal webpage designed to mimic a command-line interface, inspired by hacker culture and terminal aesthetics. Users interact primarily through keyboard commands with an accessible help system for GUI users.

## Design Philosophy
- **Terminal Aesthetic**: Dark background, monospace fonts, green/amber text
- **Keyboard-First**: Primary navigation through CLI commands
- **Progressive Enhancement**: Clickable help system for non-keyboard users
- **Minimalist**: Clean, distraction-free interface focused on content

## Visual Design

### Color Scheme
- Background: Deep black (#000000) or dark gray (#0a0a0a)
- Primary text: Bright green (#00ff00) or amber (#ffb000)
- Secondary text: Dim green (#008000) or gray (#666666)
- Accent: Cyan (#00ffff) for highlights and links
- Error text: Red (#ff0000)

### Typography
- Primary font: 'Courier New', 'Monaco', 'Menlo', monospace
- Font size: 14-16px for readability
- Line height: 1.4-1.6 for terminal-like spacing

### Layout
- Full viewport height with no scrollbars initially
- Terminal prompt at bottom of screen
- Content area fills remaining space above prompt
- Fixed help button (?) in top-right corner

## User Interface Components

### 1. Terminal Interface
```
┌─────────────────────────────────────────────────────┐
│ Welcome to [Your Name]'s Terminal                  ? │
│                                                       │
│ Content Area                                          │
│ (Dynamic based on current section)                   │
│                                                       │
│                                                       │
│ user@portfolio:~$ █                                  │
└─────────────────────────────────────────────────────┘
```

### 2. Command Prompt
- Always visible at bottom
- Blinking cursor
- Command history (up/down arrows)
- Auto-complete suggestions

### 3. Help System
- Blinking `?` in top-right corner
- On hover/click: expands to show command menu
- Each command is clickable to auto-execute
- Smooth animation for expand/collapse

## Command Structure

### Core Commands
- `help` - Show available commands
- `about` - Personal information and bio
- `projects` - Portfolio/project showcase
- `experience` - Work history and skills
- `contact` - Contact information and social links
- `resume` - Download/view resume
- `clear` - Clear terminal screen
- `ls` - List available sections
- `whoami` - Brief introduction

### Navigation Commands
- `cd [section]` - Navigate to different sections
- `cat [file]` - Display content (articles, projects)
- `pwd` - Show current location/section

### Fun Commands
- `matrix` - Matrix-style text animation
- `hack` - Playful "hacking" animation
- `coffee` - ASCII art coffee cup
- `uptime` - Show page/visitor statistics

## Content Sections

### About
- Personal introduction
- Professional summary
- Interests and hobbies
- ASCII art portrait (optional)

### Projects
- List format showing project names
- `cd projects/[name]` to view details
- GitHub links and live demos
- Tech stack information

### Experience
- Chronological work history
- Skills and technologies
- Education background

### Contact
- Email, LinkedIn, GitHub
- GPG key (for hacker authenticity)
- Location (general)

## Technical Implementation

### File Structure
```
/
├── index.html
├── styles.css
├── script.js
├── commands/
│   ├── about.js
│   ├── projects.js
│   ├── experience.js
│   └── contact.js
└── assets/
    ├── fonts/
    └── ascii-art/
```

### Key Features
1. **Command Parser**: Interprets user input and routes to appropriate handlers
2. **History System**: Stores and recalls previous commands
3. **Auto-complete**: Suggests commands as user types
4. **Responsive Design**: Works on mobile with virtual keyboard
5. **Accessibility**: Screen reader compatible, keyboard navigation
6. **Performance**: Fast loading, minimal dependencies

### Browser Support
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- Progressive enhancement for older browsers
- Mobile responsive design

## User Experience Flow

1. **Landing**: User sees terminal with welcome message and prompt
2. **Discovery**: Either type `help` or click the `?` button
3. **Navigation**: Use commands to explore different sections
4. **Interaction**: Each section has relevant commands and content
5. **Accessibility**: Help system guides non-CLI users

## Security Considerations
- Input sanitization for all commands
- No eval() or dangerous code execution
- Content Security Policy headers
- XSS protection

## Future Enhancements
- Themes (different terminal colors)
- Sound effects (optional keyboard clicks)
- Network simulation (fake file transfers)
- Multi-user simulation
- Command aliases and customization