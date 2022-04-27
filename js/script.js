//imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('start-button').addEventListener('click', prepareGame)

// Questa funzione prende una stringa ('difficulty') che può essere 'easy', 'medium', 'hard'
// e costruisce un div contenente, rispettivamente, 100, 81 o 49 div con una classe pertinente alla difficulty 
function buildGrid(difficulty) {
    //creiamo un div e gli diamo la classe 'grid-container'
    const thisGrid = document.createElement('div')
    thisGrid.classList.add('grid-container');
    //convertiamo 'difficulty' (che è una stringa) in un valore numerico con uno la nostra funzione dedicata
    let gridSize = difficultyToNumber(difficulty);
    //Settiamo una variabile con la quantità di bombe che vogliamo generare
    let numberofBombs = 16;
    //generiamo un array di bombe appropriato per la dimensione della grid. 
    let bombArray = generateUniqueRandomsinRange(numberofBombs,gridSize);
    console.log(bombArray);

    //TESTING CODE. REMOVE LATER
    // bombArray = [12,24,30,48];
    let recursiveCount=0;


    let safeCellsClicked = [];
    // in questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for (let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span></span>`;
        newCell.dataset.cellno = i;
        newCell.classList.add('cell');
        newCell.classList.add(difficulty);
        //aggiungiamo un eventListener che applica tutta la logica del gioco quando clicchiamo sul div
        newCell.addEventListener('click', cellClickHandler);
        //secondo eventlistener per il click destro
        newCell.addEventListener('contextmenu', cellRightClick);
        thisGrid.append(newCell);
    }
    //una volta popolata la griglia, è pronta e la restituiamo
    
    return thisGrid;


    // HELPER FUNCTIONS. Le creo all'interno di questa funzione così possono accedere alla variabili dichiarate al suo interno.
    function cellClickHandler() {
        let thisCellNumber = parseInt(this.dataset.cellno);
        // se hai cliccato una bomba
        if (bombArray.includes(thisCellNumber)) {
            this.classList.add('bomb');
            gameEnd(false);
        }
        //se hai cliccato una cella pulita
        else {
            this.classList.add('active');
            let thisAdjacents = getAdjacents(thisCellNumber,Math.sqrt(gridSize),Math.sqrt(gridSize));
            console.log(thisAdjacents);
            let thisAdjacentBombs = countBombsInArray(thisAdjacents);
            if (thisAdjacentBombs > 0) {
                this.classList.add(`b${thisAdjacentBombs}`);
                this.querySelector('span').textContent = thisAdjacentBombs;
            }
            else {
                //inizio una funzione ricorsiva
                adjacentsDrilldown(thisAdjacents);
            }
            safeCellsClicked.push(thisCellNumber);
            console.log(`Safe cells clicked: ${safeCellsClicked.length} To win: ${gridSize - numberofBombs}`);
            if (safeCellsClicked.length >= gridSize - numberofBombs) {
                gameEnd(true);
            }
        }
        this.removeEventListener('click', cellClickHandler);

    }

    function cellRightClick(event) {
        event.preventDefault();
        if (!event.target.classList.contains('active')) {
            console.log(event.target);
            if (!event.target.classList.contains('flag')) {
                event.target.classList.add('flag');
                event.target.removeEventListener('click', cellClickHandler)
            }
            else {
                event.target.classList.remove('flag');
                event.target.addEventListener('click', cellClickHandler)
            }
        }
        console.log(event.target);
    }
    // questa funzione prende un valore booleano (true === vittoria, false === sconfitta)
    // non ritorna niente e manipola il DOM per mostrare la schermata di fine gioco al giocatore
    function gameEnd(winLose) {
        let result = document.getElementById('result');
        let resultText = '';
        let pluralizedPoint = safeCellsClicked.length ===1 ? 'punto' : 'punti';
        if (winLose) {
            resultText = `Hai vinto!!`;
            safeCellsClicked.sort(function(a, b){return a - b})
            console.log(safeCellsClicked);
            console.log('recusion count:', recursiveCount);
        }
        else {
            resultText = `Hai perso. Hai fatto ${safeCellsClicked.length} ${pluralizedPoint} su ${gridSize - numberofBombs}`
        }
        result.textContent = resultText;
        result.classList.remove('hidden')

        //disattiviamo gli eventListener su tutte le celle
        cells = document.getElementsByClassName('cell')
        for (let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener('click', cellClickHandler);
            cells[i].removeEventListener('contextmenu', cellRightClick);
            //se abbiamo perso, evidenziamo tutte le bombe (comprese quelle coperte dalle bandierine)
            if (!winLose && bombArray.includes(parseInt(cells[i].dataset.cellno))) {
                cells[i].classList.add('bomb');
                cells[i].classList.remove('flag');
            }
        }
    }

    function countBombsInArray(adjacentList) {
        let sumOfBombs = 0;
        for (let i = 0; i < adjacentList.length; i++) {
            if (bombArray.includes(adjacentList[i])) {
                sumOfBombs++;
            }
        }
        return sumOfBombs;
    }

    //funzione ricorsiva che viene chiamata quando una cella scoperta non ha bombe intorno
    // prende un array di celle adiacenti a una data cella,
    // e scopre le celle libere tra queste finché ne trova tra gli adiacenti degli adiacenti degli adiacenti ecc.
    function adjacentsDrilldown(thisAdjacents) {
        //variabile di debug per controllare che non faccia troppe ricursioni
        recursiveCount++;
        console.log('No bombs around. drilling down to its neighbors');
        //facciamo partire un loop per scorrere tutte le celle adiacenti.
        for (let i = 0; i < thisAdjacents.length; i++) {
            // a ogni giro, imbrigliamo la cella 
            let thisAdjacentAdjacent = document.querySelector(`[data-cellno='${thisAdjacents[i]}']`);
            console.log('cell', thisAdjacents[i]);
            // console.log(thisAdjacentAdjacent);
            //troviamo le celle adiacenti a loro volta a questa
            let thisAdjacentAdjacents = getAdjacents(thisAdjacents[i],Math.sqrt(gridSize),Math.sqrt(gridSize));
            console.log('this adjacent cell has he following neighbors:', thisAdjacentAdjacents);
            //contiamo le bombe intorno a questa cella
            let thisAdjacentAdjacentBombs = countBombsInArray(thisAdjacentAdjacents);
            console.log(`this adjacent cell is surrounded by ${thisAdjacentAdjacentBombs} bombs`);
            // controlliamo che non sia già stata scoperta
            let isThisAdjacentAdjacentClicked = thisAdjacentAdjacent.classList.contains('active');
            let isThisAdjacentAdjacentFlagged = thisAdjacentAdjacent.classList.contains('flag');
            console.log('is it active?', isThisAdjacentAdjacentClicked);
            // se non è attiva, la attiviamo
            if (!isThisAdjacentAdjacentClicked&&!isThisAdjacentAdjacentFlagged) {
                console.log('good. Activating cell.');
                thisAdjacentAdjacent.classList.add('active');
                safeCellsClicked.push(thisAdjacents[i]);
                // se ha delle bombe intorno, la popoliamo con il conteggio delle bombe
                if (thisAdjacentAdjacentBombs > 0) {
                    thisAdjacentAdjacent.classList.add(`b${thisAdjacentAdjacentBombs}`);
                    console.log('adding text content:', thisAdjacentAdjacentBombs);
                    thisAdjacentAdjacent.querySelector('span').textContent = thisAdjacentAdjacentBombs;
                }
                // se NON è attiva e NON ha bombe intorno, chiamiamo la funzione in cui già ci troviamo, ricorsivamente,
                // passadole i vicini di questa cella 
                if (thisAdjacentAdjacentBombs === 0) {
                    adjacentsDrilldown(thisAdjacentAdjacents);
                }
            }
            
        }
    }
}

