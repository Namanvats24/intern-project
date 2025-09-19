# Authentication App

A modern full-stack web application featuring an interactive starfield animation with user authentication functionality.

## Features

- **Interactive Starfield Animation**: Canvas-based particle system with mouse interaction
- **User Authentication**: Secure registration and login system
- **Modern UI**: Dark theme with glass-morphism design
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Backend**: Flask API with bcrypt password hashing

## Tech Stack

**Frontend:**
- React 19.1.1
- HTML5 Canvas
- CSS3 Animations

**Backend:**
- Flask 3.0+
- SQLAlchemy ORM
- Flask-Bcrypt
- Flask-CORS

**Database:**
- SQLite (development)
- PostgreSQL ready (production)

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/starfield-auth-app.git
cd starfield-auth-app
```

2. **Backend setup**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

3. **Frontend setup**
```bash
# Navigate to React app
cd my-auth-app

# Install dependencies
npm install

# Start development server
npm start
```

4. **Access the application**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Project Structure

```
starfield-auth-app/
├── app.py              # Flask backend
├── models.py           # Database models
├── requirements.txt    # Python dependencies
├── my-auth-app/        # React frontend
│   ├── src/
│   │   ├── App.js      # Main component with starfield
│   │   └── App.css     # Styling
│   └── package.json    # Node dependencies
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new user account |
| POST | `/api/login` | Authenticate user |
| GET | `/api/@me` | Get current user info |
| POST | `/api/logout` | End user session |

## Deployment

### Backend (Render/Railway/Heroku)
```bash
# Set environment variables
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
ALLOWED_ORIGINS=your-frontend-url
```

### Frontend (Netlify/Vercel)
```bash
# Build for production
npm run build

# Deploy the build folder
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
