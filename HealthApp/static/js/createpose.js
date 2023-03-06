let video;
let poseNet;
let pose;
let skeleton;



let brain;
let poseLabel = "";

var iterationCounter;
var timeLeft;
var thesets;
var theactivityselected;
var globalcalories;

iterationCounter=0;
thesets=0;
globalcalories=0;



function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    timeLeft=30;
    document.getElementById("time").textContent="00:"+ timeLeft;

    let options = {
        inputs: 34,
        outputs: 3,
        task: 'classification',
        debug: true
    }

    brain = ml5.neuralNetwork(options);
    const modelInfo = {
        model: '/static/alotepoch/model.json',
        metadata: '/static/alotepoch/model_meta.json',
        weights: '/static/alotepoch/model.weights.bin',
    };
    brain.load(modelInfo, brainLoaded);
    
}

function selectedsoon(theactivity){
    theactivityselected=theactivity;
    thesets=0;
    iterationCounter=0;
    globalcalories=0;
    timeLeft=30;
    document.getElementById("time").textContent="00:"+timeLeft;
    document.getElementById("setscompleted").textContent=thesets;
    document.getElementById("thecalburned").textContent=globalcalories;
    
}

function brainLoaded() {
    console.log("pose classification ready!")
    classifyPose();
}

function classifyPose() {
    if (pose) {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            inputs.push(x);
            inputs.push(y);


        }
        
        console.log("right wrist:",pose.rightWrist.x,pose.rightWrist.y)
        console.log("left wrist:",pose.leftWrist.x,pose.leftWrist.y)
        console.log("right knee:",pose.rightKnee.x,pose.rightKnee.y)
        console.log("left wrist:",pose.leftKnee.x,pose.leftKnee.y)
        console.log("Right elbow:",pose.rightElbow.x,pose.rightElbow.y)
        console.log("Right ankle:",pose.rightAnkle.x,pose.rightAnkle.y)
        console.log("left ankle:",pose.leftAnkle.x,pose.leftAnkle.y)
        console.log("Right ear:",pose.rightEar.x,pose.rightEar.y)
        console.log("Left ear:",pose.leftEar.x,pose.leftEar.y)
        console.log("right hip",pose.rightHip.x,pose.rightHip.y)
        console.log("right shoulder",pose.rightShoulder.x,pose.rightShoulder.y)
        console.log("left shoulder",pose.leftShoulder.x,pose.leftShoulder.y)
        if(theactivityselected=="tree" && pose.leftWrist.x-pose.rightWrist.x<70 && pose.leftWrist.y-pose.rightWrist.y<30 && pose.rightEar.y>12 &&  pose.rightElbow.y-pose.rightWrist.y<15 && pose.leftKnee.x-pose.rightKnee.x>80 && pose.leftAnkle.y-pose.rightAnkle.y>10){
            
            brain.classify(inputs, gotResult);
        }else if(theactivityselected=="warrior" && pose.leftWrist.x-pose.rightWrist.x>225 && pose.leftKnee.x-pose.rightKnee.x>100 && pose.leftKnee.y-pose.leftWrist.y>170 && pose.rightEar.y>12 && pose.leftKnee.y-pose.rightKnee.y>10 && pose.rightShoulder.x-pose.rightKnee.x>15 ){
            brain.classify(inputs, gotResult);
        }else{
            setTimeout(classifyPose, 100);
        }
        


    } else {
        setTimeout(classifyPose, 100);
    }
}



function gotResult(error, results) {
    console.log("you here?")
    
    if (results[0].label.toUpperCase() == "T" && theactivityselected=="tree") {
        
        if (results[0].confidence > 0.70) {
            console.log(results[0].confidence)
            console.log("you are doing Tree")
            iterationCounter=iterationCounter+1;
            if(iterationCounter==30){
                iterationCounter=0;
                restartPose();
            }else{
                timeLeft=timeLeft-1;
                if(timeLeft<10){
                    document.getElementById("time").textContent = "00:0" + timeLeft;
                }else{
                    document.getElementById("time").textContent = "00:" + timeLeft;
                }
                setTimeout(classifyPose,1000);

            }

        }else{
            classifyPose();
        }

    }else if (results[0].label.toUpperCase() == "W" && theactivityselected=="warrior") {
        if (results[0].confidence > 0.70) {
            console.log(results[0].confidence)
            console.log("you are doing warrior")
            iterationCounter=iterationCounter+1;
            if(iterationCounter==30){
                iterationCounter=0;
                restartPose();
            }else{
                timeLeft=timeLeft-1;
                if(timeLeft<10){
                    document.getElementById("time").textContent = "00:0" + timeLeft;
                }else{
                    document.getElementById("time").textContent = "00:" + timeLeft;
                }
                setTimeout(classifyPose,1000);

            }

        }else{
            classifyPose();
        }
        
    }else{
        classifyPose();
    }


    //console.log(results[0].confidence);
    
}



function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}


function modelLoaded() {
    console.log('poseNet ready');
}

function draw() {
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);

    if (pose) {
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y)

        fill(255, 0, 0);
        ellipse(pose.nose.x, pose.nose.y, 25);
        fill(0, 0, 255);
        ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
        ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);


        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 255, 0);
            ellipse(x, y, 16, 16);
        }

        for (let i = 0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(255);
            line(a.position.x, a.position.y, b.position.x, b.position.y)
        }
        
    }
}

function restartPose(){
    iterationCounter=0;
    timeLeft=30;
    thesets=thesets+1;
    globalcalories=globalcalories+1.7;
    document.getElementById("time").textContent="00:"+timeLeft;
    document.getElementById("setscompleted").textContent=thesets;
    document.getElementById("thecalburned").textContent=globalcalories;
    thenewdatedate=new Date();
    thetimehi=Date.now().toString();
    
    firebase.database().ref("User/theinfo/exer/"+thenewdatedate.getFullYear() + "-" + (thenewdatedate.getMonth() + 1) + "-" + thenewdatedate.getDate()+" "+thetimehi).set({
        thetimehi:"1.7"
    });
    
    setTimeout(classifyPose,4000);
}


