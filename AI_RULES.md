# AI Rules and Guidelines for Barden CRM

## Tech Stack Overview

- **Frontend Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system and dark mode
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: React Router v6 for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase with PostgreSQL and real-time subscriptions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## Component Architecture Rules

### UI Component Library Usage
- **Primary UI Components**: Use shadcn/ui components whenever possible
- **Custom Components**: Create in `src/components` when shadcn/ui doesn't meet requirements
- **Page Components**: Create in `src/pages` with PascalCase naming
- **Layout Components**: Place in `src/components/layout` for global layout elements

### Data Management
- **API Calls**: Use Supabase client for database operations
- **Real-time Data**: Implement Supabase real-time subscriptions for live updates
- **Local State**: Use React hooks (useState, useReducer) for component state
- **Server State**: Use React Query for caching, background updates, and request deduplication

### Form Handling
- **Form Library**: Always use React Hook Form for form handling
- **Validation**: Use Zod for schema validation with proper error messages
- **Form Components**: Wrap shadcn/ui form components with React Hook Form

### Styling Guidelines
- **Tailwind Classes**: Use Tailwind utility classes for styling
- **Custom Values**: Define design tokens in `src/index.css` variables
- **Responsive Design**: Implement mobile-first responsive design
- **Dark Mode**: Use CSS variables defined in `:root` for theme consistency

### Supabase Integration
- **Client Initialization**: Import from `@/integrations/supabase/client`
- **Type Safety**: Use generated types from `@/integrations/supabase/types`
- **Authentication**: Implement Supabase Auth for user management
- **Database Operations**: Use Supabase CRUD operations with proper error handling

### Error Handling
- **User Feedback**: Use Sonner for toast notifications
- **Error Boundaries**: Implement for catching unexpected errors
- **Validation Errors**: Display through form components with clear messages

### Performance Optimization
- **Component Splitting**: Split large components into smaller, focused ones
- **Bundle Optimization**: Lazy load non-critical components
- **Data Fetching**: Use React Query with appropriate caching strategies
- **Memoization**: Use React.memo and useMemo for expensive computations

## Library Usage Rules

### Approved Libraries
1. **UI Components**: shadcn/ui, Radix UI primitives
2. **State Management**: React Query, React Context
3. **Form Handling**: React Hook Form, Zod
4. **Date Utilities**: date-fns
5. **Charts**: Recharts
6. **Icons**: Lucide React
7. **Toast Notifications**: Sonner
8. **Class Utilities**: clsx, tailwind-merge

### Prohibited Libraries
1. **State Management**: Redux (use React Query + Context instead)
2. **UI Libraries**: Material UI, Ant Design (use shadcn/ui)
3. **Charting**: Chart.js (use Recharts)
4. **Date Libraries**: Moment.js (use date-fns)
5. **Form Libraries**: Formik (use React Hook Form)

## File Structure Rules

### Component Organization
```
src/
├── components/
│   ├── common/          # Reusable components across the app
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── ui/              # shadcn/ui components (do not modify)
│   └── [feature]/       # Feature-specific components
├── pages/               # Page components matching routes
├── hooks/               # Custom hooks
├── lib/                 # Utility functions
├── integrations/        # Third-party integrations
└── App.tsx              # Main app component with routes
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: PascalCase (`Dashboard.tsx`)
- **Hooks**: useCamelCase (`useAuth.ts`)
- **Utility Functions**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Development Guidelines

### Code Quality
- **TypeScript**: Use strict typing, avoid `any`
- **Component Props**: Define with TypeScript interfaces
- **Error Handling**: Always handle API errors gracefully
- **Loading States**: Implement for all async operations
- **Accessibility**: Follow WCAG guidelines for UI components

### Testing
- **Component Testing**: Test complex components with user interactions
- **Form Validation**: Test all validation rules
- **Edge Cases**: Test error states and empty states
- **Responsive Design**: Test on different screen sizes

### Security
- **User Input**: Sanitize all user inputs
- **Authentication**: Check user permissions before data operations
- **API Keys**: Never expose sensitive keys in client code
- **Data Validation**: Validate data both client and server side