// la funzione chiamata con il click al bottone 'start'
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
    document.getElementById('result').classList.add('hidden')
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

// questa funzione prende due integers (quantity e rangeMax) e restituisce un array contentente 'quantity' elementi
// generati a caso da 1 a 'rangemax'
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

// Prende il numero di cella di una griglia rettangolare dove le celle sono numerate da destra a sinistra, dall'alto verso il basso
// e restituisce un array contenente i numeri delle celle che la circondano.
//
// Valori di input:
// cellno (int): il numero della cella
// width (int): il numero delle celle lungo la larghezza della griglia rettangolare
// height (int): il numero delle celle lungo l'altezza della griglia rettangolare
//
function getAdjacents(cellno,width,height) {
    const isThisEdge = isEdge(cellno,width,height);
    const adjacents = [];
    if ([0,4,7,8].includes(isThisEdge)) {
        adjacents.push(cellno - width - 1);
    }
    if ([0,3,4,6,7,8].includes(isThisEdge)) {
        adjacents.push(cellno - width);
    }
    if ([0,3,6,8].includes(isThisEdge)) {
        adjacents.push(cellno - width + 1);
    }
    if ([0,2,4,5,7,8].includes(isThisEdge)) {
        adjacents.push(cellno - 1);}

    if ([0,1,3,5,6,8].includes(isThisEdge)) {
        adjacents.push(cellno + 1);
    }
    if ([0,2,5,7].includes(isThisEdge)) {
        adjacents.push(cellno + width - 1);
    }
    if ([0,1,2,5,6,7].includes(isThisEdge)) {
        adjacents.push(cellno + width);
    }
    if ([0,1,5,6].includes(isThisEdge)) {
        adjacents.push(cellno + width + 1);
    }
    return adjacents;
}

// Prende il numero di cella di una griglia rettangolare dove le celle sono numerate da destra a sinistra, dall'alto verso il basso
// e restituisce un numero che rappresenta la sua posizione rispetto a un bordo.
//
// Valori di input:
// cellno (int): il numero della cella
// width (int): il numero delle celle lungo la larghezza della griglia rettangolare
// height (int): il numero delle celle lungo l'altezza della griglia rettangolare
//
// Valori di return: 
// 0: la cella non è lungo un bordo
// 1: la cella copre l'angolo in alto a sinistra
// 2: la cella copre l'angolo in alto a destra
// 3: la cella copre l'angolo in basso a sinistra
// 4: la cella copre l'angolo in basso a destra
// 5: la cella si trova sul bordo superiore
// 6: la cella si trova sul bordo sinistro
// 7: la cella si trova sul bordo destro
// 8: la cella si trova sul bordo inferiore
function isEdge(cellno,width,height) {
    const isOnTopEdge = Math.floor((cellno - 1) / width) === 0;
    const isOnBottomEdge = Math.floor((cellno - 1) / width) + 1 === height;
    const isOnLeftEdge = cellno % width === 1;
    const isonRightEdge = cellno % width === 0;
    
    return isOnTopEdge && isOnLeftEdge ? 1
         : isOnTopEdge && isonRightEdge ? 2
         : isOnBottomEdge && isOnLeftEdge ? 3
         : isOnBottomEdge && isonRightEdge ? 4
         : isOnTopEdge ? 5
         : isOnLeftEdge ? 6
         : isonRightEdge ? 7
         : isOnBottomEdge ? 8
         : 0;

}