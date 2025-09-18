from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User

# App ko configure karna
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_key_12345')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///flaskdb.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = os.environ.get('FLASK_ENV') == 'development'

bcrypt = Bcrypt(app)
# CORS (Cross-Origin Resource Sharing) ko setup karna taki React app communicate kar sake
# Production mein specific origins specify karein
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, supports_credentials=True, origins=allowed_origins)
db.init_app(app)

# Database tables create karna
with app.app_context():
    db.create_all()

# Default route
@app.route("/")
def index():
    return "Flask Backend Chal Raha Hai!"

# User registration (signup) route
@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email aur password zaroori hai"}), 400

    user_exists = User.query.filter_by(email=email).first()
    if user_exists:
        return jsonify({"error": "Yeh email pehle se registered hai"}), 409

    # Password ko hash karna
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    # Session mein user ID store karna
    session["user_id"] = new_user.id

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    }), 201

# User login route
@app.route("/api/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    # Session mein user ID store karna
    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "email": user.email
    })

# Current user ki details get karne ka route
@app.route("/api/@me")
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(id=user_id).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email
    })

# User logout route
@app.route("/api/logout", methods=["POST"])
def logout_user():
    # Session se user ID hatana
    session.pop("user_id", None)
    return jsonify({"message": "Logout safal hua"}), 200

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
