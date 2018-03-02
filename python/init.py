from flask import Flask
from flask_restful import Resource, Api
from flask_restful import reqparse
import getpass
import re
import bcrypt
import sqlite3
import os
import atexit
from Crypto.Cipher import AES

import sys
# sys.setdefaultencoding() does not exist, here!
reload(sys)  # Reload does the trick!
sys.setdefaultencoding('UTF8')

# In order to securely store the password for use while the application is running, 
# I will generate a random key during the logged in session. I will encrypt the password using 
# the randomly generated key and send the encrypted version of the password to a separate service via
# SSL or HTTPS. Whenever the password is needed, I will request the encrypted password, decrypt it with the
# randomly generated key, use it, and then erase it from memory in this service.

PADDING = '{'
app = Flask(__name__)
api = Api(app)
SEPARATOR = '({wCQzfVQaoaXCxFZWYBu$2b$12$DmTl5YDC64zpcdYzNGS2z})' #this is a unique string used to distinquish the separation of two strings. Not a secret.

class PassManLogin(Resource):
    def put(self):
        create_master_table()
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        args = parser.parse_args()
        return {'result': check_if_user_exists(args['username'])}
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('password')
        parser.add_argument('username')
        args = parser.parse_args()
        res = {'result': check_master_password(args['username'], args['password'])}
        if res['result'] == True:
            create_pw_table_for_user(args['username'])
            set_last_logged_in_username(args['username'])
        return res

