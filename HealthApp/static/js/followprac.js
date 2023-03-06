const followpracapp = {
    data() {
        return {
            fooditem: "",
            thepicture: "",
            foodimageinput: [],
            imgSrc: '',
            uploaded: '',
            imgurl: '',
            theitems: ""

        }
    },
    methods: {
        previewFiles(event) {

            let imgSrc = URL.createObjectURL(event.target.files[0]);

            this.imgSrc = imgSrc

            document.getElementById('image').width = "500"
            document.getElementById('image').height = "500"

            const files = event.target.files
            const formData = new FormData()
            formData.append('file', files[0])

            var elementExists = document.getElementsByClassName("highlighter");
            console.log(elementExists.length)

            if (elementExists.length != 0) {
                for (let i = 0; i < elementExists.length; i++) {
                    document.getElementsByClassName("highlighter")[i].style.display = "none";
                }

            }
            //127.0.0.1:8000
            //it3100-190376a-mywebserver.southeastasia.azurecontainer.io
            fetch("http://it3100-190376a-mywebserver.southeastasia.azurecontainer.io/objectdetection", {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(result => {
                    if (result.theplot.length == 0) {
                        alert("Sorry, We are not able to detect any food")
                    } else {
                        thedata = []
                        console.log(result.bytes)
                        var encodedStringBtoA = btoa(result.bytes)
                        console.log(encodedStringBtoA)



                        this.theitems = ""
                        this.imgurl = 'data:image/jpeg;base64,' + encodedStringBtoA




                        var totalconsolidate = []
                        var theduplicate = []

                        var vw = Math.max(document.getElementById("image").clientWidth) || 0;
                        var vh = Math.max(document.getElementById("image").clientHeight) || 0;
                        var vidWidth = document.getElementById('image').width
                        var vidHeight = document.getElementById('image').height
                        var xStart = Math.floor((vw - vidWidth / 2));
                        var yStart = Math.floor((vh - vidHeight / 2) >= 0) ? (Math.floor((vh - vidHeight) / 2)) : 0;


                        for (let i = 0; i < result.theplot.length; i++) {
                            splittime = result.theplot[i].split(',');
                            var minY = splittime[1] * vidHeight
                            var minX = splittime[0] * vidWidth
                            var maxY = splittime[3] * vidHeight
                            var maxX = splittime[2] * vidWidth
                            var percentagescore = result.theresultscoreandname[i][1]
                            var name = result.theresultscoreandname[i][0].name
                            totalconsolidate.push(minY.toString() + "," + minX.toString() + "," + maxY.toString() + "," + maxX.toString() + "," + percentagescore.toString() + "," + name.toString())


                        }


                        theduplicate = totalconsolidate
                        console.log(theduplicate);

                        for (let l = 0; l < totalconsolidate.length; l++) {
                            firstsplit = totalconsolidate[l].split(",");
                            minimumfY = parseFloat(firstsplit[0])
                            minimumfX = parseFloat(firstsplit[1])
                            maximumfY = parseFloat(firstsplit[2])
                            maximumfX = parseFloat(firstsplit[3])
                            thepercent = firstsplit[4]
                            thename = firstsplit[5]
                            for (let p = 0; p < totalconsolidate.length; p++) {
                                if (p == l) {
                                    continue
                                } else {
                                    secondsplit = totalconsolidate[p].split(",");
                                    minimumsY = parseFloat(secondsplit[0])
                                    minimumsX = parseFloat(secondsplit[1])
                                    maximumsY = parseFloat(secondsplit[2])
                                    maximumsX = parseFloat(secondsplit[3])
                                    thesecondname = secondsplit[5]
                                    intersecting_area = Math.max(0, Math.min(maximumfY, maximumsY) - Math.max(minimumfY, minimumsY)) * Math.max(0, Math.min(maximumfX, maximumsX) - Math.max(minimumfX, minimumsX))
                                    firstarea = (maximumfX - minimumfX) * (maximumfY - minimumfY)
                                    secondarea = (maximumsX - minimumsX) * (maximumsY - minimumsY)
                                    percent_coverage = intersecting_area / (firstarea + secondarea - intersecting_area)
                                    console.log(percent_coverage + thepercent.toString())
                                    if (percent_coverage > 0.34) {
                                        theduplicate.splice(l, 1);
                                        break

                                    }
                                }

                            }
                        }

                        for (let i = 0; i < theduplicate.length; i++) {
                            splittingtime = theduplicate[i].split(',');
                            var minY = splittingtime[0]
                            var minX = splittingtime[1]
                            var maxY = splittingtime[2]
                            var maxX = splittingtime[3]
                            var thepercentage = splittingtime[4]
                            var thenewname = splittingtime[5]


                            thedata.push(maxY.toString() + "," + minX.toString() + "," + maxY.toString() + "," + maxX.toString())
                            const highlighter = document.createElement('div');
                            highlighter.setAttribute('class', 'highlighter');
                            highlighter.style = 'left: ' + parseInt(minX) + 'px; ' +
                                'top: ' + parseInt(minY) + 'px; ' +
                                'width: ' + (maxX - minX).toFixed(0) + 'px; ' +
                                'height: ' + (maxY - minY).toFixed(0) + 'px;';
                            highlighter.innerHTML = '<p>' + ((parseFloat(thepercentage).toFixed(2)) * 100).toFixed(0) + '% ' + thenewname + '</p>';
                            document.getElementById("rectview").appendChild(highlighter);

                            var elementhere = document.getElementsByClassName(thenewname + "name")[0];

                            if (typeof (elementhere) == 'undefined' && elementhere == null) {
                                var query = this.imcallingajax(thenewname)
                                console.log("hello" + this.theitems)
                            }












                        }
                    }





                })

        },
        imcallingajax(theitem) {

            $.ajax({
                method: 'GET',
                url: 'https://api.calorieninjas.com/v1/nutrition?query=' + theitem,

                headers: { 'X-Api-Key': '5/L1knsz7uArAA4OkEkiJQ==1XltAxtgEtawmA5u' },
                contentType: 'application/json',

                success: function (result) {
                    console.log(result.items[0])
                    if (typeof (result.items[0]) == 'undefined' && result.items[0] == null) {
                        document.getElementById("itemnotavail").innerHTML = "Sorry food item is not inside database, Please input "


                    }
                    else if (typeof (document.getElementsByClassName(theitem + "name")[0]) != 'undefined' && document.getElementsByClassName(theitem + "name")[0] != null) {

                    }
                    else {
                        console.log(result.items[0].calories);
                        this.theitems = result.items[0].calories.toString();
                        theglobalcalories = result.items[0].calories;
                        console.log(theglobalcalories)

                        const para = document.createElement("span");
                        para.className = theitem + "name";

                        const node = document.createTextNode("- " + theitem + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Serving Size (g): ");
                        para.appendChild(node);

                        document.getElementById("thefooddetected").appendChild(para);

                        var inputs = document.createElement("input");
                        inputs.type = "number";
                        inputs.setAttribute("min", 0)
                        inputs.className = theitem + "servingsize";
                        inputs.onkeyup = function () {

                            if (document.getElementsByClassName(theitem + "servingsize")[0].value.toString().includes("-")) {
                                alert("No Negative Number !")
                            } else {
                                // get current calories
                                beforecalories = document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[0].innerHTML
                                beforecholestoral = document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[1].innerHTML
                                beforefats = document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[2].innerHTML
                                beforecarbo = document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[3].innerHTML
                                // to get the original serving size
                                notsureifitwork = result.items[0].serving_size_g

                                // get the latest serving size
                                theservingsize = document.getElementsByClassName(theitem + "servingsize")[0].value;
                                console.log(theservingsize)
                                // update calories

                                thenewcaloriesintake = ((parseFloat(result.items[0].calories) / parseFloat(notsureifitwork)) * theservingsize).toFixed(2);
                                document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[0].innerHTML = thenewcaloriesintake.toString();
                                // update cholestoral

                                thenewcholestoral = ((parseFloat(result.items[0].cholesterol_mg) / parseFloat(notsureifitwork)) * theservingsize).toFixed(2);
                                document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[1].innerHTML = thenewcholestoral.toString();

                                // update fats
                                thenewfats = ((parseFloat(result.items[0].fat_total_g) / parseFloat(notsureifitwork)) * theservingsize).toFixed(2);
                                document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[2].innerHTML = thenewfats.toString();

                                //update carbohydrates
                                thenewcarbohydrates = ((parseFloat(result.items[0].carbohydrates_total_g) / parseFloat(notsureifitwork)) * theservingsize).toFixed(2);
                                document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[3].innerHTML = thenewcarbohydrates.toString();


                                

                                totalcalories = totalcalories - beforecalories + parseFloat(thenewcaloriesintake);

                                totalcholesterol = totalcholesterol - beforecholestoral + parseFloat(thenewcholestoral);
                                totalfats = totalfats - beforefats + parseFloat(thenewfats);
                                totalcarbohydrates = totalcarbohydrates - beforecarbo + parseFloat(thenewcarbohydrates);
                                document.getElementById("thetotalcal").rows[1].cells[0].innerHTML = totalcalories.toFixed(2);
                                document.getElementById("thetotalcal").rows[1].cells[1].innerHTML = totalcholesterol.toFixed(2);
                                document.getElementById("thetotalcal").rows[1].cells[2].innerHTML = totalfats.toFixed(2);
                                document.getElementById("thetotalcal").rows[1].cells[3].innerHTML = totalcarbohydrates.toFixed(2);

                                firebase.database().ref("User/FoodItems/"+addingoption+"/"+displaydate+"/"+theitem).update({
                                    calories:thenewcaloriesintake,
                                    cholestoral: thenewcholestoral,
                                    fats: thenewfats,
                                    carbohydrates :thenewcarbohydrates,
                                    servingsize:theservingsize
        
                                });
                                
                            }




                        }

                        inputs.style.width = "50px";  // set the CSS class
                        document.getElementById("thefooddetected").appendChild(inputs);
                        document.getElementsByClassName(theitem + "servingsize")[0].value = result.items[0].serving_size_g


                        // create delete
                        var option = document.createElement("button");
                        option.setAttribute("class", theitem + "delete");
                        option.setAttribute("type", "button");
                        option.innerHTML = '<i class="material-icons">delete</i>';
                        option.style.cssText = "padding:0;border:none;background:none;position:relative;bottom:-5px;float:right;"
                        option.onclick = function () {

                            var el = document.getElementsByClassName(theitem + "servingsize")[0];
                            el.remove()
                            var elname = document.getElementsByClassName(theitem + "name")[0];
                            elname.remove()

                            var eldelbutton = document.getElementsByClassName(theitem + "delete")[0];
                            eldelbutton.remove()

                            

                            totalcalories = totalcalories - parseFloat(document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[0].innerHTML)
                            totalcholesterol = totalcholesterol - parseFloat(document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[1].innerHTML);
                            totalfats = totalfats - parseFloat(document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[2].innerHTML);
                            totalcarbohydrates = totalcarbohydrates - parseFloat(document.getElementsByClassName(theitem + "tablewithcalories")[0].rows[1].cells[3].innerHTML);
                            document.getElementById("thetotalcal").rows[1].cells[0].innerHTML = totalcalories.toFixed(2);
                            document.getElementById("thetotalcal").rows[1].cells[1].innerHTML = totalcholesterol.toFixed(2);
                            document.getElementById("thetotalcal").rows[1].cells[2].innerHTML = totalfats.toFixed(2);
                            document.getElementById("thetotalcal").rows[1].cells[3].innerHTML = totalcarbohydrates.toFixed(2);
                            
                            var eltable = document.getElementsByClassName(theitem + "tablewithcalories")[0];
                            eltable.remove()

                            firebase.database().ref("User/FoodItems/"+addingoption+"/"+displaydate+"/"+theitem).remove();
                                
                        }
                        document.getElementById("thefooddetected").appendChild(option);


                        t = document.createElement('table');
                        t.setAttribute('class', theitem + "tablewithcalories")
                        r = t.insertRow(0)
                        c = r.insertCell(0)
                        c.innerHTML = "Calories"
                        c = r.insertCell(1)
                        c.innerHTML = "Cholestoral"
                        c = r.insertCell(2)
                        c.innerHTML = "Total Fats"
                        c = r.insertCell(3)
                        c.innerHTML = "Carbohydrates"

                        g = t.insertRow(1)
                        n = g.insertCell(0)
                        n.innerHTML = theglobalcalories
                        n = g.insertCell(1)
                        n.innerHTML = result.items[0].cholesterol_mg
                        n = g.insertCell(2)
                        n.innerHTML = result.items[0].fat_total_g
                        n = g.insertCell(3)
                        n.innerHTML = result.items[0].carbohydrates_total_g

                        document.getElementById("thefooddetected").appendChild(t);
                        // the total table

                        totalcalories = totalcalories + parseFloat(theglobalcalories)
                        totalcholesterol = totalcholesterol + parseFloat(result.items[0].cholesterol_mg)
                        totalfats = totalfats + parseFloat(result.items[0].fat_total_g)
                        totalcarbohydrates = totalcarbohydrates + parseFloat(result.items[0].carbohydrates_total_g)

                        document.getElementById("thetotalcal").rows[1].cells[0].innerHTML = totalcalories.toFixed(2);
                        document.getElementById("thetotalcal").rows[1].cells[1].innerHTML = totalcholesterol.toFixed(2);
                        document.getElementById("thetotalcal").rows[1].cells[2].innerHTML = totalfats.toFixed(2);
                        document.getElementById("thetotalcal").rows[1].cells[3].innerHTML = totalcarbohydrates.toFixed(2);
                        
                        
                        firebase.database().ref("User/FoodItems/"+addingoption+"/"+displaydate+"/"+theitem).set({
                            calories:theglobalcalories,
                            cholestoral: result.items[0].cholesterol_mg,
                            fats: result.items[0].fat_total_g,
                            carbohydrates :result.items[0].carbohydrates_total_g,
                            servingsize:result.items[0].serving_size_g,
                            thedate: displaydate
                            
                        });
                        

                    }




                },
                error: function ajaxError(jqXHR) {
                    console.error('Error: ', jqXHR.responseText);
                }
            });
        },
        enterfooditems() {
            thewrittenfood = this.fooditem;
            this.imcallingajax(thewrittenfood);
        }
    }
}
Vue.createApp(followpracapp).mount("#demo2app")