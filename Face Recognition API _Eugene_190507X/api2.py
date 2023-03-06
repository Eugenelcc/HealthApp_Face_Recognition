import face_recognition
from flask import Flask, jsonify, request, redirect,render_template,Response
from flask.helpers import url_for
from numpy import remainder
from joblib import dump, load
import os 
from os import path
import os.path
from flask_cors import CORS
from sklearn import neighbors
import math
import base64 
import os
import os.path
import pickle
 


# You can change this to any folder on your system
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


app = Flask(__name__)
CORS(app)

#FACEMODEL
model = "TrainingFacial.joblib"

 
 

 

@app.route('/', methods=['GET', 'POST'])
def hello():
        return render_template("home.html")









#### MAIN CONTROL####
def base(file):
    prediction = predict(file.filename, model_path=model)
     
    print(prediction)
    for final in prediction:
        result = {
            "Face_name": final[0],
            "face_location": final[1]
        }
        
    return jsonify(result)




def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


####################################################################
def predict(filename, knn_clf=None, model_path=None, distance_threshold=0.5):

    if knn_clf is None and model_path is None:
        raise Exception("Must supply knn classifier either thourgh knn_clf ")

    # Load a trained KNN model (if one was passed in)
    if knn_clf is None:
        knn_clf = load(model_path)
        print("Model Loadup")

    #Load images from filename
    X_img = face_recognition.load_image_file("face.png")
    X_face_locations = face_recognition.face_locations(X_img)

    #if no faces found in the image
    if len(X_face_locations) == 0:
        return [ ("No_face",["False"])]

     # Find encodings for faces in the test iamge
    faces_encodings = face_recognition.face_encodings(
        X_img, known_face_locations=X_face_locations)

    # Use the KNN model to find the best matches for the test face
    closest_distances = knn_clf.kneighbors(faces_encodings, n_neighbors=2)
    are_matches = [closest_distances[0][i][0] <=
                   distance_threshold for i in range(len(X_face_locations))]

    for i in range(len(X_face_locations)):
        print("Closest Distance")
        print(closest_distances[0][i][0])

    # Predict classes and remove classifications that aren't within the threshold
    return [(pred, loc, are_matches) if rec else ("unknown", loc, are_matches) for pred, loc, rec in zip(knn_clf.predict(faces_encodings), X_face_locations, are_matches)]
   ###########################################################################



"======================PREDICT IMAGE==================="
@app.route('/predictImg', methods=['GET', 'POST'])

def upload_image():
    # Check if a valid image file was uploaded
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)

        file = request.files['file']
        file.save("face.png")

        if file.filename == '':
            return redirect(request.url)
            
      
        if file:
            # The image file seems valid! Detect faces and return the result.
            return base(file)
        

    return("Check console")
    # If no valid image file was uploaded, show the file upload form:
   
##################################################################
 
 





 
 
 
 







def faceDetection(image):
    faceImg = face_recognition.load_image_file(image)
    known_face_location = face_recognition.face_locations(faceImg)
    if len( known_face_location) ==1: # If no of face is  equal to 1 
         
        return True
    else:
        return False





#Save PICKLE
def save_obj(obj, filename):
    with open(filename + '.pkl', 'wb') as file:
        pickle.dump(obj, file, pickle.HIGHEST_PROTOCOL)

#LOAD PICKLE
def load_obj(filename): #FaceDB
    with open(filename + '.pkl', 'rb') as file:
        return pickle.load(file)

#PICKLE FACEDB
filename = "FaceDB"
 
 
if path.exists(filename +'.pkl'):
        FaceDB = load_obj(filename)
        print("FOUND")
       
else:
    FaceDB = {}
    print("CREATE NEW DICT")
     




"======================Training Model==================="
@app.route('/training', methods=['GET', 'POST'])
def upload_training():
    index = ["2","3","done"]

    # Check if a valid image file was uploaded
    if request.method == 'POST':
        name = request.values["name"]
        file = request.files['file']
        file.save("face.png")
        print("FROM FRONTEND TO API RETRIEVE NAME : "+name)

        if faceDetection(file):
            print("Detect Face")
            faceImg = face_recognition.load_image_file(file)
            face_enc = face_recognition.face_encodings(faceImg)[0]
            if name in FaceDB: #Name found in FACEDB
                ###############
                if len(FaceDB[name]) <3:
                    FaceDB[name].append(face_enc) 
                ###############     
            else: #Name not found in FACEDB
                FaceDB[name] = []
                FaceDB[name].append(face_enc)

            print(FaceDB[name])
            
            if len(FaceDB[name]) == 3 :
                save_obj(FaceDB,filename)

            result = {"result": index[len(FaceDB[name])-1]}
            print(result)

            return jsonify(result) #2,3,done
        
        else:
            print("Detect No Face")
            result = {
            "result" :"False"
            }
            print(result)
            return jsonify(result) #False


        
      
      
 
@app.route('/trainingloadingAPI', methods=['GET', 'POST'])
def trainingloading():
    response = request.values["response"]
    if response == "Train":
        if train(filename,n_neighbors=2):
            result = {
                    "result" :"Complete"
                    }
            return jsonify(result) #False
    else:
        result = {
                "result" :"False"
                }

        return jsonify(result) 
 









def train(filename,n_neighbors=None, knn_algo='ball_tree', verbose=False):
    X=[]
    y=[]

    if path.exists(filename +'.pkl' ):
        lookup_tb = load_obj(filename)
        print("Found pickle")
        for k,v in lookup_tb.items():
            for i in v:
                X.append(i)  #Face Encoding
                y.append(k)  #Person
        
    else:
        print("PICKLE NOT FOUND ")
        return False
     
    print("weighting for KNN")
    # Determine how many neighbors to use for weighting in the KNN classifier
    if n_neighbors is None:
        n_neighbors = int(round(math.sqrt(len(X))))
        if verbose:
            print("Chose n_neighbors automatically:", n_neighbors)

    # Create and train the KNN classifier
    print("Starting training") 
    knn_clf = neighbors.KNeighborsClassifier(n_neighbors=n_neighbors, algorithm=knn_algo, weights='distance')
    knn_clf.fit(X, y)

    dump(knn_clf, 'TrainingFacial.joblib')
    print("Saving the model in joblib")
    return True
 
 
"================================================"
if __name__ == "__main__":
        app.run(debug=True,port=8000)
