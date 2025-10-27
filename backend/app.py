from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from encryptor import encrypt_text, decrypt_text

app = Flask(__name__, template_folder="../templates", static_folder="../static")


CORS(app)

# Temporary in-memory "user database"
users = {}

# ---------------- HOME / LOGIN PAGE -----------------
@app.route('/')
def home():
    return render_template('nlogin.html')

# ---------------- SIGNUP PAGE -----------------
@app.route('/signup-page')
def signup_page():
    return render_template('nsignup.html')

# ---------------- DASHBOARD PAGE -----------------
@app.route('/dashboard')
def dashboard():
    return render_template('ndashboard.html')

# ---------------- API: SIGNUP -----------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if username in users:
        return jsonify({'error': 'User already exists'}), 409

    encrypted_pw = encrypt_text(password)
    users[username] = encrypted_pw

    return jsonify({'message': 'User registered successfully (simulated cloud) ✅'})

# ---------------- API: LOGIN -----------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if username not in users:
        return jsonify({'error': 'User not found'}), 404

    stored_pw = users[username]
    decrypted_pw = decrypt_text(stored_pw)

    if password == decrypted_pw:
        return jsonify({'message': 'Login successful ✅'})
    else:
        return jsonify({'error': 'Invalid password'}), 401


@app.route('/api/status')
def status():
    return jsonify({'status': 'Backend Running', 'ok': True})


if __name__ == '__main__':
    app.run(debug=True)
