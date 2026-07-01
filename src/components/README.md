# Components

This directory contains all React components for the SamKass application.

## Directory Structure

### `/ui`
Reusable UI components that don't have business logic:
- Button
- Input
- Card
- Modal
- Tabs
- etc.

### `/containers`
Smart/Container components that handle business logic:
- LoanContainer
- SettingsContainer
- DashboardContainer
- etc.

### `/layouts`
Layout wrapper components:
- MainLayout
- AuthLayout
- DashboardLayout

### `/common`
Commonly used components:
- Header
- Footer
- Navigation
- Sidebar

### `/hooks`
Custom React hooks:
- useAuth
- useLoan
- useSettings
- useNotification

## Component Guidelines

### Naming
- Use PascalCase for component files and exports
- Use descriptive names that indicate the component's purpose
- Prefix container components with Container or use "Smart" suffix

### Props
- Define interfaces for all props
- Document props with JSDoc comments
- Use optional props sparingly
- Provide sensible defaults

### Performance
- Use React.memo() for pure components
- Use useMemo() for expensive computations
- Use useCallback() for event handlers
- Lazy load non-critical components

### Error Handling
- Wrap components in Error Boundaries
- Provide meaningful error messages
- Log errors appropriately
- Implement fallback UI

### Testing
- Write unit tests for all components
- Test user interactions
- Mock external dependencies
- Aim for 80%+ coverage
