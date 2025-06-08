# Blood Safe - Blood Donation Platform

Blood Safe is a modern web application that connects blood donors with those in need. The platform features a user-friendly interface with map integration to locate nearby blood donation centers and donors.

## Features

- 🔐 Secure user authentication and authorization
- 🗺️ Interactive map to locate blood donation centers
- 👤 User dashboard for managing donations
- 📱 Responsive design for all devices
- 🔍 Search and filter functionality
- 📊 Real-time updates and notifications

## Tech Stack

### Frontend
- Next.js 15.3.3
- React 19
- TailwindCSS
- Leaflet for maps
- NextAuth for authentication
- Prisma ORM

### Backend
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- Morgan for logging

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blood_safe
```

### 2. Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blood_safe
JWT_SECRET=your-jwt-secret
```

4. Start the backend server:
```bash
npm run dev
```

The backend API will be available at [http://localhost:5000](http://localhost:5000)

## Development

### Frontend Development
- The main application code is in the `src/app` directory
- Components are located in `src/components`
- API services are in `src/services`

### Backend Development
- Main server code is in `backend/src`
- API routes are organized in separate files
- Database models are in the models directory

## Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

## Deployment

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Backend Deployment
1. Build the application:
```bash
cd backend
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [support@bloodsafe.com](mailto:support@bloodsafe.com) or open an issue in the repository.
