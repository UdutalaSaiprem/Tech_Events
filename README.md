# Tech Fest Registration with MongoDB

A complete registration system with UPI payment integration and MongoDB database support.

## Features

✅ Multi-step registration form
✅ Event selection with dynamic pricing
✅ UPI payment with dynamic QR code generation
✅ Payment screenshot upload & verification
✅ MongoDB integration for storing registration & payment history
✅ REST API for retrieving registration data
✅ Responsive design with animations

## Prerequisites

- Node.js (v14+)
- MongoDB (running on localhost:27017)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# On Windows
mongod

# On Mac/Linux
brew services start mongodb-community
# or
mongod
```

### 3. Configure Environment (Optional)

Edit `.env` file if you need to change:
- PORT (default: 5000)
- MONGODB_URI (default: mongodb://localhost:27017/techfest_registration)

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will be available at: **http://localhost:5000**

## API Endpoints

### 1. Create Registration (POST)
**Endpoint:** `/api/register`

Saves a new registration with payment details to MongoDB.

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "college_name": "JNTUH",
  "college_id": "12345",
  "course_branch": "CSE",
  "year_of_study": "2nd Year",
  "gender": "Male",
  "technical_event": "Web Design Challenge, Tech Quiz",
  "total_fee": "25",
  "payment_mode": "UPI",
  "screenshot": "<base64_image_data>",
  "submitted_at": "2026-02-28T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration saved successfully!",
  "registration_id": "507f1f77bcf86cd799439011",
  "data": { ... }
}
```

### 2. Get All Registrations (GET)
**Endpoint:** `/api/registrations`

Retrieves all registrations (newest first).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

### 3. Get Registration by ID (GET)
**Endpoint:** `/api/registrations/:id`

Retrieves a specific registration by MongoDB ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 4. Get Registrations by Email (GET)
**Endpoint:** `/api/registrations/email/:email`

Retrieves all registrations for a specific email.

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [ ... ]
}
```

### 5. Get Payment History (GET)
**Endpoint:** `/api/registrations/:id/payment-history`

Retrieves payment history for a specific registration.

**Response:**
```json
{
  "success": true,
  "data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "payment_history": {
      "payment_mode": "UPI",
      "screenshot": "<base64_image>",
      "uploaded_at": "2026-02-28T10:30:00.000Z",
      "verified": true,
      "amount": 25
    }
  }
}
```

### 6. Health Check (GET)
**Endpoint:** `/api/health`

Checks if server and MongoDB are connected.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "mongodb": "Connected"
}
```

## Database Schema

### Registration Collection

```javascript
{
  _id: ObjectId,
  full_name: String,
  email: String,
  phone: String,
  college_name: String,
  college_id: String,
  course_branch: String,
  year_of_study: String,
  gender: String,
  technical_event: String,
  total_fee: Number,
  payment: {
    payment_mode: String,
    screenshot: String (Base64),
    uploaded_at: Date,
    verified: Boolean,
    amount: Number
  },
  transaction_id: String,
  upi_id: String,
  bank_account: String,
  created_at: Date,
  submitted_at: Date,
  status: String (pending/completed/failed)
}
```

## How It Works

### Registration Flow

1. **Step 1 - Participant Details**
   - User fills in personal information
   - Selects branch, year, etc.

2. **Step 2 - Events & Payment**
   - User selects events (each with price)
   - Total fee is calculated
   - User selects UPI payment
   - Dynamic QR code is generated with the amount
   - User scans QR and makes payment
   - User uploads payment screenshot (Required)
   - Screenshot is validated (file type, size)
   - Complete button becomes enabled

3. **Step 3 - Review & Submit**
   - User reviews all details
   - Clicks "Complete Registration 🎉"
   - Data is sent to MongoDB via `/api/register`
   - Success page with confirmation is displayed

### Data Storage

- **Registration details** are stored in MongoDB
- **Payment screenshot** is converted to Base64 and stored in the database
- **Payment history** is embedded in the registration document
- All timestamps are recorded (created_at, submitted_at, payment uploaded_at)

## Testing

### Using cURL

```bash
# Get all registrations
curl http://localhost:5000/api/registrations

# Health check
curl http://localhost:5000/api/health

# Get registration by email
curl http://localhost:5000/api/registrations/email/john@example.com
```

### Using MongoDB Compass

1. Connect to `mongodb://localhost:27017`
2. Database: `techfest_registration`
3. Collection: `registrations`
4. View all documents and payment history

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### File Upload Issues
- Max file size is 5MB
- Only image files (PNG, JPG, etc.) are accepted
- Base64 encoding happens automatically

## Features Implemented

✅ MongoDB integration with Mongoose ODM
✅ Payment screenshot storage (Base64)
✅ Payment history tracking
✅ Email-based registration lookup
✅ Registration by ID lookup
✅ Auto-generated timestamps
✅ Error handling & validation
✅ CORS enabled
✅ Environment configuration
✅ Health check endpoint
✅ RESTful API design

## Future Enhancements

- Email notifications on registration
- Admin dashboard for viewing registrations
- Payment verification automation
- QR code scanner for attendance
- Certificate generation
- Advanced reporting & analytics

## License

MIT
