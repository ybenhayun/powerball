const WON = -1;
const TITLE = [
    'P','O','W','E','R','BALL','B','O','T'
]

$(document).ready(function() {
    let title = $('.top');

    for (let i = 0; i < TITLE.length; i++) {
        let c = '';
        if (TITLE[i] == 'BALL') {
            title.append("<span class = 'ball'><span class = 'powerball'>" + TITLE[i] + "</span></span>");
        } else {
            title.append("<span class = 'ball'>" + TITLE[i] + "</span>");
        }
    }
});

function playTheLotto() {
    let input = document.getElementsByClassName('opening')[0];
    let num_tix = Number(document.getElementById('num-tix').value);
    let same = document.getElementById('same-ticket').checked;

    if (!num_tix) return;
    
    hide(input);
    simulateLottery(num_tix, same);
}

function restart() {
    let header = document.getElementsByClassName('header')[0];
    header.innerHTML = "<h1>You have lost <span class='count'>0</span> lotteries in a row</h1>"
 
    hide(header);
}

function hide(showing) {
    let hidden = document.getElementsByClassName('hidden')[0];

    hidden.classList.remove('hidden');
    showing.classList.add('hidden');
}

function getNumbers(num) {
    let all_tickets = [];

    while (all_tickets.length < num) {
        let numbers = [];
        
        for (let i = 0; i < 5; i++) {
            let num = Math.floor(Math.random()*69) + 1;
            
            while (numbers.includes(num)) {
                num = Math.floor(Math.random()*69 + 1);
            }
            
            numbers.push(num);
        }
        
        let powerball = Math.floor(Math.random()*26) + 1;
        numbers.push(powerball);
        
        all_tickets.push(numbers);
    }

    return all_tickets;
}

const PB = "PB";
function simulateLottery(num_tix, same) {
    proceed = true;
    let count = 0;
    let summary = [];
    let lotto_numbers = getNumbers(num_tix);
    
    let iv = setInterval(function() {
        if (proceed) {
            updateScreen(count, summary, num_tix);
            count = playManyTimes(count, summary, lotto_numbers, num_tix, same);
        } 

        if (count == WON) {
            clearInterval(iv);
        }
    }, 1);
}

function playManyTimes(count, summary, previous, num_tix, same) {
    proceed = false;
    SIZE = Math.ceil(163721/num_tix);

    for (let i = 0; i < SIZE; i++) {
        let winning_numbers = getNumbers(1);
        let lotto_numbers = previous;

        if (!same) {
            lotto_numbers = getNumbers(num_tix);
        }
        
        count++

        if (compareCards(lotto_numbers, winning_numbers, summary, count) == WON) {
            return WON;
        }
    }

    proceed = true;
    return count;
}

function compareCards(lotto_numbers, winning_numbers, summary, count) {
    for (let i = 0; i < lotto_numbers.length; i++) {
        let results = listsMatch(lotto_numbers[i].slice(), winning_numbers[0].slice());
        if (results.correct == 5 && results.pb) {
            youWon(count);
            return WON;
        } else {
            update(summary, results);
        }
    }
}

function update(count, results) {
    let str = "X" + results.correct;
    if (results.pb) str = PB+results.correct;
    else if (results.correct < 3) str = "zero";

    if (!count[str]) {
        count[str] = 0;
    }

    count[str]++;
}

function updateScreen(count, summary, num_tix) {
    let current = document.getElementsByClassName('count')[0];
    current.innerHTML = withCommas(count)

    Object.keys(summary).forEach(function (key){
        let bar = document.getElementsByClassName('group '+key)[0];
        let pct = summary[key];
        let width = summary[key]/(count*num_tix);
        width = (60*width).toString() + "%";

        if (!bar) debugger;
        bar.getElementsByClassName('percent')[0].innerHTML = withCommas(pct) + "<br>" + (pct/(count*num_tix)*100).toFixed(6) + "%";
        bar.getElementsByClassName('bar')[0].style.width = width;
    });

    updateSideResults(count, summary, num_tix);
    calculateOdds(count, num_tix);
}

const PRIZES = {
    "zero": 0,
    "PB0": 4,
    "PB1": 4,
    "PB2": 7,
    "X3": 7,
    "PB3": 100,
    "X4": 100,
    "PB4": 50000,
    "X5": 100000,
};

function updateSideResults(count, summary, num_tix) {
    let money = "$" + withCommas(count*2*num_tix);
    let prize_money = 0;
    let years = withCommas(Math.round(count / 156));

    Object.keys(summary).forEach(function (key){
        prize_money += PRIZES[key]*summary[key];
    });

    prize_money = "$" + withCommas(prize_money);
    document.getElementsByClassName('cost')[0].innerHTML = "<span class = 'left'>Total Money Spent:</span><span class = 'right'> " + money + "</span>";
    document.getElementsByClassName('small-prizes')[0].innerHTML = "<span class = 'left'>Smaller Jackpots:</span><span class = 'right'> " + prize_money + "</span>";
    document.getElementsByClassName('time')[0].innerHTML = "<span class = 'left'>Total Time Elapsed: </span><span class = 'right'> " + years + " years</span>";
}

function youWon(count) {
    let message = document.getElementsByClassName('header')[0];
    message.innerHTML = "<h1>You won after playing the lottery " + withCommas(count) + " times.</h1>";
    message.innerHTML += "<button class = 'reset' onclick = 'restart()'>play again</button>";
}

const PROB = 292201338;
function calculateOdds(count, num_tix) {
    let odds = Math.pow((PROB-num_tix)/PROB, count)*100;
    let display = document.getElementsByClassName('odds')[0];

    display.innerHTML = Math.min((100-odds).toFixed(4), 99.9999) + "% of people would have won by now.";
}

function withCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function listsMatch(a, b) {
    let count = 0;
    let powerball = (a[5] == b[5]);

    a.pop();
    b.pop();

    for (let i = 0; i < a.length; i++) {
        if (b.includes(a[i])) {
            count++;
            b.splice(b.indexOf(a[i]), 1);
        }
    }

    return {correct: count, pb: powerball};
}

