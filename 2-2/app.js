function Sum(a, b) {
    return a + b;
}

function isEven(num) {
    if(num % 2 === 0) {
        return true;
    }
    else {
        return false;
    }
}

function logGreet(name, country, greeting = "Buongiorno", message = "Welcome to my app!") {
    let sentence = `${greeting}, ${name} from ${country}! ${message}`;
    console.log(sentence);
}

function logRandomNum() {
    let rnd = Math.random();
    console.log((rnd * 100).toFixed(0));
}

console.log(Sum(3, 5));
console.log(isEven(7));
logGreet("Penko", "Yugoslavia", "Privet");
logRandomNum();
