const board = document.getElementById('board')
const grid = document.getElementById('grid')

const pauseBtn = document.getElementById('pauseBtn')
const redoBtn = document.getElementById('redoBtn')
const minesCountText = document.getElementById('minesCount')

const MOUSE_BUTTONS = {
    LEFT: 0,
    RIGHT: 2
}
const FLAG_TYPES = {
    OK: 1,
    DOUBT: 2
}

const appendSeconds = document.getElementById('seconds')
const appendMinutes = document.getElementById('minutes')
const appendHours = document.getElementById('hours')

//disable flaged box 
document.addEventListener('contextmenu', event => event.preventDefault())

let gridWidth = 12
let gridHeight = 12

let nMines
let totalMines
let nMinesDiscovered

let stopped
let paused
let firstClick

let squares
let mines

let seconds
let minutes
let hours

let interval


class Square {
    constructor({ }) {
        this.mine = false
        this.discovered = false
        this.adjacentMines = 0
        this.flagType = undefined
    }
}

const setInitialVariables = () => {
    stopped = false
    paused = false
    firstClick = true

    seconds = 0
    minutes = 0
    hours = 0

    nMines = 0
    nMinesDiscovered = 0

    pauseBtn.innerHTML = 'Pause'
    grid.style.visibility = 'visible'

    squares = []
    mines = [[]]

    totalMines = 2 * Math.floor(Math.sqrt(gridHeight * gridWidth))
    grid.innerHTML = ''
    grid.style["grid-template-columns"] = "auto ".repeat(gridWidth)


}

const populateGrid = () => {
    for (let i = 0; i < gridHeight; i++) {
        mines[i] = []
        for (let j = 0; j < gridWidth; j++) {
            mines[i].push(new Square({}))
            const square = document.createElement('div')
            square.className = 'square'
            square.addEventListener('mousedown', (event) => {
                switch (event.button) {
                    case MOUSE_BUTTONS.LEFT:
                        checkMine(i, j)
                        break;
                    case MOUSE_BUTTONS.RIGHT:
                        putFlag(i, j)
                    default:
                        break;
                }
            })
            squares.push(square)
            grid.appendChild(square)
        }
    }
}


function redo() {
    if(stopped) {
        unblow() 
    }
}
function unblow(i,j) {
    
}


const setMines = () => {
    let minesToPopulate = totalMines
    while (minesToPopulate > 0) {
        let i = Math.floor(Math.random() * gridHeight)
        let j = Math.floor(Math.random() * gridWidth)

        //squares[gridWidth * i + j].innerHTML = 'B' // dòng này để hiện bom lên 

        if (!mines[i][j].mine) {
            mines[i][j].mine = true
            minesToPopulate--
        }
    }
}

const setAdjancentMines = () => {
    for (let i = 0; i < mines.length; i++) {
        for (let j = 0; j < mines[i].length; j++) {
            if (!mines[i][j].mine) {
                let n = 0
                if ((i - 1 >= 0) && (j - 1 >= 0) && mines[i - 1][j - 1].mine) {
                    n++
                }
                if ((i - 1 >= 0) && mines[i - 1][j].mine) {
                    n++
                }
                if ((i - 1 >= 0) && (j + 1 < mines[i].length) && mines[i - 1][j + 1].mine) {
                    n++
                }
                if ((j - 1 >= 0) && mines[i][j - 1].mine) {
                    n++
                }
                if ((j + 1 < mines[i].length) && mines[i][j + 1].mine) {
                    n++
                }
                if ((i + 1 < mines.length) && (j - 1 >= 0) && mines[i + 1][j - 1].mine) {
                    n++
                }
                if ((i + 1 < mines.length) && mines[i + 1][j].mine) {
                    n++
                }
                if ((i + 1 < mines.length) && (j + 1 < mines[i].length) && mines[i + 1][j + 1].mine) {
                    n++
                }
                mines[i][j].adjancentMines = n
                //squares[gridWidth * i +j].innerHTML = n // dòng này để hiện hết số ra check 
            }
        }
    }
}

const checkMine = (i, j) => {
    if (stopped) return;

    if (firstClick) {
        firstClick = false;
        startTimer();
    }

    if (mines[i][j].flagType === FLAG_TYPES.OK) return;
    if (mines[i][j].mine) {
        blow();
        stopped = true;
    } else if (mines[i][j].adjancentMines > 0 && mines[i][j].discovered) {
        if (checkAdjacentFlags(i, j)) {
            autoOpenAdjacentCells(i, j);
        }
    } else {
        floodFill(i, j);
    }
};

const checkAdjacentFlags = (i, j) => {
    let adjacentFlags = 0;

    // Kiểm tra các ô xung quanh
    for (let row = i - 1; row <= i + 1; row++) {
        for (let col = j - 1; col <= j + 1; col++) {
            if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
                if (mines[row][col].flagType === FLAG_TYPES.OK) {
                    adjacentFlags++;
                }
            }
        }
    }

    return adjacentFlags === mines[i][j].adjancentMines;
};

const autoOpenAdjacentCells = (i, j) => {
    for (let row = i - 1; row <= i + 1; row++) {
        for (let col = j - 1; col <= j + 1; col++) {
            if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
                if (!mines[row][col].discovered && mines[row][col].flagType !== FLAG_TYPES.OK) {
                    if (mines[row][col].mine) {
                        blow();
                        stopped = true;
                    } else {
                        floodFill(row, col);
                    }
                }
            }
        }
    }
};

