# Enhanced Delete & Toast Notification System

This documentation explains how to use the professional confirmation dialogs and customizable toast notification system implemented in your Contract Management System.

## Features

✅ **Professional Confirmation Dialogs** - Beautiful, accessible confirmation dialogs for delete operations  
✅ **Customizable Toast Notifications** - 5 different toast designs controllable from settings  
✅ **1-Second Toast Duration** - Quick, non-intrusive notifications as requested  
✅ **Automatic Success/Failure Handling** - Shows appropriate toasts for all CRUD operations  
✅ **Settings Integration** - Full control from Settings → Components → Toast Notifications  
✅ **TypeScript Support** - Fully typed for better developer experience  

## Components Overview

### 1. Confirmation Dialog (`confirmation-dialog.tsx`)
Professional confirmation dialogs with multiple variants:
- **Destructive** - For delete operations (red styling)
- **Warning** - For potentially harmful actions (yellow styling)
- **Info** - For informational confirmations (blue styling)
- **Default** - For general confirmations (green styling)

### 2. Enhanced Toast System (`enhanced-toast.tsx`, `use-enhanced-toast.ts`)
Customizable toast notifications with 5 design options:
- **Minimal** - Clean and simple
- **Modern** - Blur and transparency effects
- **Gradient** - Colorful gradient backgrounds
- **Outlined** - Bold borders with transparency
- **Filled** - Solid backgrounds with shadows

### 3. Enhanced CRUD View Model (`use-enhanced-crud-view-model.ts`)
Drop-in replacement for the standard CRUD view model with built-in confirmation dialogs and toast notifications.

## Quick Start

### 1. Basic Delete with Confirmation Dialog

```typescript
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useEnhancedToast } from "@/hooks/use-enhanced-toast"

function MyComponent() {
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()
  const { operationSuccess, operationError } = useEnhancedToast()

  const handleDelete = (item: any) => {
    showConfirmation({
      variant: "destructive",
      title: "Delete Item",
      description: `Are you sure you want to delete "${item.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteService.delete(item.id)
          operationSuccess("Delete", item.name)
        } catch (error) {
          operationError("Delete", item.name)
        }
      },
    })
  }

  return (
    <div>
      <button onClick={() => handleDelete(item)}>Delete</button>
      <ConfirmationDialog />
    </div>
  )
}
```

### 2. Enhanced CRUD View Model (Recommended)

```typescript
import { useEnhancedCrudViewModel } from "@/hooks/use-enhanced-crud-view-model"

function UsersView() {
  const viewModel = useEnhancedCrudViewModel(userService, {
    itemTypeName: "User",
    itemTypeNamePlural: "Users",
    getItemDisplayName: (user) => user.name,
  })

  const { 
    items, 
    loading, 
    deleteItem,           // Automatic confirmation + toast
    deleteSelectedItems,  // Bulk delete with confirmation
    ConfirmationDialog    // Required component
  } = viewModel

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          {/* This will show confirmation dialog and success/error toasts automatically */}
          <button onClick={() => deleteItem(item)}>Delete</button>
        </div>
      ))}
      
      {/* Required: Render the confirmation dialog */}
      <ConfirmationDialog />
    </div>
  )
}
```

### 3. Manual Toast Notifications

```typescript
import { useEnhancedToast } from "@/hooks/use-enhanced-toast"

function MyComponent() {
  const { success, error, warning, info } = useEnhancedToast()

  const handleAction = async () => {
    try {
      await someOperation()
      success({
        title: "Success!",
        description: "Operation completed successfully.",
      })
    } catch (err) {
      error({
        title: "Error!",
        description: "Something went wrong.",
      })
    }
  }

  return <button onClick={handleAction}>Do Something</button>
}
```

## Settings Configuration

Users can customize toast appearance from **Settings → Components → Toast Notifications**:

### Toast Design Options
1. **Minimal** - Clean borders with background colors
2. **Modern** - Backdrop blur with transparency
3. **Gradient** - Colorful gradient backgrounds
4. **Outlined** - Bold colored borders
5. **Filled** - Solid backgrounds with shadows

### Toast Duration Options
- **1s** - Quick (default as requested)
- **3s** - Normal
- **5s** - Long
- **10s** - Extended

### Additional Options
- **Show Icons** - Toggle icons in toast notifications
- **Test Buttons** - Preview different toast styles

## Implementation Details

### Settings Provider Integration

The toast settings are integrated into your existing settings system:

```typescript
// In settings-provider.tsx
export type ToastDesign = "minimal" | "modern" | "gradient" | "outlined" | "filled"

