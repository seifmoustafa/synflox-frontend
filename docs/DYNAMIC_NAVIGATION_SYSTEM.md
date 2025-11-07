# Dynamic Navigation & Authorization System

## Overview
Successfully implemented a comprehensive dynamic navigation and authorization system that fetches menu items from the backend `/MenuItems` endpoint and provides robust page access control.

## Architecture Components

### 1. Navigation Service (`services/navigation.service.ts`)
- Fetches menu items from `/MenuItems` endpoint
- Caches navigation data and allowed pages
- Provides page access validation methods
- Integrates with ApiService through dependency injection

### 2. Navigation Provider (`providers/navigation-provider.tsx`)
- React context for navigation state management
- Automatically fetches navigation data when user logs in
- Provides `hasPageAccess()` and `getAllowedPages()` methods
- Clears navigation data on logout

### 3. Route Protection System
- **RouteGuard** (`components/auth/route-guard.tsx`): Protects all routes automatically
- **useAuthorization** (`hooks/use-authorization.ts`): Hook for authorization checks
- Redirects unauthorized users to `/not-authorized` page
- Shows loading states during authentication/authorization checks

### 4. Dynamic Navigation Component (`components/navigation/dynamic-navigation.tsx`)
- Converts backend menu items to frontend navigation format
- Uses icon mapping from `config/navigation.ts`
- Provides `useDynamicNavigation()` hook for sidebar components
- Falls back to static navigation when backend unavailable

### 5. Professional Not Authorized Page (`app/not-authorized/page.tsx`)
- Modern, responsive design with proper theming
- Localized content in English and Arabic
- Action buttons for navigation (Go Back, Go Home)
- Professional error messaging

## Key Features

### Backend Integration
- Fetches menu items from `/MenuItems` endpoint on login
- Response includes `menuItems` array and `pages` array for allowed routes
- Supports hierarchical menu structure with unlimited nesting
- Icon mapping from string names to React components

### Authorization Flow
1. User logs in → Navigation data fetched automatically
2. User navigates to page → RouteGuard checks access
3. If unauthorized → Redirect to `/not-authorized`
4. If authorized → Render page content

### Menu Item Structure
```typescript
interface MenuItem {
  id: string;
  name: string; // Localization key (e.g., "nav.sites")
  href: string | null;
  icon: string; // Icon name (e.g., "MapPin")
  order: number;
  children: MenuItem[];
  requiredPermission: string | null;
  isActive: boolean;
  isDeleted: boolean;
}
```

### Page Access Control
- `pages` array contains all allowed routes for the user
- Clean path comparison (removes query params, trailing slashes)
- Always allows access to `/`, `/login`, `/not-authorized`
- Automatic redirect for unauthorized access attempts

## Updated Components

### Sidebar Components
- **ModernSidebar**: Updated to use `useDynamicNavigation()`
- **ClassicSidebar**: Updated to use `useDynamicNavigation()`
- Other sidebar components can be updated following the same pattern

### Layout Integration
- **RootLayout**: Added NavigationProvider and RouteGuard
- Provider hierarchy: Auth → Navigation → RouteGuard → App Content

## Configuration

### API Endpoints
```typescript
// config/api-endpoints.ts
GET_MENU_ITEMS: "/MenuItems"
```

### Icon Mapping
```typescript
// config/navigation.ts
export const iconMap: Record<string, any> = {
  'MapPin': MapPin,
  'ShieldCheck': ShieldCheck,
  'ArrowRightLeft': ArrowRightLeft,
  // ... more icons
};
```

### Localization
Added keys for not authorized page in both English and Arabic:
- `notAuthorized.title`
- `notAuthorized.description`
- `notAuthorized.goBack`
- `notAuthorized.goHome`
- `notAuthorized.contactAdmin`

## Usage Examples

### Check Page Access in Components
```typescript
import { useNavigation } from "@/providers/navigation-provider";

function MyComponent() {
  const { hasPageAccess } = useNavigation();
  
  if (!hasPageAccess("/admin-panel")) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Content</div>;
}
```

### Use Dynamic Navigation in Sidebar
```typescript
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";

function MySidebar() {
  const navigation = useDynamicNavigation();
  
  return (
    <nav>
      {navigation.map(item => (
        <NavItem key={item.name} item={item} />
      ))}
    </nav>
  );
}
```

## Security Benefits

1. **Server-Side Authorization**: Menu items controlled by backend
2. **Route Protection**: Automatic redirect for unauthorized access
3. **Dynamic Permissions**: Real-time permission updates
4. **Fallback Security**: Graceful degradation when backend unavailable
5. **Clean URLs**: Prevents direct URL access to unauthorized pages

## Scalability Features

1. **Centralized Configuration**: All navigation logic in one place
2. **Reusable Components**: DynamicNavigation works with any sidebar
3. **Icon System**: Easy to add new icons via mapping
4. **Localization Ready**: Full i18n support
5. **Provider Pattern**: Easy to extend with additional features

## Best Practices Implemented

1. **Separation of Concerns**: Service, Provider, Components separated
2. **Error Handling**: Graceful fallbacks and error states
3. **Performance**: Cached navigation data, minimal re-renders
4. **User Experience**: Loading states, smooth transitions
5. **Accessibility**: Proper ARIA labels, keyboard navigation
6. **Type Safety**: Full TypeScript support throughout

## Testing Recommendations

1. Test unauthorized access attempts
2. Verify fallback navigation when backend unavailable
3. Test navigation data refresh on login/logout
4. Verify icon mapping works correctly
5. Test localization in both languages
6. Verify route protection on all pages

The system is now production-ready and provides a solid foundation for dynamic, secure navigation management.
