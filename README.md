# Terminal Portfolio

A hacker-inspired CLI-style personal portfolio website that provides an authentic terminal experience in the browser.

## Features

### Core Functionality
- **CLI Interface**: Full command-line interaction with command history and auto-complete
- **Keyboard Navigation**: Up/Down arrows for history, Tab for auto-complete, Enter to execute
- **Visual Help System**: Blinking `?` button that expands to show clickable commands
- **Responsive Design**: Works on desktop and mobile devices
- **Terminal Aesthetics**: Authentic green-on-black terminal styling with monospace fonts

### Available Commands
- `help` - Display all available commands
- `about` - Personal information and bio
- `projects` - Portfolio and project showcase
- `experience` - Work history and skills
- `contact` - Contact information and social links
- `resume` - Resume download and information
- `clear` - Clear terminal screen
- `ls` - List available sections
- `whoami` - Quick user information
- `pwd` - Show current path/section

### Fun Commands
- `matrix` - Matrix-style text animation
- `hack` - Playful "hacking" sequence animation
- `coffee` - ASCII art coffee cup
- `uptime` - System information display

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Terminal styling and animations
├── script.js           # JavaScript functionality
├── DESIGN.md           # Detailed design documentation
└── README.md           # This file
```

## Customization

### Personal Information
Edit the following sections in `script.js` to add your information:
- `showAbout()` - Personal bio, location, interests
- `showProjects()` - Your projects and portfolio items
- `showExperience()` - Work history and skills
- `showContact()` - Contact information and social links
- `showResume()` - Resume download link

### Styling
Modify `styles.css` to customize:
- Color scheme (currently green/black terminal theme)
- Font family and sizes
- Animation speeds
- Layout and spacing

### Commands
Add new commands by:
1. Adding the command to the `this.commands` object in the Terminal constructor
2. Creating a new method to handle the command
3. Adding it to the help menu in both the HTML and `showHelp()` method

## Browser Support
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- Mobile responsive design
- Progressive enhancement for older browsers

## Quick Start

1. Clone or download the files
2. Customize personal information in `script.js`
3. Update contact links and resume download link
4. Open `index.html` in a web browser
5. Deploy to your preferred hosting platform

## Security Notes
- All user input is sanitized
- No eval() or dangerous code execution
- Content Security Policy ready
- XSS protection implemented

## Future Enhancements
- Multiple color themes
- Sound effects (optional)
- File system simulation
- Multi-user simulation features
- Custom command aliases

## License
Feel free to use this as a template for your own portfolio!

---

*Built with vanilla HTML, CSS, and JavaScript - no frameworks required!*