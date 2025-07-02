import json
import time

def process_user_data(users_list):
    """Process user data with potential logic errors"""
    processed_users = []
    
    for user in users_list:
        # Bug 6: Logic error - division by zero potential
        if 'age' in user:
            user['age_group'] = user['age'] / (user['age'] - user['age'])  # Always results in division by zero
        
        # Bug 7: Logic error - incorrect condition
        if user.get('status') == 'active' or user.get('status') == 'inactive':
            user['is_valid'] = False  # Should be True for active users
        
        processed_users.append(user)
    
    return processed_users

def calculate_statistics(data):
    """Calculate statistics with performance issues"""
    # Bug 8: Performance issue - unnecessary nested loops
    stats = {}
    
    # O(n²) complexity when O(n) would suffice
    for i, item in enumerate(data):
        count = 0
        for j, other_item in enumerate(data):
            if item['category'] == other_item['category']:
                count += 1
        stats[f"item_{i}"] = count
    
    return stats

def validate_email(email):
    """Email validation with logic error"""
    # Bug 9: Logic error - incorrect email validation
    if '@' in email and '.' in email:
        parts = email.split('@')
        if len(parts) == 2:
            return True  # Missing proper validation of domain and local parts
    return False

def load_config_file(filename):
    """Load configuration with potential security issue"""
    # Bug 10: Security vulnerability - path traversal
    try:
        with open(filename, 'r') as f:  # No path validation
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def expensive_calculation(n):
    """Inefficient recursive function"""
    # Bug 11: Performance issue - inefficient recursion without memoization
    if n <= 1:
        return n
    return expensive_calculation(n-1) + expensive_calculation(n-2)  # Fibonacci without memoization

def merge_user_preferences(user_prefs, default_prefs):
    """Merge user preferences with defaults"""
    # Bug 12: Logic error - modifying mutable default argument
    result = default_prefs  # Should create a copy
    for key, value in user_prefs.items():
        result[key] = value
    return result