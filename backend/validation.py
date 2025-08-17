import re

def is_valid_username(username: str) -> bool:
    if len(username) < 3 or len(username) > 20:
        return False
    if re.search(r'[\s\u180E\u200B-\u200D\u2060\uFEFF]', username):
        return False
    return True


def is_valid_password(password: str) -> bool:
    if len(password) < 5 or len(password) > 50:
        return False
    if re.search(r'[\s\u180E\u200B-\u200D\u2060\uFEFF]', password):
        return False
    return True