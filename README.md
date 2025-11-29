# Mobile Terminal Portfolio

A retro-inspired interactive terminal-style portfolio built with Next.js, featuring a faulty terminal intro animation, command-line interface, and a collection of classic mini-games. This project showcases web development skills through both a functional portfolio interface and playable games.

## Features

- **Faulty Terminal Intro**: WebGL-powered glitchy terminal animation on startup
- **Interactive Terminal**: Command-line interface with various portfolio commands
- **Classic Mini-Games**: 15+ retro games including Pong, Snake, Tetris, Pacman, and more
- **Boot Sequence**: Realistic system boot animation
- **Responsive Design**: Optimized for mobile and desktop
- **Game Overlay System**: Smooth game launching and exit mechanics
- **Easter Eggs**: Hidden commands and surprises

## Available Commands

- `help` - Show available commands
- `about` - Learn about the developer
- `skills` - View technical skills
- `projects` - See featured projects
- `contact` - Get contact information
- `games` - Launch playable games
- `github` - Open GitHub profile
- `clear` - Clear the terminal
- `rickroll` - ??? (try it!)

## Playable Games

The portfolio includes 15+ classic games:

- **Arcade Classics**: Pong, Snake, Tetris, Breakout, Space Invaders
- **Platform Games**: Kong Climb, Flappy Terminal, Way Out
- **Puzzle Games**: Tic Tac Toe, Cyber Connect 4, Glitch Buster, Oh Flip
- **Simulation Games**: Drive XS, Retro Racing
- **Strategy Games**: Pacman

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

### Adding New Games

To add a new game:

1. Create a new game component in `src/components/games/YourGame.jsx`
2. Import it in `MobilePortfolio.jsx`
3. Add it to the game launcher system in the `games` command handler
4. Style it with retro terminal aesthetics for consistency

### Styling

Terminal styling can be modified in the `terminalStyles` constant within the MobilePortfolio component. The project uses Tailwind CSS for responsive design and custom CSS for retro effects.

### Animation

- The faulty terminal intro can be customized by adjusting props in the `FaultyTerminal` component
- Typewriter effects can be adjusted in `Typewriter.jsx`
- Game overlay transitions can be modified in `RetroGameOverlay.jsx`

## Technologies Used

- **Next.js 14.0.4** - React framework for production
- **React 18** - UI library
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **OGL 1.0.11** - WebGL library for terminal effects and animations
- **Lucide React 0.546.0** - Icon library
- **PostCSS** - CSS transformation tool
- **ESLint** - Code quality and linting

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Works best on modern browsers with WebGL support.

## Project Structure

```
mobile-terminal-portfolio/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.js            # Root layout
│   │   └── page.js              # Main page
│   └── components/
│       ├── MobilePortfolio.jsx   # Main terminal component
│       ├── FaultyTerminal.jsx    # WebGL startup animation
│       ├── RetroGameOverlay.jsx  # Game launcher overlay
│       ├── RetroLoader.jsx       # Loading animation
│       ├── Typewriter.jsx        # Typewriter effect component
│       ├── AnimatedProfileImage.jsx
│       ├── frames.js            # Animation frames
│       └── games/               # Game components
│           ├── Pong.jsx
│           ├── Snake.jsx
│           ├── Tetris.jsx
│           ├── Breakout.jsx
│           ├── SpaceInvaders.jsx
│           ├── KongClimb.jsx
│           ├── FlappyTerminal.jsx
│           ├── CyberConnect4.jsx
│           ├── TicTacToe.jsx
│           ├── Pacman.jsx
│           ├── RetroRacing.jsx
│           ├── DriveXS.jsx
│           ├── GlitchBuster.jsx
│           ├── OhFlip.jsx
│           └── WayOut.jsx
├── public/
│   ├── animation/               # Startup animation assets
│   ├── pacman-game/            # Pacman assets
│   ├── drivexs/                # Drive XS assets
│   ├── oh-flip/                # Oh Flip assets
│   ├── way-out/                # Way Out assets
│   ├── glitch-buster/          # Glitch Buster assets
│   ├── dkjs/                   # Kong Climb assets
│   └── Pacman-js-main/         # Additional Pacman resources
├── lib/
│   ├── kongClimb/              # Kong Climb game logic
│   └── pacman/                 # Pacman game logic
├── package.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Contributing

Contributions are welcome! Feel free to fork this project and submit pull requests for any improvements, bug fixes, or new game additions.

## License

This project is open source and available under the MIT License. See LICENSE file for details.

## Credits

- Faulty terminal effect inspired by retro computing aesthetics
- ASCII art animations for visual flair
- Terminal interface design for authentic command-line experience
- Game implementations inspired by classic arcade and puzzle games
- WebGL effects powered by OGL library

## Contact

For questions or inquiries about this project, feel free to open an issue or contact the developer through the portfolio terminal.