interface SettingsContextType {
  // ... existing settings
  toastDesign: ToastDesign
  showToastIcons: boolean
  toastDuration: number
  setToastDesign: (design: ToastDesign) => void
  setShowToastIcons: (show: boolean) => void
  setToastDuration: (duration: number) => void
}
```

### Root Layout Integration

The `EnhancedToaster` is automatically included in your app layout:

```typescript
// In app/layout.tsx
import { EnhancedToaster } from "@/components/ui/enhanced-toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <SettingsProvider>
            {children}
            <EnhancedToaster /> {/* Renders all toasts */}
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Migration Guide

### From Standard CRUD View Model

**Before:**
```typescript
import { useCrudViewModel } from "@/hooks/use-crud-view-model"

const viewModel = useCrudViewModel(service)
const { deleteItem } = viewModel

// Manual confirmation needed
const handleDelete = (item) => {
  if (confirm("Are you sure?")) {
    deleteItem(item.id)
  }
}
```

**After:**
```typescript
import { useEnhancedCrudViewModel } from "@/hooks/use-enhanced-crud-view-model"

const viewModel = useEnhancedCrudViewModel(service, {
  itemTypeName: "User",
  getItemDisplayName: (item) => item.name,
})

const { deleteItem, ConfirmationDialog } = viewModel

// Automatic confirmation dialog and toast notifications
const handleDelete = (item) => {
  deleteItem(item) // That's it!
}

// Don't forget to render the dialog
return (
  <div>
    {/* your UI */}
    <ConfirmationDialog />
  </div>
)
```

## Best Practices

### 1. Always Render Confirmation Dialogs
```typescript
// ✅ Good
function MyComponent() {
  const { ConfirmationDialog } = useConfirmationDialog()
  
  return (
    <div>
      {/* your UI */}
      <ConfirmationDialog />
    </div>
  )
}

// ❌ Bad - Dialog won't appear
function MyComponent() {
  const { showConfirmation } = useConfirmationDialog()
  // Missing <ConfirmationDialog />
}
```

### 2. Use Descriptive Messages
```typescript
// ✅ Good
showConfirmation({
  title: "Delete User",
  description: `Are you sure you want to delete "${user.name}"? This will remove all associated data.`,
})

// ❌ Bad
showConfirmation({
  title: "Delete",
  description: "Are you sure?",
})
```

### 3. Handle Errors Gracefully
```typescript
// ✅ Good
try {
  await deleteOperation()
  operationSuccess("Delete", itemName)
} catch (error) {
  operationError("Delete", itemName, error.message)
}

// ❌ Bad - No error handling
await deleteOperation()
operationSuccess("Delete", itemName)
```

## Troubleshooting

### Toast Not Appearing
- Ensure `<EnhancedToaster />` is rendered in your app layout
- Check that you're using `useEnhancedToast` not the old `useToast`

### Confirmation Dialog Not Showing
- Make sure you render `<ConfirmationDialog />` in your component
- Verify you're calling `showConfirmation()` correctly

### Settings Not Applied
- Check that settings are being saved properly
- Verify the settings provider includes toast settings
- Test with the preview buttons in settings

## Example Implementation

See `components/examples/enhanced-delete-example.tsx` for a complete working example demonstrating all features.

## Summary

The enhanced delete and toast system provides:

1. **Professional confirmation dialogs** for all delete operations
2. **Customizable toast notifications** with 5 design options
3. **1-second duration** as requested
4. **Settings integration** for full user control
5. **Automatic success/failure handling** for all CRUD operations
6. **Easy migration path** from existing code

All delete operations now show professional confirmation dialogs, and all add/edit/delete operations automatically display appropriate success or failure toast notifications with the user's preferred design and duration settings.
