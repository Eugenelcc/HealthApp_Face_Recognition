import shelve
class User:
     def __init__(self, username, password,last,email):
 
        self.username = username
        self.password = password
        self.last = last
        self.email = email

     def __repr__(self):
        return f'{self.username}'



users = [] 

users = [] 
users.append(User(username='DUMMY', password='DUMMY',last='DUMMY', email='DUMMY@email.com'))


def savedb():
    #SAVE TO DB
    db =shelve.open("storageuser","c")
    for x in users:
        password  = x.password
        username = x.username
        last = x.last
        email = x.email
        db[username]={"username":username,"password":password,"last":last,"email":email}
    
    db.close
    print("DATABASE STORED")
 
 
def readDb():
    db =shelve.open("storageuser","c")
    dict={}
    for id in list(db.keys()):
        dict=db[id]
        dbpassz = dict.get("password")
        dbuser = dict.get("username")
        dblast = dict.get("last")
        dbemail = dict.get("email")
        
        print("Username:",dbuser,"Password:",dbpassz,"last:",dblast,"email",dbemail)

        users.append(User(username=dbuser, password=dbpassz,last=dblast,email=dbemail))

    db.close
    print(users)
    print("DATABASE LOAD")


savedb()