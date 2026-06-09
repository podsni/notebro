# NoteBro

A modern, feature-rich note-taking application built with React, TypeScript, and Bun. NoteBro provides a seamless experience for capturing, organizing, and managing your notes with powerful features like templates, keyboard shortcuts, and a command palette.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bun](https://img.shields.io/badge/Bun-1.0+-orange.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)

## ✨ Features

### Core Features
- **Quick Capture**: Instantly create notes with Ctrl/Cmd+N
- **Rich Text Editing**: Write notes with markdown support
- **Canvas/Whiteboard Mode**: Infinite canvas with drawing, shapes, text, and connectors (powered by tldraw)
- **Note Organization**: Archive, favorite, and trash notes
- **Search**: Fast fuzzy search across all your notes
- **Templates**: Pre-built templates for meetings, tasks, journals, and more
- **Command Palette**: Quick access to all actions with Ctrl/Cmd+K

### User Interface
- **Three-pane Layout**: Tags, note list, and editor on desktop
- **Mobile Responsive**: Optimized navigation for mobile devices
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Customizable Display**: Adjust font size, line height, and word wrap
- **Drag & Drop**: Reorder notes with intuitive drag and drop
- **App Drawer Menu**: Easy navigation and settings access

### Advanced Features
- **Trash Management**: Restore or permanently delete notes
- **Note History**: Track changes with text diff viewer
- **Import/Export**: Backup and migrate your notes (JSON, TXT, Markdown, PDF, ZIP)
- **Markdown Preview**: Edit, Split, and Preview modes
- **KaTeX Math**: Render mathematical formulas
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Virtual Scrolling**: Handle thousands of notes smoothly
- **Offline Support**: Works completely offline with IndexedDB storage
- **Cross-tab Sync**: Real-time updates across browser tabs

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.0 or higher
- Node.js v18+ (optional, for compatibility)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:podsni/notebro.git
cd notebro
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

### Running Tests

```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

Type checking:
```bash
bunx tsc --noEmit
```

## 🎯 Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+K` | Open command palette |
| `Ctrl/Cmd+N` | Quick capture new note |
| `Ctrl/Cmd+/` | Show keyboard shortcuts |
| `Ctrl/Cmd+F` | Search notes |
| `Ctrl/Cmd+,` | Open settings |
| `Esc` | Close modals/dialogs |

### Command Palette

Press `Ctrl/Cmd+K` to open the command palette and quickly:
- Create new notes
- Switch between views (All, Archived, Favorites, Trash)
- Access settings
- Search for specific actions

### Note Templates

NoteBro includes pre-built templates for:
- **Meeting Notes**: Track attendees, agenda, and action items
- **Daily Journal**: Structured daily reflection and planning
- **Task List**: Simple checkbox-based task management
- **Project Notes**: Organize project details and milestones
- **Quick Note**: Blank template for quick thoughts

## 🛠️ Tech Stack

### Core
- **Bun**: Fast JavaScript runtime and bundler
- **React 19**: Modern UI library with latest features
- **TypeScript 6**: Type-safe development
- **Zustand**: Lightweight state management with mutative updates
- **Wouter**: Minimal routing library

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **Theme UI**: Themeable design system
- **Emotion**: CSS-in-JS styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon set
- **MDI React**: Material Design Icons

### Features & Utilities
- **IndexedDB (idb)**: Client-side storage
- **DayJS & Timeago.js**: Date manipulation and formatting
- **Hotkeys.js & CronosJS**: Keyboard shortcuts
- **React Hot Toast**: Toast notifications
- **React Virtuoso & TanStack Virtual**: Virtual scrolling
- **@dnd-kit**: Drag and drop functionality
- **React Dropzone**: File upload handling
- **Snarkdown**: Markdown parsing
- **KaTeX**: Math formula rendering
- **zip.js & fflate**: Archive handling
- **React PDF Viewer**: PDF preview support
- **Comlink**: Web Worker communication
- **Diffblazer**: Text diff visualization

## 📁 Project Structure

```
notebro/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── icons/          # Icon components (Icon, IconButton)
│   │   └── modals/         # Modal dialogs (AppModal, QuickCapture, TemplatePicker)
│   ├── features/           # Feature-specific modules
│   │   └── import-export/  # Import/export functionality
│   ├── lib/                # Utility functions and logic
│   │   ├── noteLogic.ts    # Core note operations
│   │   └── noteTemplates.ts # Note templates
│   ├── store/              # State management (Zustand)
│   │   ├── notes.ts        # Note store and actions
│   │   └── indexedDbStorage.ts # IndexedDB persistence
│   ├── workers/            # Web Workers
│   │   └── noteWorkerApi.ts # Background processing
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── dist/                   # Production build output
├── DESIGN.md              # Visual system documentation
├── PRODUCT.md             # Product context and UX principles
└── package.json           # Dependencies and scripts
```

## 💾 Data Storage

Notes are stored locally in the browser using IndexedDB under the **NoteBro** database. The app is local-first and does not connect to any external cloud service or account system.

**Important**: Export your notes from the toolbar before clearing browser storage or moving to another device.

### Cross-tab Synchronization

NoteBro uses BroadcastChannel API to sync state changes across multiple browser tabs in real-time. Open the app in multiple tabs and see your changes reflected instantly.

## 🧪 Testing

Run the test suite:
```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

Run type checking:
```bash
bunx tsc --noEmit
```

Verification before shipping:
```bash
bun test && bunx tsc --noEmit && bun run build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting
- Run type checking before committing

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Icons from [Lucide](https://lucide.dev) and [Material Design Icons](https://materialdesignicons.com)
- Inspired by great note-taking apps like Simplenote, Notion, Bear, and Obsidian

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/podsni/notebro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/podsni/notebro/discussions)

## ⚠️ Limitations

- No cloud sync or account login (local-first by design)
- No real-time collaboration backend
- Attachments are not stored permanently
- Published note links are local browser routes only

## 🗺️ Roadmap

- [ ] Enhanced markdown editor with toolbar
- [ ] Note linking and backlinks
- [ ] Advanced tags and filtering
- [ ] Cloud sync support (optional)
- [ ] Mobile app (React Native)
- [ ] Collaborative editing
- [ ] Plugin system
- [ ] End-to-end encryption
- [ ] Canvas/whiteboard mode
- [ ] AI-powered features

## 📄 Additional Documentation

- `PRODUCT.md`: Product context and UX principles
- `DESIGN.md`: Visual system, palette, typography, and layout
- `CHANGELOG.md`: Version history and changes

---

Made with ☕ and 💻 by the NoteBro community

