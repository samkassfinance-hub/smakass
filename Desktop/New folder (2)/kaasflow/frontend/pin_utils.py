import bcrypt

def hash_pin(pin):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pin.encode('utf-8'), salt).decode('utf-8')

def verify_pin(pin, hashed_pin):
    try:
        return bcrypt.checkpw(pin.encode('utf-8'), hashed_pin.encode('utf-8'))
    except Exception:
        return False