const floodFill = (i, j) => {

    if (mines[i][j].discovered || mines[i][j].mine 
        || mines[i][j].flagType === FLAG_TYPES.OK
        || mines[i][j].flagType === FLAG_TYPES.DOUBT) {
        return
    } else {
        mines[i][j].discovered = true
        squares[i * gridWidth + j].style.background = "#c8def1"
        nMinesDiscovered++

        if (nMinesDiscovered === gridWidth * gridHeight - totalMines) {
            alert("You won!!! Press New Game to play again")
            stopped = true
        }
        if (mines[i][j].adjancentMines != 0) {
            squares[i * gridWidth + j].innerText = mines[i][j].adjancentMines
            return
        }
    }

    if ((i - 1 >= 0) && (j - 1 >= 0)) {
        floodFill(i - 1, j - 1)
    }
    if (i - 1 >= 0) {
        floodFill(i - 1, j)
    }
    if ((i - 1 >= 0) && (j + 1 < mines[i].length)) {
        floodFill(i - 1, j + 1)
    }
    if (j - 1 >= 0) {
        floodFill(i, j - 1)
    }
    if (j + 1 < mines[i].length) {
        floodFill(i, j + 1)
    }
    if ((i + 1 < mines.length) && (j - 1 >= 0)) {
        floodFill(i + 1, j - 1)
    }
    if ((i + 1 < mines.length)) {
        floodFill(i + 1, j)
    }
    if ((i + 1 < mines.length) && (j + 1 < mines[i].length)) {
        floodFill(i + 1, j + 1)
    }
    return
}

const blow = () => {
    for (let i = 0; i < mines.length; i++) {
        for (let j = 0; j < mines[i].length; j++) {
            if (mines[i][j].mine) {
                const bombImg = document.createElement('img')
                bombImg.src = './media/bomb.png'
                squares[i * gridWidth + j].innerHTML = ''
                squares[i * gridWidth + j].appendChild(bombImg)
            }
        }
    }

}

const putFlag = (i, j) => {

    if (mines[i][j].discovered || stopped) return;
    if (!mines[i][j].flagType) {
        
        flag(i, j);
    } else if (mines[i][j].flagType === FLAG_TYPES.OK) {
        
        doubt(i, j);
    } else if (mines[i][j].flagType === FLAG_TYPES.DOUBT) {
        
        unDoubt(i, j);
    }
}

function flag(i, j) {

    const flagImg = document.createElement('img')
    flagImg.src = './media/flag.png'
    squares[i * gridWidth + j].innerHTML = ''
    squares[i * gridWidth + j].appendChild(flagImg)
    nMines++
    minesCountText.innerText = `${nMines}/${totalMines}`
    mines[i][j].flagType = FLAG_TYPES.OK
}
function doubt(i, j) {
    const flagDoubtImg = document.createElement('img')
    flagDoubtImg.src = './media/flag_doubt.png'
    squares[i * gridWidth + j].innerHTML = ''
    squares[i * gridWidth + j].appendChild(flagDoubtImg)
    nMines--
    minesCountText.innerText = `${nMines}/${totalMines}`
    mines[i][j].flagType = FLAG_TYPES.DOUBT
}
function unDoubt(i, j) {
    squares[i * gridWidth + j].innerHTML = ''
    mines[i][j].flagType = undefined
}

const stopwatch = () => {
    if (!paused && !stopped) {
        seconds++
    }
    if (seconds <= 9) {
        appendSeconds.innerHTML = "0" + seconds
    }
    if (seconds > 9 && seconds < 60) {
        appendSeconds.innerHTML = seconds
    }
    if (seconds > 59) {
        seconds = 0
        appendSeconds.innerHTML = seconds
        minutes++
    }

    if (minutes <= 9) {
        appendMinutes.innerHTML = "0" + minutes
    }
    if (minutes > 9 && minutes >= 60) {
        appendMinutes.innerHTML = minutes
    }
    if (minutes > 59) {
        minutes = 0
        appendMinutes.innerHTML = minutes
        minutes++
    }

    if (hours <= 9) {
        appendHours.innerHTML = "0" + hours
    }
    if (seconds > 9 && seconds >= 60) {
        appendHours.innerHTML = hours
    }
    if (seconds > 59) {
        seconds = 0
        appendHours.innerHTML = hours
        hours++
    }
}

const clearStopwatch = () => {
    appendSeconds.innerHTML = "00"
    appendMinutes.innerHTML = "00"
    appendHours.innerHTML = "00"
}

const startTimer = () => {
    clearInterval(interval)
    interval = setInterval(stopwatch, 1000)
}

const pause = () => {
    paused = !paused
    if (paused) {
        pauseBtn.innerHTML = 'Countinue'
        grid.style.visibility = 'hidden'
    } else {
        pauseBtn.innerHTML = 'Pause'
        grid.style.visibility = 'visible'
    }
}

const newGame = () => {
    const level = document.getElementById('level')
    switch (level.value) {
        case 'small':
            gridWidth = 12
            gridHeight = 12
            break;
        case 'medium':
            gridWidth = 16
            gridHeight = 16
            break;
        case 'large':
            gridWidth = 20
            gridHeight = 20
            break;

        default:
            break;
    }
    startGame()
}

const startGame = () => {
    setInitialVariables()
    clearInterval(interval)
    populateGrid()
    setMines()
    setAdjancentMines()
}

startGame()

const hamburger = document.getElementById('hamburger')
hamburger.onclick = function () {
    navBar = document.getElementById('nav-bar')
    navBar.classList.toggle('active')
}


