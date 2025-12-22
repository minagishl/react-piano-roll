# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-12-22

### Added

- Initial release of @minagishl/react-piano-roll
- Core PianoRoll component with falling notes visualization
- Sample-based audio engine using Web Audio API
- Keyboard component with key highlighting
- External playback control API (play, pause, stop, seek)
- Comprehensive theming system
- Configurable keyboard sizes and layouts
- Animation configuration options
- TypeScript support with full type definitions
- Storybook documentation and examples
- Utility functions for MIDI note manipulation
- Support for custom audio engines
- Velocity-based note coloring
- Canvas-based rendering for performance
- Label feature for note identification
- Rounded corners feature for notes with customizable radius
- Sound selection feature for different audio samples
- Background playback feature for continuous audio
- MIDI sample songs for testing and demonstration
- Issue templates for GitHub repository
- CI/CD workflows (check, CodeQL, release)
- Code formatting tools (Prettier, ESLint)
- Git hooks with Commitlint and Husky
- Automated check workflow for CI
- CodeQL for security analysis
- Automated release workflow

### Changed

- Switched to pnpm for package management

### Fixed

- Corrected playback position for accurate timing
- Ensured first sound plays correctly at the start
- Prevented simultaneous playback conflicts

[Unreleased]: https://github.com/minagishl/react-piano-roll/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/minagishl/react-piano-roll/releases/tag/v0.1.0
