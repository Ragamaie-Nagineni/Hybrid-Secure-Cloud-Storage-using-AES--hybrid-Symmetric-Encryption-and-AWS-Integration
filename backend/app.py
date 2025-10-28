from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from encryptor import encrypt_text, decrypt_text
from aws_client import user_table

app = Flask(__name__, template_folder="../templates", static_folder="../static")
CORS(app)

# Secret key for sessions (in production store in AWS Secrets Manager)
app.secret_key = "super-secret-session-key"

# ---------------- HOME / LOGIN PAGE -----------------
@app.route('/')
def home():
    # Auto-redirect if user already logged in
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('nlogin.html')

# ---------------- SIGNUP PAGE -----------------
@app.route('/signup-page')
def signup_page():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('nsignup.html')

# ---------------- DASHBOARD PAGE -----------------
@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('home'))
    return render_template('ndashboard.html')

# ---------------- API: SIGNUP -----------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    # ✅ Check if user already exists in DynamoDB
    try:
        existing = user_table.get_item(Key={'username': username})
        if 'Item' in existing:
            return jsonify({'error': 'User already exists'}), 409
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    # ✅ Encrypt password and save to DynamoDB
    try:
        encrypted_pw = encrypt_text(password)
        user_table.put_item(Item={'username': username, 'password': encrypted_pw})
        return jsonify({'message': 'User registered successfully ✅'})
    except Exception as e:
        return jsonify({'error': f'Error saving user: {str(e)}'}), 500

# ---------------- API: LOGIN -----------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    try:
        result = user_table.get_item(Key={'username': username})
        if 'Item' not in result:
            return jsonify({'error': 'User not found'}), 404

        stored_pw = result['Item']['password']
        decrypted_pw = decrypt_text(stored_pw)

        if password == decrypted_pw:
            session['user'] = username  # ✅ Persist session
            return jsonify({'message': 'Login successful ✅'})
        else:
            return jsonify({'error': 'Invalid password'}), 401

    except Exception as e:
        print("🔥 DynamoDB Error:", e)
        raise  # This will print the full error in the VS Code terminal


# ---------------- API: CHECK LOGIN STATUS -----------------
@app.route('/api/me')
def get_user():
    user = session.get('user')
    if user:
        return jsonify({'loggedIn': True, 'username': user})
    return jsonify({'loggedIn': False})

# ---------------- API: LOGOUT -----------------
@app.route('/api/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

# ---------------- HEALTH CHECK -----------------
@app.route('/api/status')
def status():
    return jsonify({'status': 'Backend Running', 'ok': True})


if __name__ == '__main__':
    app.run(debug=True)
