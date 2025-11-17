# Screenshot Tracker

A Vite Electron desktop application that automatically captures screenshots every 30 seconds when the tracker is active.

## Features

- **Automatic Screenshot Capture**: Takes screenshots every 30 seconds when tracking is enabled
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui components
- **Electron Desktop App**: Cross-platform desktop application
- **IPC Communication**: Secure communication between main and renderer processes
- **Screenshot Storage**: All screenshots are saved in the `screenshots` folder with timestamps

## Tech Stack

- **Vite**: Fast build tool and development server
- **Electron**: Cross-platform desktop application framework
- **TypeScript**: Type-safe JavaScript
- **React**: UI library
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **screenshot-desktop**: Native screenshot capture library

## Project Structure

```
tracker/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Preload script for IPC
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── types/
│   │   └── electron.d.ts # TypeScript definitions
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind CSS imports
├── screenshots/         # Screenshot storage folder
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nazmulhossain17/tracker.git
cd tracker
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the application in development mode:

```bash
npm run dev
```

This will start the Vite dev server and launch the Electron application with hot-reload enabled.

### Building

Build the application for production:

```bash
npm run build
```

Build the Electron application:

```bash
npm run electron:build
```

## Usage

1. Launch the application
2. Click the "Start Tracker" button to begin capturing screenshots
3. Screenshots will be taken every 30 seconds and saved to the `screenshots` folder
4. Click the "Stop Tracker" button to stop capturing screenshots
5. View the screenshot count and last captured screenshot filename in the UI

## Screenshots Location

All screenshots are saved in the `screenshots` folder in the application directory with the following naming format:
```
screenshot-YYYY-MM-DDTHH-MM-SS-mmmZ.png
```

## How It Works

### Electron Main Process
- Handles screenshot capture using the `screenshot-desktop` library
- Manages the screenshot interval (30 seconds)
- Saves screenshots to the `screenshots` folder
- Communicates with the renderer process via IPC

### Preload Script
- Provides secure IPC communication between main and renderer processes
- Exposes the Electron API to the renderer process through `contextBridge`

### React Renderer Process
- Provides the user interface
- Displays tracker status (active/inactive)
- Shows screenshot count and last captured screenshot
- Sends start/stop commands to the main process

## License

ISC

## Author

Created by builtforyou.xyz@gmail.com (@nazmulhossain17)

## Devin Session

This project was created by Devin AI.
Link to Devin run: https://app.devin.ai/sessions/c6afa286f60345ff8de39d39a1df749e