class PassManMainMenu(Resource):
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        args = parser.parse_args()
        return get_account_list(args['username'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('account')
        parser.add_argument('username')
        args = parser.parse_args()
        return choose_account_for_view(args['username'], args['account'])

class PassManAddAccount(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        parser.add_argument('account')
        parser.add_argument('password')
        parser.add_argument('accountUsername')
        args = parser.parse_args()
        return add_new_account(args['username'], args['account'], args['password'], args['accountUsername'])

class PassManDeleteAccount(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        parser.add_argument('account')
        args = parser.parse_args()
        return delete_account(args['username'], args['account'])

class PassManSignOut(Resource):
    def post(self):
        global MASTER_PASSWORD
        MASTER_PASSWORD = ''
        c.close()
        conn.close()
        return True

class PassManNewUser(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        parser.add_argument('password')
        args = parser.parse_args()
        res = create_user_account(args['username'], args['password'])
        return {'response': res[0], 'msg': res[1]}

class PassManInit(Resource):
    def get(self):
        return {'username': get_last_logged_in_username()}

class PassManLastUserReset(Resource):
    def put(self):
        return set_last_logged_in_username('none')

api.add_resource(PassManInit, '/init')
api.add_resource(PassManLogin, '/login')
api.add_resource(PassManMainMenu, '/menu')
api.add_resource(PassManSignOut, '/logout')
api.add_resource(PassManNewUser, '/newUser')
api.add_resource(PassManAddAccount, '/addAccount')
api.add_resource(PassManLastUserReset, '/resetLastUser')
api.add_resource(PassManDeleteAccount, '/deleteAccount')

def reset_last_user_logged_in():
    try:
        with open('lastLoggedIn', 'r+') as f:
            f.truncate(0)
        with open('lastLoggedIn', 'w') as f:
            f.write('none')
        return True
    except:
        return False

def get_last_logged_in_username():
    with open('lastLoggedIn', 'r') as f:
        return f.readline().strip()

def set_last_logged_in_username(username):
    with open('lastLoggedIn', 'r+') as f:
        f.truncate(0)
    with open('lastLoggedIn', 'w') as f:
        f.write(username)

def init_last_logged_in():
    if os.path.exists('lastLoggedIn') == False:
        with open('lastloggedin', 'w') as f:
            f.write('none')

def create_master_table():
    c.execute("CREATE TABLE IF NOT EXISTS masterPW(username TEXT UNIQUE, password TEXT)")
    conn.commit()

def create_pw_table_for_user(username):
    c.execute("CREATE TABLE IF NOT EXISTS [" + username + "PW](account TEXT UNIQUE, accountUsername TEXT, password TEXT)")
    conn.commit()

def get_account_list(username):
    c.execute("SELECT * FROM [" + username + "PW]")
    accounts = []
    for row in c.fetchall():
        sub_arr = []
        sub_arr.append(row[0])
        sub_arr.append(row[1])
        accounts.append(sub_arr)
    return accounts

def delete_account(username, account):
    try:
        c.execute("DELETE FROM [" + username + "PW] WHERE account=?", (account,))
        conn.commit()
        return True
    except:
        return False
    
def choose_account_for_view(username, account):
    c.execute("SELECT password FROM [" + username + "PW] WHERE account=?", (account,))
    encryption_string = unicode(c.fetchall()[0][0]).encode('latin-1')
    password = remove_padding(decrypt_password(encryption_string), PADDING)
    return password

def remove_padding(string, padding_symbol):
    return string.replace(padding_symbol, '')

def encrypt_password(password):
    password = make_block_size(password)
    random_key = os.urandom(16)
    aes_salt = os.urandom(16)
    aes_encryption_object = AES.new(random_key, AES.MODE_CBC, aes_salt)
    encrypt_random_key_object = AES.new(make_block_size(MASTER_PASSWORD), AES.MODE_CBC, aes_salt)
    encrypt_random_key = encrypt_random_key_object.encrypt(random_key)
    return [aes_encryption_object.encrypt(password), encrypt_random_key, aes_salt]

def decrypt_password(encryption_string):
    encryption_information = encryption_string.split(SEPARATOR)
    password = encryption_information[0]
    random_key = encryption_information[1]
    aes_salt = encryption_information[2]
    decrypt_random_key_object = AES.new(make_block_size(MASTER_PASSWORD), AES.MODE_CBC, aes_salt)
    decrypt_random_key = decrypt_random_key_object.decrypt(random_key)
    aes_decryption_object = AES.new(decrypt_random_key, AES.MODE_CBC, aes_salt)
    return aes_decryption_object.decrypt(password)

def add_new_account(username, account, password, account_username):
    try:
        encryption_information = encrypt_password(password)
        encrypted_password = encryption_information[0]
        encryption_random_key = encryption_information[1]
        encryption_aes_salt = encryption_information[2]
        encryption_string = encrypted_password + SEPARATOR + encryption_random_key + SEPARATOR + encryption_aes_salt
        encryption_string = unicode(encryption_string, "latin-1")
        c.execute("INSERT INTO [" + username + "PW] VALUES(?, ?, ?)", (account, account_username, encryption_string))
        conn.commit()
        create_pw_table_for_user(username)
        return True
    except IOError:
        print IOError
        return False

def check_master_password(username, password):
    try:
        c.execute("SELECT password FROM masterPW WHERE username = ?", (username,))
        pw = c.fetchall()[0][0]
        if bcrypt.checkpw(password.encode("utf-8"), str(pw)):
            global MASTER_PASSWORD
            MASTER_PASSWORD = password
            return True
        else:
            return False
    except IOError:
        print IOError
        return False

def make_block_size(item):
    BLOCK_SIZE = 16
    PADDING = '{'
    pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * PADDING
    return pad(item)

def create_user_account(username, password):
    if check_password_complexity(password) == False:
        return [False, 'Password does not meet complexity requirements.']
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    store_password(username, password_hash)
    return [True, 'Successfully created new account.']

def check_password_complexity(password):
    """
    Verify the strength of 'password'
    Returns a dict indicating the wrong criteria
    A password is considered strong if:
    10 characters length or more
    1 digit or more
    1 symbol or more
    1 uppercase letter or more
    1 lowercase letter or more
    """
    length_error = len(password) < 10
    digit_error = re.search(r"\d", password) is None
    uppercase_error = re.search(r"[A-Z]", password) is None
    lowercase_error = re.search(r"[a-z]", password) is None
    symbol_error = re.search(r"[!@#$%&'()*+,-./[\\\]^_`{|}~"+r'"]', password) is None
    password_ok = not ( length_error or digit_error or uppercase_error or lowercase_error or symbol_error )
    return password_ok

def store_password(username, password):
    c.execute("INSERT INTO masterPW VALUES(?, ?)", (username, password))
    conn.commit()

def check_if_user_exists(username):
    un = ''
    try:
        c.execute("SELECT username FROM masterPW WHERE username = ?", (username,))
        un = c.fetchall()[0][0]
        if un != '' and un != None:
            if un == username:
                return True
            else:
                return False
        else:
            return False
    except:
        return False

def init():
    global MASTER_PASSWORD
    global conn
    global c
    conn = sqlite3.connect('pw.db')
    c = conn.cursor()
    create_master_table()
    MASTER_PASSWORD = ''
    init_last_logged_in()

if __name__ == "__main__":
    init()
    app.run(host='127.0.0.1', port=5000)