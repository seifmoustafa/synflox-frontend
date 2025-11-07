# Centralized Logo System

This system allows you to control the logo/icon across all layouts from one place.

## Quick Start

### 1. Change Logo Type
Edit `config/logo.ts` to change the logo type:

```typescript
export const logoConfig = {
  type: "sparkles", // Options: "sparkles", "shield", "image", "custom"
  // ... other config
};
```

### 2. Available Logo Types

#### Sparkles Icon
```typescript
type: "sparkles"
```
Uses the Sparkles icon from Lucide React.

#### Shield Icon  
```typescript
type: "shield"
```
Uses the Shield icon from Lucide React.

#### Custom Image
```typescript
type: "image",
imagePath: "/your-logo.svg"
```
Uses a custom image file.

#### Custom Text
```typescript
type: "custom",
text: "SA"
```
Uses custom text as the logo.

## Usage in Components

### Basic Usage
```tsx
import { Logo } from "@/components/ui/logo";

<Logo />
```

### With Custom Size
```tsx
<Logo size="lg" />
```

### With Custom Variant
```tsx
<Logo variant="gradient" />
```

### Combined
```tsx
<Logo size="xl" variant="outline" className="my-custom-class" />
```

## Available Sizes
- `sm`: 24px × 24px
- `md`: 32px × 32px (default)
- `lg`: 40px × 40px
- `xl`: 48px × 48px

## Available Variants
- `default`: Primary color text
- `gradient`: Gradient background with white text
- `outline`: Border with primary color

## Helper Functions

```typescript
import { updateLogoType, updateLogoImage, updateLogoText } from "@/config/logo";

// Change logo type
updateLogoType("shield");

// Change logo image
updateLogoImage("/new-logo.png");

// Change logo text
updateLogoText("NEW");
```

## Layouts Using This System

✅ **ModernSidebar** - Uses centralized Logo component
✅ **Sidebar** - Uses centralized Logo component  
✅ **ElegantHeader** - Uses centralized Logo component
✅ **All other layouts** - Can be updated to use this system

## Benefits

1. **Single Source of Truth**: Change logo once, updates everywhere
2. **Consistent Styling**: All logos use the same styling system
3. **Easy Customization**: Simple config file to change logo type
4. **Type Safety**: Full TypeScript support
5. **Flexible**: Supports icons, images, and custom text 