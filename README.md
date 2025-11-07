# Professional Admin Dashboard Template

A comprehensive, scalable admin dashboard template built with Next.js 14, featuring multi-language support (Arabic/English), MVVM architecture, and professional UI/UX design.

## 🚀 Features

### Core Features
- **Multi-language Support**: Arabic (RTL) and English (LTR) with complete UI adaptation
- **MVVM Architecture**: Clean separation of concerns with ViewModels
- **Dependency Injection**: Service-based architecture following SOLID principles
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: Complete theme system with system preference detection
- **Professional UI/UX**: Modern, clean design with smooth animations

### Technical Features
- **Next.js 14**: Latest App Router with Server Components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Generic Components**: Reusable, configurable UI components
- **Service Layer**: Abstracted API calls with error handling
- **State Management**: React hooks with custom ViewModels

## 🏗️ Architecture

### MVVM Pattern Implementation

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      View       │    │   ViewModel     │    │     Model       │
│   (React UI)    │◄──►│  (Business      │◄──►│   (Services)    │
│                 │    │   Logic)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Service Layer Architecture

\`\`\`
┌─────────────────┐
│   Components    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   ViewModels    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│    Services     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   API Layer     │
└─────────────────┘
\`\`\`

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**:
   Create a `.env.local` file:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   \`\`\`

4. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Language Configuration
The template supports easy language addition. To add a new language:

1. **Update the translations** in `providers/i18n-provider.tsx`:
   \`\`\`typescript
   const translations = {
     en: { /* English translations */ },
     ar: { /* Arabic translations */ },
     fr: { /* Add French translations */ }
   }
   \`\`\`

2. **Add the language option** in the header component.

### Backend Integration

#### API Service Configuration
The `ApiService` class handles all HTTP requests:

\`\`\`typescript
// services/api.service.ts
const apiService = new ApiService("https://your-api-url.com")

// Usage in services
export class UserService {
  constructor(private apiService: IApiService) {}
  
  async getUsers() {
    return this.apiService.get<User[]>("/users")
  }
}
\`\`\`

#### Data Flow Example

1. **Component** calls ViewModel method
2. **ViewModel** calls Service method  
3. **Service** calls API through ApiService
4. **Response** flows back through the chain
5. **UI** updates with new data

\`\`\`typescript
// In Component
const viewModel = new UsersViewModel(userService)
const { users, loading, createUser } = viewModel.useState()

// In ViewModel
async createUser(userData: CreateUserRequest) {
  await this.userService.createUser(userData)
  await this.loadUsers() // Refresh data
}

// In Service
async createUser(data: CreateUserRequest): Promise<User> {
  const user = await this.apiService.post<User>("/users", data)
  this.notificationService.success("User created successfully")
  return user
}
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── ui/               # Generic UI components
│   └── views/            # Page view components
├── providers/            # Context providers
├── services/             # Business logic services
├── viewmodels/           # MVVM ViewModels
└── lib/                  # Utility functions
\`\`\`

## 🎨 Customization

### Theme Customization
Modify the CSS variables in `app/globals.css`:

\`\`\`css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* Add your custom colors */
}
\`\`\`

### Component Customization
All components are built to be easily customizable:

\`\`\`typescript
// Generic Table with custom columns
<GenericTable
  data={users}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { 
      key: "status", 
      label: "Status",
      render: (value) => <StatusBadge status={value} />
    }
  ]}
  actions={[
    { label: "Edit", onClick: handleEdit },
    { label: "Delete", onClick: handleDelete, variant: "destructive" }
  ]}
/>
\`\`\`

## 🔒 Security Features

- **Authentication Ready**: Token-based auth structure
- **Role-based Access**: User role management system
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Comprehensive error management

## 📱 Responsive Design

The template is fully responsive with:
- **Mobile-first approach**
- **Adaptive sidebar** (drawer on mobile, fixed on desktop)
- **Responsive tables** with horizontal scroll
- **Touch-friendly interactions**

## 🌐 RTL Support

Complete RTL support for Arabic:
- **Layout mirroring**: Sidebar, navigation, and content
- **Typography**: Arabic font (Cairo) integration
- **Icons and spacing**: Proper RTL alignment
- **Form layouts**: RTL-aware form controls

## 🚀 Production Deployment

### Build for Production
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables for Production
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-production-api.com
NODE_ENV=production
\`\`\`

## 🤝 Contributing

This template is designed to be:
- **Maintainable**: Clean code structure with TypeScript
- **Scalable**: Service-based architecture
- **Extensible**: Easy to add new features and pages
- **Reusable**: Generic components for rapid development

## 📄 License

This template is provided as-is for educational and commercial use.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
