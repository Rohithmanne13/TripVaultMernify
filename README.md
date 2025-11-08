# TripVault - Your All in One Travel Companion

TripVault is a collaborative trip and event management platform that consolidates all aspects of group travel planning into one unified workspace. From initial brainstorming to post trip memories, friends can plan itineraries, split expenses, share photos, and coordinate activities in real time eliminating the need to juggle multiple apps.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Real-time Features](#real-time-features)
- [Settlement Algorithm](#settlement-algorithm)
- [File Upload](#file-upload)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## Overview

TripVault is a modern expense management system designed for group trips. It helps users track expenses, split costs automatically, calculate settlements, manage trip-related activities collaboratively, and share memorable moments through photos and captures. Built with Next.js, Express.js, MongoDB, and Clerk authentication, it provides a seamless experience with real-time updates via Socket.io.

Whether you're planning a weekend getaway or an extended vacation, TripVault keeps your trip organized with expense tracking, settlement calculations, collaborative idea boards, and photo sharing capabilities - all in one place.

### Key Highlights

- ✅ **Complete Expense Management** - Track, categorize, and split expenses effortlessly
- ✅ **Smart Settlement Calculator** - Automatically calculates who owes whom with optimized transactions
- ✅ **Real-time Updates** - Live synchronization across all users
- ✅ **Comprehensive Analytics** - Visual insights into spending patterns
- ✅ **Secure Authentication** - Clerk-powered authentication with JWT tokens
- ✅ **Payment QR Codes** - Easy payment tracking with QR code uploads
- ✅ **Receipt Management** - Upload and view expense receipts
- ✅ **Export Functionality** - Export expenses as PDF or CSV
- ✅ **Idea Board** - Collaborative trip planning with ideas and suggestions
- ✅ **Transaction Logging** - Complete audit trail of all activities
- ✅ **Captures & Moments** - Share photos and capture memorable trip moments with your group

## Features

### Expense Management
- Create, read, update, and delete expenses
- Category-based expense tracking (Food, Transport, Accommodation, Activities, Shopping, Other)
- Split expenses among multiple trip members
- Upload and view receipt images
- Date-based expense organization
- Per-person split amount calculation
- Export expenses as PDF or CSV

### Settlement System
- Automatic calculation of who owes whom
- Optimized algorithm to minimize transactions
- Mark settlements as paid
- Settlement history tracking
- Payment QR code integration
- Visual "from → to" representation

### Analytics & Reporting
- Budget vs Actual expenses comparison
- Category-wise expense breakdown
- Visual progress bars with color coding
- Spending statistics and trends
- Transaction log with filtering
- Export capabilities (PDF)

### Trip Management
- Create and manage multiple trips
- Add/remove trip members
- Budget tracking and monitoring
- Admin permissions and roles
- Trip details and statistics
- Member management

### Idea Board
- Collaborative trip planning
- Add ideas with location, time, and tags
- Search and filter ideas
- Delete ideas
- Trip specific idea management

### Captures & Moments
- Share photos and moments from your trip
- Upload multiple images per capture
- Add captions and descriptions
- View gallery of all trip captures
- Like and comment on captures
- Date and location tagging
- Real-time updates when new captures are added
- Filter captures by date or location

### User Management
- Clerk authentication integration
- User profile management
- Payment QR code upload
- Profile picture support
- Secure session management

### Real-time Features
- Live expense updates
- Real time settlement changes
- Instant payment notifications
- Live capture sharing and updates
- Socket.io based communication
- Room based messaging per trip
- Real time notifications for new captures, likes, and comments

### Transaction Logging
- Complete audit trail
- Activity type filtering
- User attribution
- Timestamp tracking
- Statistics and analytics

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Authentication**: Clerk Next.js
- **Notifications**: Sonner
- **Theming**: next-themes

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.3
- **Authentication**: Clerk Backend
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer
- **Export**: PDFKit, json2csv

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: ESLint
- **Build Tool**: Next.js Build

## 📁 Project Structure

```
TripVault/
├── Backend/                          # Express.js backend
│   ├── controllers/                  # Business logic
│   │   ├── ExpenseController.js     # Expense CRUD & export
│   │   ├── SettlementController.js  # Settlement calculations
│   │   ├── TransactionLogController.js # Activity logging
│   │   ├── TripController.js        # Trip management
│   │   ├── UserController.js        # User & QR code
│   │   ├── ClerkController.js       # Clerk webhook handler
│   │   ├── DetailsController.js     # Idea board management
│   │   └── CapturesController.js    # Captures management
│   ├── models/                      # MongoDB schemas
│   │   ├── ExpenseModel.js         # Expense schema
│   │   ├── SettlementModel.js      # Settlement schema
│   │   ├── TransactionLogModel.js  # Log schema
│   │   ├── TripModel.js            # Trip schema
│   │   ├── UserModel.js            # User schema
│   │   ├── IdeaModel.js            # Idea schema
│   │   └── CaptureModel.js         # Capture schema
│   ├── routes/                      # API routes
│   │   ├── ExpenseRoutes.js        # Expense endpoints
│   │   ├── SettlementRoutes.js     # Settlement endpoints
│   │   ├── TransactionLogRoutes.js # Log endpoints
│   │   ├── TripRoutes.js           # Trip endpoints
│   │   ├── UserRoutes.js           # User endpoints
│   │   ├── ClerkRoutes.js          # Clerk webhook routes
│   │   ├── DetailsRoutes.js        # Idea board routes
│   │   └── CapturesRoutes.js       # Captures routes
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                 # Clerk JWT verification
│   │   └── upload.js               # Multer file upload
│   ├── uploads/                     # Uploaded files directory
│   ├── socket.js                    # Socket.io setup
│   ├── index.js                     # Main server file
│   ├── package.json                 # Dependencies
│   ├── API_DOCUMENTATION.md        # Complete API docs
│   ├── README.md                    # Backend documentation
│   └── env.example                  # Environment template
│
├── frontend/                         # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Next.js app router
│   │   │   ├── (auth)/             # Authentication pages
│   │   │   │   ├── sign-in/        # Sign in page
│   │   │   │   └── sign-up/        # Sign up page
│   │   │   ├── (vault)/            # Protected routes
│   │   │   │   ├── console/        # Dashboard/console
│   │   │   │   └── trip/           # Trip pages
│   │   │   │       └── [tripid]/
│   │   │   │           ├── expenses/ # Expenses page
│   │   │   │           │   ├── components/ # Expense components
│   │   │   │           │   ├── page.js
│   │   │   │           │   └── ...
│   │   │   │           ├── details/  # Idea board page
│   │   │   │           └── captures/ # Captures page
│   │   │   ├── layout.js            # Root layout
│   │   │   └── page.js              # Home page
│   │   ├── components/              # Reusable components
│   │   │   └── ui/                 # UI components
│   │   ├── context/                 # React contexts
│   │   │   └── SocketContext.js    # Socket.io context
│   │   ├── lib/                     # Utilities
│   │   │   ├── apiClient.js        # API client setup
│   │   │   └── utils.js            # Helper functions
│   │   ├── utils/                   # Constants
│   │   │   └── constants.js        # App constants
│   │   └── middleware.js            # Next.js middleware
│   ├── public/                      # Static assets
│   ├── package.json                 # Dependencies
│   └── README.md                    # Frontend documentation
│
└── README.md                         # This file
```

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Local or MongoDB Atlas
- **npm** or **yarn**
- **Clerk Account** - For authentication

### Step 1: Clone the Repository

```bash
git clone https://github.com/tatwik-sai/TripVaultMernify.git
cd TripVaultMernify
```

### Step 2: Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
DATABASE_URL=your_mongodb_url
PORT=8747
ORIGIN=your_frontend_arigin
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_signing_secret
```

Create the uploads directory:

```bash
mkdir uploads
```

Start MongoDB (if using local instance):

```bash
# macOS/Linux
mongod

# Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 mongo
```

Start the backend server:

```bash
node index.js
```


### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
# Clerk Authentication (Replace with your own keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Auth Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/console
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/console

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:8747

# Project Links
NEXT_PUBLIC_GITHUB_URL=https://github.com/your-username/your-repository
NEXT_PUBLIC_REPOSITORY_URL=https://github.com/your-username/your-repository

# Contact Info (Optional)
NEXT_PUBLIC_MAIL_URL=mailto:contact@example.com
NEXT_PUBLIC_PHONE_URL=tel:+1234567890

# Demo URL (Optional)
NEXT_PUBLIC_DEMO_URL=https://www.youtube.com/watch?v=your-demo-link

```

Update `frontend/src/utils/constants.js` to set the API host:

```javascript
export const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

#### Ngrok Setup
   - Create an account and download [Ngrok](https://ngrok.com/)
   - Open cmd and run the following commands (Get the credentials from website)
  
      ```bash
      ngrok config add-authtoken <YOUR_AUTH_TOKEN>
      ```
    - Choose the Static Domain and run the command

      ```bash
      ngrok http --url=<YOUR_STATIC_URL> 8747
      ```
    
#### Clerk Setup
   - Create an account on [Clerk](https://clerk.com/)
    - Create a new application with email and google enabled
    - Copy and store the PUBLIC and SECRET key
    - Go to **Configure** > **Webhooks** 
    - Add a new endpoint with ngrok static url subscribe to user events and create.
    - Copy the **Signing Secret** provided.

### MongoDB Connection

For **local MongoDB**:
```env
DATABASE_URL=mongodb://localhost:27017/tripvault
```

For **MongoDB Atlas**:
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/tripvault
```

## Usage

### Creating Your First Trip

1. Sign up or sign in to your account
2. Navigate to the Console page
3. Click "Create Trip"
4. Fill in trip details (name, budget, dates, etc.)
5. Add members to the trip
6. Start adding expenses!

### Managing Expenses

1. Navigate to a trip's Expenses page
2. Click "Add Expense"
3. Fill in expense details:
   - Amount
   - Description
   - Category
   - Date
   - Paid by (member)
   - Split among (members)
   - Optional receipt upload
4. Save the expense
5. View expenses in the list
6. Edit or delete expenses (admin/creator only)

### Settling Expenses

1. Navigate to the "Settlements" tab
2. View automatic settlement calculations
3. See who owes whom
4. Click "View QR" to see payment QR codes
5. Mark settlements as paid when completed

### Using the Idea Board

1. Navigate to a trip's Details page
2. Click "Add Idea"
3. Fill in idea details
4. Search and filter ideas
5. Delete ideas as needed

### Sharing Captures & Moments

1. Navigate to a trip's Captures page
2. Click "Add Capture" to upload photos
3. Select one or multiple images
4. Add a caption and description
5. Optionally add location and date tags
6. Save the capture to share with trip members
7. View all captures in a beautiful gallery layout
8. Like and comment on captures from other members
9. Filter captures by date or location
10. Real-time updates when new captures are added by any member

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All API endpoints (except `/clerk`) require authentication:

```http
Authorization: Bearer <clerk-jwt-token>
```

### Main Endpoints

#### Trips
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:tripId` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:tripId` - Update trip
- `POST /api/trips/:tripId/members` - Add member

#### Expenses
- `GET /api/trips/:tripId/expenses` - Get all expenses
- `POST /api/trips/:tripId/expenses` - Create expense (with file upload)
- `PUT /api/trips/:tripId/expenses/:expenseId` - Update expense
- `DELETE /api/trips/:tripId/expenses/:expenseId` - Delete expense
- `GET /api/trips/:tripId/expenses/export/csv` - Export as CSV
- `GET /api/trips/:tripId/expenses/export/pdf` - Export as PDF

#### Settlements
- `GET /api/trips/:tripId/settlements` - Calculate settlements
- `POST /api/trips/:tripId/settlements/mark-paid` - Mark as paid
- `GET /api/trips/:tripId/settlements/history` - Get history

#### Transaction Logs
- `GET /api/trips/:tripId/transaction-log` - Get logs
- `GET /api/trips/:tripId/transaction-log/stats` - Get statistics

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/payment-qr` - Upload QR code

#### Ideas
- `GET /api/details/ideas` - Get all ideas
- `POST /api/details/ideas` - Create idea
- `DELETE /api/details/ideas/:ideaId` - Delete idea

#### Captures
- `GET /api/trips/:tripId/captures` - Get all captures for a trip
- `POST /api/trips/:tripId/captures` - Create new capture with images
- `GET /api/trips/:tripId/captures/:captureId` - Get capture by ID
- `PUT /api/trips/:tripId/captures/:captureId` - Update capture
- `DELETE /api/trips/:tripId/captures/:captureId` - Delete capture
- `POST /api/trips/:tripId/captures/:captureId/like` - Like a capture
- `POST /api/trips/:tripId/captures/:captureId/comment` - Add comment to capture

## Authentication

TripVault uses **Clerk** for authentication. The system supports:

- **Email/Password** authentication
- **Social OAuth** (Google)
- **JWT Token** validation
- **Webhook Integration** for user sync

### Authentication Flow

1. User signs up/signs in via Clerk
2. Clerk generates JWT token
3. Frontend sends token in Authorization header
4. Backend verifies token using Clerk SDK
5. User ID extracted from token for authorization

### Protected Routes

All routes except `/` and `/sign-in`, `/sign-up` are protected by Clerk middleware.

## Real-time Features

TripVault uses **Socket.io** for real-time updates:

### Socket Events

#### Server Events
- `expense-added` - New expense created
- `expense-updated` - Expense modified
- `expense-deleted` - Expense removed
- `payment-made` - Settlement marked as paid
- `capture-added` - New capture/photos shared
- `capture-updated` - Capture modified
- `capture-deleted` - Capture removed
- `capture-liked` - Capture received a like
- `capture-commented` - New comment on capture

### Real-time Updates

All users in a trip receive instant updates when:
- Expenses are added, updated, or deleted
- Settlements are marked as paid
- Members are added or removed
- New captures are shared
- Captures receive likes or comments

## Settlement Algorithm

The backend uses an optimized greedy algorithm to calculate settlements:

1. **Calculate Balances**: For each member, calculate net balance (paid - owed)
2. **Separate**: Split into creditors (positive) and debtors (negative)
3. **Sort**: Order both by amount (descending)
4. **Match**: Pair largest debtor with largest creditor
5. **Settle**: Transfer minimum of the two amounts
6. **Repeat**: Continue until all balanced

This minimizes the number of transactions needed for settlement.

## File Upload

### Configuration
- **Max Size**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, GIF, WEBP
- **Storage**: Local filesystem in `/uploads` directory

### Endpoints with Upload
- `POST /api/trips/:tripId/expenses` - Field: `receipt`
- `PUT /api/trips/:tripId/expenses/:expenseId` - Field: `receipt`
- `POST /api/user/payment-qr` - Field: `qrCode`

### Access Files
```
http://localhost:3001/uploads/{filename}
```

## Security Features

- ✅ Clerk JWT authentication
- ✅ User authorization checks
- ✅ Admin-only operations
- ✅ File type validation
- ✅ File size limits
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ Secure file storage

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Development Notes

### Adding New Features

1. Create model in `/Backend/models`
2. Create controller in `/Backend/controllers`
3. Create routes in `/Backend/routes`
4. Import routes in `Backend/index.js`
5. Create frontend components in `/frontend/src/app`
6. Update API documentation

### Database Indexes

The models include optimized indexes for:
- Trip queries by member
- Expense queries by trip and date
- Settlement queries by trip and status
- Transaction log queries by trip and timestamp

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Ready to Use!

TripVault is fully implemented and production ready. All features are functional with proper authentication, real-time updates, and data persistence.

## License

This project is licensed under the MIT License.

