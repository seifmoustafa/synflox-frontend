# SYNFLOX Frontend Monorepo

A comprehensive frontend monorepo for the SYNFLOX Central Licensing System, containing the Admin Dashboard and Client Portal applications.

## 📁 Project Structure

```
synflox-frontend/
├── package.json              # Workspace root + shared dependencies
├── .gitmodules               # Git submodule configuration
│
├── packages/
│   └── shared/               # @synflox/shared - Shared code package
│       ├── components/ui/    # 50+ UI components (shadcn/ui)
│       ├── lib/              # Utilities (utils, validation, logger)
│       └── locales/          # i18n translations (en, ar)
│
└── apps/
    ├── admin/                # @synflox/admin-portal (Git Submodule)
    │   ├── app/              # Next.js pages (31 routes)
    │   ├── domain/           # Domain models
    │   ├── services/         # API services
    │   ├── viewmodels/       # Business logic
    │   ├── views/            # UI components
    │   └── Port: 3000
    │
    └── client/               # @synflox/client-portal (Git Submodule)
        ├── app/              # Next.js pages (4 routes)
        ├── services/         # Client API service
        ├── providers/        # Auth provider
        └── Port: 3001
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/seifmoustafa/SYNFLOX-Project.git
cd synflox-frontend

# Install all dependencies
npm install
```

### Development

```bash
# Start Admin Portal (port 3000)
npm run dev:admin

# Start Client Portal (port 3001)
npm run dev:client

# Start both simultaneously
npm run dev:all
```

### Build

```bash
# Build both apps
npm run build

# Build individually
npm run build:admin
npm run build:client
```

### Production

```bash
# Start Admin in production
npm run start:admin

# Start Client in production
npm run start:client
```

## 📦 Git Submodules

| Package | Repository | Port |
|---------|------------|------|
| Admin Portal | [synflox-admin-portal](https://github.com/seifmoustafa/synflox-admin-portal) | 3000 |
| Client Portal | [synflox-client-portal](https://github.com/seifmoustafa/synflox-client-portal) | 3001 |

### Working with Submodules

```bash
# Update submodules to latest
git submodule update --remote

# Clone with submodules
git clone --recurse-submodules <repo-url>

# Initialize submodules after clone
git submodule init
git submodule update
```

## 🏗️ Architecture

Both applications follow **Clean Architecture** with strict layer separation:

```
Pages → Views → ViewModels → Services → Domain Models
```

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **State**: React Hooks + Context
- **i18n**: i18next (English + Arabic)

## 📋 Features

### Admin Portal (31 pages)
- Dashboard (6 dashboards)
- Companies Management
- Subscriptions Lifecycle
- Plans & Entitlements
- Projects & Modules
- Admin Management
- License Generation
- Security & 2FA

### Client Portal (4 pages)
- Token-based Login
- Device Dashboard
- Offline Device Management
- Online Device Management

## 🔧 Configuration

Each app has its own `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5035/api
```

## 📝 License

Private - SYNFLOX Central Licensing System
