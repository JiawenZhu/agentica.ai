from flask import Flask, request, jsonify, session
import hashlib
import sqlite3
import os
import time
import bcrypt

app = Flask(__name__)
app.secret_key = "super_secret_key"  # Bug 1: Hardcoded secret key

# Fixed: SQL Injection vulnerability - using parameterized queries
def get_user_by_username(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # Use parameterized query to prevent SQL injection
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    conn.close()
    return result

def hash_password(password):
    # Fixed: Use bcrypt for secure password hashing with salt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    hashed_password = hash_password(password)
    
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                      (username, hashed_password, email))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = get_user_by_username(username)
    if user and bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
        session['user_id'] = user[0]
        session['username'] = user[1]
        return jsonify({'message': 'Login successful'}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/profile/<username>')
def get_profile(username):
    user = get_user_by_username(username)
    if user:
        return jsonify({
            'id': user[0],
            'username': user[1],
            'email': user[3]
        })
    return jsonify({'error': 'User not found'}), 404

@app.route('/search')
def search_users():
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
    
    # Fixed: Efficient database search using SQL LIKE queries
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Use parameterized query with LIKE for efficient searching
    search_term = f"%{query}%"
    cursor.execute("""
        SELECT id, username, email 
        FROM users 
        WHERE username LIKE ? OR email LIKE ?
    """, (search_term, search_term))
    
    users = cursor.fetchall()
    conn.close()
    
    # Format results
    results = []
    for user in users:
        results.append({
            'id': user[0],
            'username': user[1],
            'email': user[2]
        })
    
    return jsonify(results)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0')  # Bug 5: Debug mode in production