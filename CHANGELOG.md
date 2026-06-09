# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-06-09

### Added

- Command palette with fuzzy search functionality accessible via `Ctrl/Cmd + K`
- Keyboard Shortcuts modal (`Ctrl/Cmd + /`) displaying all available shortcuts organized by category
- App drawer menu with navigation to All Notes, Trash, Settings, and informational sections
- Comprehensive Trash view with:
  - Deleted notes list with preview
  - Restore functionality for individual notes
  - Delete forever option for permanent removal
  - Empty trash action to clear all deleted notes
- Display settings panel with customization options:
  - Font size adjustment (small, medium, large, extra large)
  - Line height control (compact, normal, relaxed, loose)
  - Word wrap toggle
  - Editor line length adjustment
  - Note density options
  - Sort order preferences
  - Tag sorting options
  - Theme selection (dark/light mode)
- Note templates system with built-in templates:
  - Meeting Notes template (attendees, agenda, action items)
  - Daily Journal template (gratitude, priorities, reflection)
  - Task List template (checkbox-based task management)
  - Project Notes template (overview, milestones, resources)
  - Quick Note template (blank canvas)
- Template picker modal for creating notes from templates
- Quick capture modal for rapid note creation (`Ctrl/Cmd + N`)
- Archive functionality for organizing notes
- Favorite/star functionality to highlight important notes
- Icon components library:
  - Archive icon
  - Trash icon
  - Star icon
  - Settings icon
  - Command icon
  - And many more utility icons
- IconButton component for consistent interactive icon styling
- AppModal component for reusable modal dialogs
- Enhanced import/export functionality:
  - Support for JSON, TXT, Markdown formats
  - PDF text extraction helper
  - ZIP archive support for bulk operations
  - File dropzone interface
- Comprehensive test suite using Vitest:
  - Note logic tests (`noteLogic.test.ts`)
  - Store functionality tests (`notes.test.ts`)
  - Import/export module tests
- Bundled note fonts:
  - System UI (native)
  - Atkinson Hyperlegible (accessibility-focused)
  - Inter (modern sans-serif)
  - Source Serif 4 (readable serif)
  - Monospace (code-friendly)

### Changed

- Reworked editor toolbar into compact icon-based actions for preview, checklist, document info, and overflow menu
- Enhanced note-list header to match Simplenote-style compact toolbar with icon-only controls
- Improved mobile editor with unified toolbar containing back, preview, checklist, info, and overflow actions
- Refactored Settings dialog with tabbed interface (Account, Display, Tools sections)
- Updated line length calculation to use character-based sizing for better reading measure
- Enhanced note operations to support archive, favorite, and trash states
- Improved modal system architecture for better reusability and consistency
- Upgraded state management patterns with Zustand for better performance
- Better code organization with dedicated feature modules
- Enhanced accessibility across all interactive components
- Improved TypeScript type definitions throughout the codebase

### Fixed

- Note deletion now properly moves notes to trash instead of permanent deletion
- Removed duplicated notes-list hide/show control from editor toolbar
- Simplified hidden-notes reveal button into single compact "Notes" action
- Fixed direct mobile note routes so `/note/:id` properly opens editor pane
- Fixed mobile Markdown notes to open in edit mode by default instead of live preview
- Improved cross-tab synchronization reliability
- Fixed note sorting and filtering edge cases
- Enhanced error handling in import/export operations
- Fixed worker fallback handling for Markdown rendering
- Corrected Markdown checklist preview rendering (`- [ ]` and `- [x]`)

### Technical

- Added Vitest configuration for modern testing framework
- Implemented feature-based code organization
- Enhanced Web Worker API for background processing
- Improved IndexedDB storage adapter reliability
- Better TypeScript strict mode compliance
- Added comprehensive unit test coverage
- Optimized virtual scrolling performance
- Enhanced BroadcastChannel cross-tab communication

### Documentation

- Created comprehensive README.md with:
  - Feature overview
  - Installation instructions
  - Usage guide
  - Tech stack details
  - Project structure
  - Contributing guidelines
- Added this CHANGELOG.md following Keep a Changelog format
- Maintained PRODUCT.md for product context and UX principles
- Maintained DESIGN.md for visual system documentation

## [0.1.0] - 2026-06-08

### Added

- Initial release of NoteBro (forked from Quicknote template)
- Three-pane desktop layout with tags sidebar, note list, and editor
- Responsive mobile layout with collapsible navigation and focused editor view
- Local-first persistence using IndexedDB for offline-first functionality
- Cross-tab state synchronization via BroadcastChannel API
- Core note operations:
  - Create, edit, and delete notes
  - Pin important notes to top
  - Tag-based organization
  - Full-text search across title, content, and tags
- Sorting options:
  - Modified date (newest first)
  - Created date
  - Alphabetical by name
- Markdown support with three preview modes:
  - Edit mode (plain text editing)
  - Split mode (side-by-side editor and preview)
  - Preview mode (rendered view only)
- Markdown task list rendering with `- [ ]` and `- [x]` checkbox support
- KaTeX math formula rendering:
  - Inline formulas with `$...$`
  - Block formulas with `$$...$$`
- Note history tracking with text diff viewer
- Publish/share modal for local sharing routes
- Import functionality supporting:
  - JSON note exports
  - Plain text files (.txt)
  - Markdown files (.md)
  - PDF text extraction (helper mode)
  - ZIP archives with bulk import
- Export functionality:
  - Export all notes as JSON
  - Export as ZIP archive
- Virtual scrolling with React Virtuoso and TanStack Virtual for smooth performance with large note collections
- Drag and drop support for:
  - Note reordering with @dnd-kit
  - File uploads with react-dropzone
- Theme system:
  - Dark mode
  - Light mode
  - System preference detection
- User feedback:
  - Toast notifications with react-hot-toast
  - Loading skeletons with react-loading-skeleton
  - Modal dialogs with react-modal
- Keyboard shortcuts for common actions:
  - New note creation
  - Search activation
  - Markdown preview toggle
  - Checklist insertion
  - History view
  - Delete note
  - Focus editor
- Web Worker support via Comlink for background processing:
  - Markdown rendering
  - Text diff generation
  - ZIP export processing
  - Search indexing
  - PDF text extraction
- Zustand state management with mutative updates for optimal performance
- Wouter routing for client-side navigation
- Theme UI and Emotion for component styling
- Tailwind CSS 4 for utility-first styling
- Comprehensive date/time handling:
  - dayjs for date manipulation
  - timeago.js for relative time display
  - cronosjs for natural language date parsing
- hotkeys-js for cross-platform keyboard shortcuts

### Technical

- Built on Bun runtime for fast development and builds
- React 19 with latest concurrent features
- TypeScript 6 for type safety
- IndexedDB via idb library for structured storage
- Component architecture with Theme UI
- Worker-based architecture for non-blocking operations
- Modular feature organization
- Test coverage for core functionality

[Unreleased]: https://github.com/podsni/notebro/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/podsni/notebro/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/podsni/notebro/releases/tag/v0.1.0
