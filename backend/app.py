
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import bcrypt  # Import the new hashing library
from aws_client import user_table
import json

# --- REMOVE your old encryptor import ---
# from encryptor import encrypt_text, decrypt_text # <-- THIS IS NO LONGER USED

app = Flask(__name__, template_folder="../templates", static_folder="../static")
# Allow credentials (sessions) to be sent from the frontend
CORS(app, supports_credentials=True) 
app.secret_key = "super-secret-session-key" # In production, use AWS Secrets Manager

# ---------------- TEMPLATE ROUTES -----------------
@app.route('/')
def home():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('nlogin.html')

@app.route('/signup-page')
def signup_page():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('nsignup.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('home'))
    return render_template('ndashboard.html')

# ---------------- API: SIGNUP (FIXED & SECURE) -----------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    # 1. Convert password to bytes
    password_bytes = password.encode('utf-8')
    # 2. Generate a salt and hash the password (one-way)
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    try:
        # 3. Store the HASH (as a string) in DynamoDB
        user_table.put_item(
            Item={
                'username': username,
                'password': hashed_password.decode('utf-8') 
            }
        )
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        print(f"🔥 DynamoDB Error: {e}")
        return jsonify({'error': 'Error creating user (user may already exist)'}), 400

# ---------------- API: LOGIN (FIXED & SECURE) -----------------
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

        # 1. Get the stored hash from DynamoDB
        stored_hash = result['Item']['password'].encode('utf-8')
        password_bytes = password.encode('utf-8')

        # 2. Check the provided password against the stored hash
        if bcrypt.checkpw(password_bytes, stored_hash):
            session['user'] = username  # ✅ Persist session
            return jsonify({'message': 'Login successful ✅'})
        else:
            return jsonify({'error': 'Invalid password'}), 401
    except Exception as e:
        print(f"🔥 DynamoDB Error: {e}")
        return jsonify({'error': 'Server error during login'}), 500

# ---------------- API: LOGOUT -----------------
@app.route('/api/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

# ---------------- API: CHECK LOGIN STATUS -----------------
@app.route('/api/me')
def get_user():
    user = session.get('user')
    if user:
        return jsonify({'loggedIn': True, 'username': user})
    return jsonify({'loggedIn': False})

# ---------------- API: SAVE DATA (NEW "DUMB" ROUTE) -----------------
# This route is "dumb". It just saves whatever encrypted blob it receives.
@app.route('/api/save_data', methods=['POST'])
def save_data():
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # The data from the client IS ALREADY ENCRYPTED
    encrypted_data_blob = request.get_json().get('data')
    if not encrypted_data_blob:
        return jsonify({'error': 'No data provided'}), 400
        
    username = session['user']
    try:
        # Just save the encrypted blob. The server has zero knowledge.
        user_table.update_item(
            Key={'username': username},
            UpdateExpression="SET financial_data = :d",
            ExpressionAttributeValues={ ':d': encrypted_data_blob }
        )
        return jsonify({'message': 'Data saved successfully!'})
    except Exception as e:
        print(f"🔥 Error saving data for user {username}: {e}")
        return jsonify({'error': 'Could not save data'}), 500

# ---------------- API: LOAD DATA (NEW "DUMB" ROUTE) -----------------
# This route is "dumb". It just sends the encrypted blob back to the client.
@app.route('/api/load_data', methods=['GET'])
def load_data():
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['user']
    try:
        result = user_table.get_item(Key={'username': username})
        item = result.get('Item')

        if not item or 'financial_data' not in item:
            print(f"User '{username}': No financial data found.")
            return jsonify({}) # Return empty, no data

        # Send the encrypted blob back to the client for decryption
        encrypted_data_blob = item.get('financial_data')
        return jsonify({'data': encrypted_data_blob})
    except Exception as e:
        print(f"Error loading data for user {username}: {e}")
        return jsonify({'error': 'Could not load data'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

