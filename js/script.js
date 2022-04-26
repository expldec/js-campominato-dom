// X Il computer deve generare 16 numeri casuali nello stesso range della difficoltà prescelta: le bombe.
// X I numeri nella lista delle bombe non possono essere duplicati.
// X In seguito l'utente clicca su una cella: se il numero è presente nella lista dei numeri generati - abbiamo calpestato una bomba - la cella si colora di rosso e la partita termina, altrimenti la cella cliccata si colora di azzurro e l'utente può continuare a cliccare sulle altre celle.
// X La partita termina quando il giocatore clicca su una bomba o raggiunge il numero massimo possibile di numeri consentiti.
// X Al termine della partita il software deve comunicare il punteggio, cioè il numero di volte che l’utente ha cliccato su una cella che non era una bomba.
// **BONUS:**
// 1 - L'utente indica un livello di difficoltà in base al quale viene generata una griglia di gioco quadrata, in cui ogni cella contiene un numero tra quelli compresi in un range:
// X con difficoltà 1 => tra 1 e 100
// X con difficoltà 2 => tra 1 e 81
// X con difficoltà 3 => tra 1 e 49
// X **2- quando si clicca su una bomba e finisce la partita, evitare che si possa cliccare su altre celle
// ****3- quando si clicca su una bomba e finisce la partita, il software scopre tutte le bombe nascoste



//imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('start-button').addEventListener('click', prepareGame)

// Questa funzione prende una stringa ("difficulty") che può essere "easy", "medium", "hard"
// e costruisce un div contenente, rispettivamente, 100, 81 o 49 div con una classe pertinente alla difficulty 
function buildGrid(difficulty) {
    //creiamo un div e gli diamo la classe 'grid-container'
    const thisGrid = document.createElement('div')
    thisGrid.classList.add('grid-container');
    //convertiamo "difficulty" (che è una stringa) in un valore numerico con uno la nostra funzione dedicata
    let gridSize = difficultyToNumber(difficulty);
    //Settiamo una variabile con la quantità di bombe che vogliamo generare
    let numberofBombs = 16;
    //generiamo un array di bombe appropriato per la dimensione della grid. 
    let bombArray = generateUniqueRandomsinRange(numberofBombs,gridSize);
    console.log(bombArray);
    let safeCellsClicked = [];
    // in questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for (let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span>${i}</span>`;
        newCell.classList.add('cell');
        newCell.classList.add(difficulty);
        //aggiungiamo un eventListener che attiva/disattiva la classe "active" se si clicca sul div
               newCell.addEventListener('click', cellClickHandler);
        thisGrid.append(newCell);
    }
    

    //una volta popolata la griglia, è pronta e la restituiamo
    return thisGrid;


    // HELPER FUNCTIONS. Le creo all'interno di questa funzione così possono accedere alla varaibili dichiarate al suo interno.
    function cellClickHandler() {
            let thisCellNumber = parseInt(this.textContent);
            if (bombArray.includes(thisCellNumber)) {
                this.classList.add('bomb');
                gameEnd(false);
            }
            else {
                this.classList.add('active');
                safeCellsClicked.push(thisCellNumber);
                console.log(`Safe cells clicked: ${safeCellsClicked.length} To win: ${gridSize - numberofBombs}`);
                if (safeCellsClicked.length >= gridSize - numberofBombs) {
                    gameEnd(true);
                }
            }
            this.removeEventListener('click', cellClickHandler);

    }
    // questa funzione prende un valore booleano (true === vittoria, false === sconfitta)
    // non ritorna niente e manipola il DOM per mostrare la schermata di fine gioco al giocatore
    function gameEnd(winLose) {
        let result = document.getElementById("result");
        let resultText = "";
        let pluralizedPoint = safeCellsClicked.length ===1 ? "punto" : "punti";
        if (winLose) {
            resultText = `Hai vinto!!`;
        }
        else {
            resultText = `Hai perso. Hai fatto ${safeCellsClicked.length} ${pluralizedPoint} su ${gridSize - numberofBombs}`
        }
        result.textContent = resultText;
        result.classList.remove("hidden")

        //disattiviamo gli eventListener su tutte le celle
        cells = document.getElementsByClassName("cell")
        for (let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener("click", cellClickHandler);
            //se abbiamo perso, evidenziamo tutte le bombe
            if (!winLose && bombArray.includes(parseInt(cells[i].textContent))) {
                cells[i].classList.add('bomb');
            }
        }
    }
}

// la funzione chiamata con il click al bottone "start"
function prepareGame(){
    //leggiamo la difficolta scelta dall'utente (nel select)
    userPickedDifficulty = document.getElementById('difficulty').value;
    //imbrigliamo il container della griglia
    let grid = document.querySelector('.grid-container');
    //creiamo un nuovo container generandolo con la funzione buildGrid 
    let newGrid = buildGrid(userPickedDifficulty);
    //sostituiamo il container della griglia con quello generato dalla funzione
    grid.parentNode.replaceChild(newGrid, grid);
    //
    document.getElementById("result").classList.add("hidden")
}

function difficultyToNumber(difficultyString) {
    switch (difficultyString) {
        case 'easy':
            return 100;
            break;
        case 'medium':
            return 81;
            break;
        case 'hard':
            return 49;
            break;
    }
}

// questa funzione prende due integers (quantity e rangeMax) e restituisce un array contentente "quantity" elementi
// generati a caso da 1 a "rangemax"
function generateUniqueRandomsinRange(quantity, rangeMax) {
    let uniqueRandoms = [];
    let i = 0;
    while (uniqueRandoms.length < quantity) {
        let thisRandom = Math.floor(Math.random()*rangeMax) + 1;
        if (!uniqueRandoms.includes(thisRandom)) {
            uniqueRandoms.push(thisRandom);
            i++;
        }
    }
    //ordino l'array. Step superfluo. Fatto puramente per leggibilità umana.
    uniqueRandoms.sort(function(a, b){return a - b});
    return uniqueRandoms;
}

