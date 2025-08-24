from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_cors import CORS
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from datetime import datetime
from functools import wraps


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://learn-cloud.vercel.app"}})

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'heheheheheh'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config["JWT_SECRET_KEY"] = "your-secret-key"
jwt = JWTManager(app)


db = SQLAlchemy(app)

class Level(Enum):
    YearOne = "100 Level"
    YearTwo = "200 Level"
    YearThree = "300 Level"
    YearFour = "400 Level"
    YearFive = "500 Level"

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    fName = db.Column(db.String(50), nullable=False)
    lName = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(30), nullable=False, unique=True)
    phone = db.Column(db.String(15), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    dateAdded = db.Column(db.DateTime, default=datetime.utcnow)

    created_courses = db.relationship('Course', backref='creator', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_creator = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    code = db.Column(db.String(8), nullable=False)
    units = db.Column(db.Integer, nullable=False)
    level = db.Column(db.Enum(Level), nullable=False)
    dateAdded = db.Column(db.DateTime, default=datetime.utcnow)

# SECRET_KEY = 'your-secret-key'
# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         token = None

#         # Get token from Authorization header
#         if 'Authorization' in request.headers:
#             token = request.headers['Authorization'].split()[1]

#         if not token:
#             return jsonify({'message': 'Token is missing!'}), 401

#         try:
#             data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
#             current_user_id = data['user_id']
#         except jwt.ExpiredSignatureError:
#             return jsonify({'message': 'Token expired'}), 401
#         except jwt.InvalidTokenError:
#             return jsonify({'message': 'Invalid token'}), 401

#         return f(current_user_id, *args, **kwargs)
#     return decorated



@app.route('/api/register', methods=['POST'])
def register():
    fName = request.form.get('fName')
    lName = request.form.get('lName')
    email = request.form.get('email')
    phone = request.form.get('phone')
    country = request.form.get('country')
    password = request.form.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'Email already exists'}), 409
    
    hashed_password = generate_password_hash(password)
    user = User(
        fName=fName,
        lName=lName,
        email=email,
        phone=phone,
        country=country,
        password_hash=hashed_password
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    email = request.form.get('username')
    password = request.form.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'success': True, 'access_token': access_token}), 200
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    course = Course.query.filter_by(course_creator=user.id).all()
    print(course)

    return jsonify({
        "success": True,
        "message": f"Welcome to your dashboard, {user.fName} {user.lName}!",
        "data": {
            "email": user.email,
            "joined": str(user.dateAdded),
            "user": {
                "id": user.id,
                "fName": user.fName,
                "lName": user.lName,
                "email": user.email,
                "phone": user.phone,
                "country": user.country,
            }
        },
        "courses": [
            {
                "id": c.id,
                "name": c.name,
                "code": c.code,
                "units": c.units,
                "level": c.level.value,
                "dateAdded": str(c.dateAdded)
            } for c in course
        ]
    }), 200

@app.route('/api/courses', methods=['POST'])
@jwt_required()
def add_course():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    print(user, user_id)
    name = request.form.get('name')
    code = request.form.get('code')
    units = request.form.get('units')
    level = request.form.get('level')

    if not name or not code or not units or not level:
        print('hfhfhf')
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    try:
        level_enum = Level[level]
    except KeyError:
        print('edbjwbd')
        return jsonify({'success': False, 'error': 'Invalid level'}), 400

    course = Course(course_creator=user.id, name=name, code=code, units=int(units), level=level_enum)

    try:  
        db.session.add(course)
        db.session.commit()
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Database error'}), 500
    return jsonify({'success': True, 'message': 'Course added successfully'}), 201

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)


    
