# API Integration Documentation

## Overview
This document outlines the API integration structure for the FundHub frontend application. All mock data and logic have been removed and replaced with real API service calls.

## API Service Structure

### Core API Service (`src/services/api.ts`)
- Base API service class with authentication handling
- Centralized request/response management
- Token management for authenticated requests

### Service Modules

#### Authentication (`src/services/auth.ts`)
- `login(credentials)` - User login
- `signup(userData)` - Donor registration
- `signupStudent(studentData)` - Student registration
- `logout()` - User logout
- `setToken(token)` - Set authentication token

#### Projects (`src/services/projects.ts`)
- `getProjects(filters?)` - Fetch projects with optional filters
- `getProject(id)` - Fetch single project
- `createProject(projectData)` - Create new project
- `updateProject(id, projectData)` - Update existing project
- `deleteProject(id)` - Delete project

#### Campaigns (`src/services/campaigns.ts`)
- `getCampaigns(filters?)` - Fetch campaigns with optional filters
- `getCampaign(id)` - Fetch single campaign

#### Donations (`src/services/donations.ts`)
- `getDonations(filters?)` - Fetch donations with optional filters
- `createDonation(donationData)` - Create new donation

#### Admin (`src/services/admin.ts`)
- `getPendingVerifications()` - Fetch pending student verifications
- `approveVerification(id)` - Approve student verification
- `rejectVerification(id)` - Reject student verification
- `getAnalytics()` - Fetch platform analytics

## Environment Configuration

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_APP_NAME=FundHub
VITE_APP_VERSION=1.0.0
```

## Updated Components

### Authentication Components
- **Login** (`src/pages/auth/Login.tsx`) - Now uses `authAPI.login()`
- **Signup** (`src/pages/auth/Signup.tsx`) - Now uses `authAPI.signup()` and `authAPI.signupStudent()`

### Project Components
- **Projects** (`src/pages/Projects.tsx`) - Now uses `projectsAPI.getProjects()`
- **ProjectDetail** (`src/pages/ProjectDetail.tsx`) - Now uses `projectsAPI.getProject()` and `donationsAPI.getDonations()`
- **CreateProject** (`src/pages/student/CreateProject.tsx`) - Now uses `projectsAPI.createProject()`

### Campaign Components
- **Campaigns** (`src/pages/Campaigns.tsx`) - Now uses `campaignsAPI.getCampaigns()`

### Dashboard Components
- **DonorDashboard** (`src/pages/donor/DonorDashboard.tsx`) - Now uses `donationsAPI.getDonations()` and `projectsAPI.getProjects()`
- **AdminDashboard** (`src/pages/admin/AdminDashboard.tsx`) - Now uses `adminAPI.getPendingVerifications()`

## API Endpoints Expected

The frontend expects the following backend API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - Donor registration
- `POST /auth/signup/student` - Student registration
- `POST /auth/logout` - User logout

### Projects
- `GET /projects` - List projects (with query parameters)
- `GET /projects/:id` - Get single project
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Campaigns
- `GET /campaigns` - List campaigns (with query parameters)
- `GET /campaigns/:id` - Get single campaign

### Donations
- `GET /donations` - List donations (with query parameters)
- `POST /donations` - Create donation

### Admin
- `GET /admin/verifications/pending` - Get pending verifications
- `POST /admin/verifications/:id/approve` - Approve verification
- `POST /admin/verifications/:id/reject` - Reject verification
- `GET /admin/analytics` - Get platform analytics

## Error Handling

All API calls include proper error handling with user-friendly error messages displayed via toast notifications.

## Authentication

The API service automatically includes the authentication token in request headers when available. Tokens are stored in localStorage and managed by the auth store.

## Next Steps

1. Ensure the backend API endpoints match the expected structure
2. Test all API integrations with the running backend
3. Add proper error handling for network failures
4. Implement loading states for better UX
5. Add retry logic for failed requests
