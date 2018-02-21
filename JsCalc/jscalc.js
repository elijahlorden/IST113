function add(op1, op2){
    return op1+op2
}

function sub(op1, op2){
    return op1-op2
}

function mul(op1, op2){
    return op1*op2
}

function div(op1, op2){
    return op1/op2
}

function driver() {
    console.log("5 + 2 = " + add(5,2))
    console.log("5 - 2 = " + sub(5,2))
    console.log("5 * 2 = " + mul(5,2))
    console.log("5 / 2 = " + div(5,2))
}

driver()