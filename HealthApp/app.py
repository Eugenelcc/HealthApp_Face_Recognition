import re
from flask import Flask,render_template,request,jsonify,redirect,session,url_for,make_response,g
import shelve

from werkzeug.wrappers import response


app = Flask(__name__)
app.secret_key="SECRETKEY"
users = [] 

class User:
     def __init__(self, username, password,last,email):
 
        self.username = username
        self.password = password
        self.last = last
        self.email = email

     def __repr__(self):
        return f'{self.username}'

 

######FUNCTIONS#############
def readDb():
    db =shelve.open("storageuser","r")
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
    print("USERS LIST : ",users)
    print("DATABASE LOAD")



def savedb(username,password,last,email):
    #SAVE TO DB
    db =shelve.open("storageuser","c")
    password  = password
    username = username
    last = last
    email =email
    db[username]={"username":username,"password":password,"last":last,"email":email}
    
    db.close
    print("DATABASE STORED: Username:{} lastname : {} Password : {}  Email : {} ".format(username,last,password,email))
###########################################

@app.route("/")
def hello():
    
    return render_template("index.html")

@app.route("/addfood")
def starting():

    return render_template("followprac.html")

@app.route("/dashboard")
def thedashboard():
    
    return render_template("dashboard.html")

@app.route("/caloriesintake")
def thecalorieintakeperperson():
    return render_template("thecaloriesintake.html")

@app.route("/posedetection")
def thedetectionperperson():
    return render_template("PoseDetection.html")


@app.route('/facetologin', methods=['POST'])
def facetologin():
    req = request.get_json()
    print("FACELOGIN FACED : ",req.get("Face_name"))
    username = req.get("Face_name")
    try:
            user =[x for x in users if x.username == username][0]
            session['user_name'] = user.username
            print("Authenticate")
            return redirect(url_for('profile'))
    except:
            print("Unauthenticate")

            return redirect(url_for('login'))




@app.route("/trainingload", methods=['GET', 'POST'])
def trainingload():
    
    return render_template("trainingload.html")
   
    

@app.before_request
def before_request():
    g.user = None
    if 'user_name' in session:
        user = [x for x in users if x.username == session['user_name']][0]
        g.user = user
        
 
@app.route('/login', methods=['GET'])
def login_load():
    if g.user:
        print(g.user)
        return redirect(url_for('profile'))

    return render_template('login.html')

     
@app.route('/login', methods=['GET', 'POST'])
def login():
        readDb()
        session.pop('user_name', None)
        username = request.form['username']  
        password = request.form['password']
        
        try:
                user =[x for x in users if x.username == username  if x.password == password][0]
                session['user_name'] = user.username
                print("Authenticate")
                return redirect(url_for('profile'))
        except:
                print("Unauthenticate")
                return redirect(url_for('login'))



@app.route('/register', methods=['GET'])
def signup_load():
    if g.user:
        print(g.user)
        return redirect(url_for('profile'))

    return render_template('signup.html')




@app.route("/register", methods=['GET', 'POST'])
def signup():
    session.pop('user_name', None)
        
    username = request.form['username']  
    password1 = request.form['password1']
    password2=request.form['password2']
    last = request.form['last']  
    email = request.form['email']
    if password1 == password2:
        for x in users: 
            if x.username == username and x.last == last :
                print("ACCOUNT EXISTED")
                return redirect(url_for('signup'))
            else:
                print("SIGNUP SUCCESS")
                savedb(username,password1,last,email)
                readDb()
                print("SIGNUP USER:",username)
                session['user_name'] = username
                print("Authenticate")
                return redirect(url_for('signup_face'))
    else:
        print("Password doesn't match")
        return redirect(url_for('signup'))
    
  


@app.route("/register/face", methods=['GET', 'POST'])
def signup_face():
    if g.user:
        return render_template('signup-face.html',username = g.user)
 
      
 



@app.route("/logout")
def logout():
    session.pop('user_name', None)
    return redirect(url_for('hello'))


@app.route("/profile")
def profile():
    if g.user:
        return render_template('dashboard.html')
    else:
        return redirect(url_for('login')) 
    
 
 


@app.route("/faq", methods=['GET', 'POST'])
def faq():
     
    return render_template("faq.html")


@app.route("/poster", methods=['GET', 'POST'])
def poster():
    return render_template("poster.html")


@app.route("/poster2", methods=['GET', 'POST'])
def poster2():
    return render_template("poster2.html")


@app.route("/about", methods=['GET', 'POST'])
def about():
    return render_template("about.html")




if __name__=="__main__":
    readDb()
    app.run(debug=True,port=5000)
 