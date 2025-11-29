# Mobile Terminal Portfolio

A standalone interactive terminal-style portfolio built with Next.js, featuring a faulty terminal intro animation and command-line interface.

## Features

- **Faulty Terminal Intro**: WebGL-powered glitchy terminal animation on startup
- **Interactive Terminal**: Command-line interface with various portfolio commands
- **Boot Sequence**: Realistic system boot animation
- **Responsive Design**: Optimized for mobile and desktop
- **Easter Eggs**: Hidden commands and surprises

## Available Commands

- `help` - Show available commands
- `about` - Learn about the developer
- `skills` - View technical skills
- `projects` - See featured projects
- `contact` - Get contact information
- `github` - Open GitHub profile
- `clear` - Clear the terminal
- `rickroll` - ??? (try it!)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or copy this project folder
2. Navigate to the project directory:
   ```bash
   cd mobile-terminal-portfolio
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Customization

### Updating Content

Edit the command responses in `src/components/MobilePortfolio.jsx` in the `processCommand` function to customize:

- About information
- Skills list
- Projects
- Contact details
- Links

### Styling

The terminal styling can be modified in the `terminalStyles` constant within the MobilePortfolio component.

### Animation

The faulty terminal intro can be customized by adjusting the props passed to the `FaultyTerminal` component.

## Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **OGL** - WebGL library for terminal effects
- **Lucide React** - Icons

## Project Structure

```
mobile-terminal-portfolio/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── components/
│       ├── MobilePortfolio.jsx
│       ├── FaultyTerminal.jsx
│       ├── Typewriter.jsx
│       └── AnimatedProfileImage.jsx
├── public/
│   └── animation/
│       ├── index.html
│       ├── frames.js
│       └── fitTextToContainer.js
└── package.json
```

## License

This project is open source and available under the MIT License.

## Credits

- Faulty terminal effect inspired by retro computing aesthetics
- ASCII art animations for visual flair
- Terminal interface design for authentic command-line experience