# Navigation Configuration Guide

## Easy Switch Between Static and Dynamic Navigation

The system now supports easy switching between static navigation (hardcoded) and dynamic navigation (from backend) using a simple configuration flag.

## Configuration

### 1. Navigation Mode Switch

In `config/navigation.ts`, change the `USE_DYNAMIC_NAVIGATION` constant:

```typescript
/**
 * Navigation Configuration Switch
 * Set USE_DYNAMIC_NAVIGATION to false to use static navigation
 * Set to true to use backend navigation (requires /MenuItems endpoint)
 */
export const USE_DYNAMIC_NAVIGATION = true; // Change to false for static navigation
```

### 2. Static Navigation Mode (`USE_DYNAMIC_NAVIGATION = false`)

When set to `false`:
- Uses the `navigation` array defined in `config/navigation.ts`
- No backend calls to `/MenuItems` endpoint
- All pages are accessible (no route protection)
- Sidebar shows static menu items
- Perfect for development or when backend is not available

### 3. Dynamic Navigation Mode (`USE_DYNAMIC_NAVIGATION = true`)

When set to `true`:
- Fetches menu items from `/MenuItems` endpoint on login
- Route protection enabled based on `pages` array from backend
- Sidebar shows only allowed menu items for the user
- Unauthorized access redirects to `/not-authorized` page
- Full authorization system active

## Backend Requirements (Dynamic Mode Only)

### API Endpoint
- **URL**: `/MenuItems`
- **Method**: `GET`
- **Authentication**: Required (Bearer token)

### Response Format
```json
{
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": {
    "menuItems": [
      {
        "id": "uuid",
        "name": "nav.sites",
        "href": "/sites",
        "icon": "MapPin",
        "order": 1,
        "parentMenuItem": null,
        "children": [],
        "requiredPermission": null,
        "isDeleted": false,
        "isActive": true
      }
    ],
    "pages": ["/sites", "/roles", "/transactions"]
  }
}
```

## Icon Mapping

Icons are mapped from string names to React components in `config/navigation.ts`:

```typescript
export const iconMap: Record<string, any> = {
  'MapPin': MapPin,
  'ShieldCheck': ShieldCheck,
  'ArrowRightLeft': ArrowRightLeft,
  // Add more icons as needed
};
```

### Adding New Icons

1. Import the icon from `lucide-react` in `config/navigation.ts`
2. Add it to the `iconMap` object
3. Use the string name in your backend menu items

## Page Structure

### Not Authorized Page

The not-authorized page now follows the standard pattern:
- **Page**: `app/not-authorized/page.tsx` (wrapped with DashboardLayout)
- **View**: `views/not-authorized-view.tsx` (contains the UI logic)

## Route Protection

### Automatic Protection (Dynamic Mode)
- All routes are automatically protected
- Users are redirected to `/not-authorized` if they don't have access
- Access is determined by the `pages` array from backend

### No Protection (Static Mode)
- All routes are accessible
- No backend authorization checks
- Perfect for development

## Component Updates

### Sidebar Components
All sidebar components now use `useDynamicNavigation()` hook:

```typescript
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";

function MySidebar() {
  const navigation = useDynamicNavigation(); // Automatically handles static/dynamic
  // ... render navigation
}
```

### Updated Components
- ✅ ModernSidebar
- ✅ ClassicSidebar
- 🔄 Other sidebar components (update as needed)

## Development Workflow

### For Development (Static Navigation)
1. Set `USE_DYNAMIC_NAVIGATION = false`
2. Update the `navigation` array in `config/navigation.ts`
3. All pages accessible, no backend required

### For Production (Dynamic Navigation)
1. Set `USE_DYNAMIC_NAVIGATION = true`
2. Ensure `/MenuItems` endpoint is implemented
3. Configure user permissions in backend
4. Test authorization flow

## Troubleshooting

### Build Errors
If you see import errors for `navigation`:
- Ensure `navigation` is exported from `config/navigation.ts`
- Check that all sidebar components import from the correct path

### Authorization Issues
- Verify `USE_DYNAMIC_NAVIGATION` setting
- Check backend response format
- Ensure user has proper permissions
- Check browser network tab for API calls

### Icon Issues
- Verify icon name in backend matches `iconMap`
- Add missing icons to `iconMap`
- Check appLogger for icon-related errors

## Migration Guide

### From Old Static Navigation
1. Your existing navigation array is preserved
2. Set `USE_DYNAMIC_NAVIGATION = false` to keep current behavior
3. Gradually migrate to dynamic navigation when ready

### To Dynamic Navigation
1. Implement `/MenuItems` backend endpoint
2. Set `USE_DYNAMIC_NAVIGATION = true`
3. Test with different user permission levels
4. Update icon mapping as needed

## Best Practices

1. **Development**: Use static navigation for faster development
2. **Testing**: Test both modes to ensure compatibility
3. **Production**: Use dynamic navigation for security
4. **Icons**: Keep icon mapping updated with backend requirements
5. **Fallbacks**: System gracefully handles missing data

The system is designed to be flexible and maintainable, allowing easy switching between modes based on your needs.
