# Forestry 4 Documentation

A comprehensive React documentation application for the Forestry 4 state management library, built with Chakra UI and focused on developer experience.

## 🎯 Documentation Structure

The documentation is organized into three main categories to help developers learn progressively:

### 🚀 Getting Started
- **Quick Start** (`/`) - Overview and live demo
- **Why Forestry?** (`/why`) - Key differentiators and comparisons

### ⚡ Essential Features
*Start here for core functionality*
- **Store Basics** (`/store`) - Creating stores, configuration, basic usage
- **Actions & State** (`/actions`) - Defining actions, state updates, nested actions
- **React Integration** (`/react`) - Hooks, patterns, component integration

### 🔧 Power Tools
*Advanced features for complex applications*
- **Validation System** (`/validation`) - Built-in validation, error handling
- **Transaction System** (`/transactions`) - Atomic operations, rollback support
- **RxJS Integration** (`/rxjs`) - Reactive programming, operators
- **Advanced Patterns** (`/advanced`) - Debugging, performance, complex patterns

### 📚 Reference
- **API Reference** (`/api`) - Complete method and property documentation
- **Examples** (`/examples`) - Real-world usage examples

## 🌟 Key Features Highlighted

### 1. **Nested Actions**
- Actions can call other actions with `this.$`
- Build complex operations from simple components
- Perfect for business logic composition

### 2. **Strong Validation**
- Built-in validation on every state change
- Clear, actionable error messages
- Easily testable validation logic

### 3. **Universal Application**
- Same API for local and global state
- Start local, scale global without refactoring
- Consistent patterns everywhere

### 4. **Ease of Testing**
- Direct access to validation logic
- Synchronous action testing
- No mocking required

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Chakra UI 2** for components and theming
- **React Router 6** for navigation
- **Prism.js** for syntax highlighting
- **Vite** for fast development and building

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd apps/forestry4-docs
npm install --legacy-peer-deps
```

### Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🎨 Design Philosophy

### Progressive Disclosure
- Essential features first, power tools second
- Clear learning path from simple to advanced
- No overwhelming feature lists

### Interactive Examples
- Every feature has a working demo
- Tabbed code examples showing different approaches
- Live testing capabilities

### Developer-Focused
- Written for React developers
- Emphasizes practical usage over theory
- Real-world examples and patterns

## 📖 Content Strategy

### Essential Features Focus
The documentation emphasizes that developers can be productive immediately with just the essential features:
- Store creation
- Action definition
- React integration
- Basic state management

### Power Tools as Upgrades
Advanced features are presented as "power tools" that enhance the basic functionality:
- Validation for data integrity
- Transactions for complex operations
- RxJS for reactive patterns
- Advanced debugging and patterns

### Comparison-Driven
The "Why Forestry?" page directly compares with popular alternatives:
- Redux (complex setup vs. simple)
- Zustand (limited features vs. comprehensive)
- Context API (boilerplate vs. streamlined)

## 🔧 Component Architecture

### Navigation
- Persistent top navigation with dropdowns
- Clear categorization of content
- Active state indicators

### CodeTabs Component
- Tabbed interface for code examples
- Syntax highlighting with Prism.js
- Support for multiple languages/approaches

### Interactive Demos
- Live stores with real state updates
- Testing capabilities
- Visual feedback for actions

## 🎯 Target Audience

**Primary**: React developers looking for state management solutions
**Secondary**: Developers familiar with Redux/Zustand wanting alternatives
**Tertiary**: Teams needing robust validation and testing capabilities

## 📈 Success Metrics

- Time to first successful implementation
- Comprehension of key differentiators
- Adoption of advanced features
- Developer satisfaction with documentation

## 🚀 Deployment

The app can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

Build with `npm run build` and deploy the `dist` folder.
