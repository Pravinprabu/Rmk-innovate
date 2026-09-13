# Project Requirements & Dependency Specification

This document provides a comprehensive list of system requirements, dependencies, configuration details, and setup instructions for the **MediKiosk** monorepo (`Rmk-innovate`).

---

## 1. System & Environment Requirements

| Requirement | Supported / Tested Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (Tested on `v24.13.0`) | JavaScript runtime |
| **npm** | `>= 9.0.0` (Tested on `11.6.2`) | Node package manager |
| **Operating System** | Windows / macOS / Linux | Cross-platform compatible |
| **Windows Shell Note** | PowerShell / Command Prompt | If PowerShell restricts `.ps1` execution, invoke via `npm.cmd` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| **Mobile Testing** | Expo Go app / Android Emulator / iOS Simulator | For testing the `mobile` app on device or emulator |
| **Backend API** | Expected at `http://localhost:8000` | Django REST API (configurable in `.env`) |

---

## 2. Monorepo Architecture

The repository contains two main frontend applications:

1. **`mobile/`**: Patient-facing slot-booking application built using React Native and the Expo framework.
2. **`web-frontend/admin/`**: Multi-role hospital management web portal built with React 19, Vite, and Tailwind CSS (serves Super Admin, Hospital Admin, and Hospital Staff / Doctor / Triage).

---

## 3. Subproject: Mobile App (`mobile/`)

### Purpose
Allows patients to look up hospitals, select available 30-minute appointment/arrival slots, fill in ABHA identification details, upload or capture supporting medical documents, and receive booking confirmations.

### Runtime & Framework
- **Framework**: Expo SDK ~57
- **Core**: React 19.2.3, React Native 0.86.3
- **Platforms**: Android, iOS, Web

### Dependencies List (`mobile/package.json`)

| Package Name | Version Specifier | Purpose / Role in Project |
| :--- | :--- | :--- |
| `expo` | `~57.0.20` | Core Expo runtime and development SDK |
| `expo-document-picker` | `~57.0.1` | Native file picker for uploading medical documents/reports |
| `expo-image-picker` | `~57.0.16` | Access device camera and photo library for document uploads |
| `expo-status-bar` | `~57.0.1` | Native status bar styling and overlay handling |
| `react` | `19.2.3` | React library |
| `react-dom` | `19.2.3` | React DOM renderer for web support |
| `react-native` | `0.86.3` | React Native framework for cross-platform native mobile apps |
| `react-native-web` | `^0.21.2` | Translates React Native components to web DOM elements |

### Environment Variables (`mobile/.env`)
- `EXPO_PUBLIC_API_BASE_URL`: Base URL of the backend service (default: `http://localhost:8000`).

### Execution Commands
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server (interactive menu)
npm start

# Run in Web browser
npm run web

# Run on Android (device or connected emulator)
npm run android

# Run on iOS (macOS only)
npm run ios
```

---

## 4. Subproject: Web Admin Portal (`web-frontend/admin/`)

### Purpose
Single-origin web application supporting 3 administrative and clinical roles differentiated by URL routes:
- **Super Admin**: `http://localhost:3000/super-admin/login`
- **Hospital Admin**: `http://localhost:3000/hospital-admin/login`
- **Staff (Doctor & Triage)**: `http://localhost:3000/staff/login`

### Runtime & Framework
- **Framework / Bundler**: Vite 8 with `@vitejs/plugin-react`
- **Frontend Library**: React 19
- **Styling**: Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/vite`)
- **Routing**: `react-router-dom` v7
- **Linter**: `oxlint`

### Dependencies List (`web-frontend/admin/package.json`)

#### Production Dependencies (`dependencies`)

| Package Name | Version Specifier | Purpose / Role in Project |
| :--- | :--- | :--- |
| `react` | `^19.2.8` | Core UI component engine |
| `react-dom` | `^19.2.8` | React DOM renderer |
| `react-router-dom` | `^7.18.3` | Declarative routing and route guarding (`ProtectedRoute`) |
| `tailwindcss` | `^4.3.3` | Modern utility-first CSS framework |
| `@tailwindcss/vite` | `^4.3.3` | Official Tailwind CSS v4 integration plugin for Vite |

#### Development Dependencies (`devDependencies`)

| Package Name | Version Specifier | Purpose / Role in Project |
| :--- | :--- | :--- |
| `vite` | `^8.2.2` | High-performance build tool and local dev server (`port 3000`) |
| `@vitejs/plugin-react` | `^6.1.0` | React Fast Refresh support and JSX compilation plugin |
| `@types/react` | `^19.2.18` | TypeScript definitions and IDE autocompletion for React |
| `@types/react-dom` | `^19.2.4` | TypeScript definitions and IDE autocompletion for React DOM |
| `oxlint` | `^1.79.0` | High-speed Rust-based JavaScript/JSX linter |

### Environment Variables (`web-frontend/admin/.env`)
- `VITE_API_BASE_URL`: Base URL of the backend API (default: `http://localhost:8000`).

### Execution Commands
```bash
# Navigate to web admin directory
cd web-frontend/admin

# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Lint codebase
npm run lint

# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Root Orchestration Scripts

From the repository root, you can manage both projects without having to switch directories manually:

| Command | Action |
| :--- | :--- |
| `npm run install:all` | Installs dependencies across both `mobile` and `web-frontend/admin` |
| `npm run admin:dev` | Launches the Vite dev server for the admin web portal |
| `npm run admin:build` | Compiles the production build for the admin web portal |
| `npm run admin:lint` | Runs the Oxlint linter on the admin codebase |
| `npm run mobile:start` | Starts the Expo dev server for the mobile app |
| `npm run mobile:web` | Launches the mobile app in web mode |
| `npm run mobile:android` | Launches the mobile app for Android |
| `npm run mobile:ios` | Launches the mobile app for iOS |

---

## 6. Verification Status

- **`mobile`**: All 488 packages audited and verified via Expo CLI (`v57.0.22`).
- **`web-frontend/admin`**: All 46 packages audited and verified; production build successfully compiled with Vite (`dist/` generated with 0 errors); lint passed with Oxlint.
