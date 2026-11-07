let display = document.getElementById("display");

function appendValue(value){
    if(display.value === "0")
        display.value = value;
    else
        display.value += value;
}

function clearDisplay(){
    display.value = "0";
}

function calculate(){
    try{
        display.value = eval(display.value);
    }
    catch{
        display.value = "Error";
    }
}

function appendFunction(func){

    let value = parseFloat(display.value);

    switch(func){

        case "sin":
            display.value = Math.sin(value*Math.PI/180);
            break;

        case "cos":
            display.value = Math.cos(value*Math.PI/180);
            break;

        case "tan":
            display.value = Math.tan(value*Math.PI/180);
            break;

        case "sqrt":
            display.value = Math.sqrt(value);
            break;

        case "log":
            display.value = Math.log(value);
            break;

        case "log10":
            display.value = Math.log10(value);
            break;
    }
}

function factorial(){

    let n = parseInt(display.value);

    if(n < 0){
        display.value = "Error";
        return;
    }

    let result = 1;

    for(let i=1;i<=n;i++)
        result *= i;

    display.value = result;
}