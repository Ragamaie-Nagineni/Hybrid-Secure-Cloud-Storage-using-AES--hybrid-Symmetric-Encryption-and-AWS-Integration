from flask import Flask, request, jsonify
from flask_cors import CORS
from aws_client import user_table
from encryptor import encrypt_text, decrypt_text

app = Flask(__name__)
CORS(app)  # Allow frontend JS to talk to Flask backend

@app.route('/')
def home():
    return "Drakz Secure Cloud Backend Running ✅"

# ---------------- SIGNUP -----------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Encrypt password
    encrypted_pw = encrypt_text(password)

    # Store user in DynamoDB
    user_table.put_item(Item={
        'username': username,
        'password': encrypted_pw
    })

    return jsonify({'message': 'User registered successfully!'})

# ---------------- LOGIN -----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Fetch user
    response = user_table.get_item(Key={'username': username})

    if 'Item' not in response:
        return jsonify({'error': 'User not found'}), 404

    stored_pw = response['Item']['password']
    decrypted_pw = decrypt_text(stored_pw)

    if password == decrypted_pw:
        return jsonify({'message': 'Login successful!'})
    else:
        return jsonify({'error': 'Invalid password'}), 401

if __name__ == '__main__':
    app.run(debug=True)
