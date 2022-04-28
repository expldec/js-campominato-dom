//imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('start-button').addEventListener('click', prepareGame)

// la funzione chiamata con il click al bottone 'start'
function prepareGame(){
    //leggiamo la difficolta scelta dall'utente (nel select)
    userPickedDifficulty = document.getElementById('difficulty').value;
    //imbrigliamo il container della griglia
    let grid = document.querySelector('.grid-container');
    //Generiamo una nuova partita con la funzione buildGrid 
    let newGrid = buildGrid(userPickedDifficulty);
    //sostituiamo il container della griglia con quello generato dalla funzione
    grid.parentNode.replaceChild(newGrid, grid);
    //
    document.getElementById('result').classList.add('hidden')
}

// Questa funzione genera la griglia di gioco.
// prende una stringa ('difficulty') che può essere 'easy', 'medium', 'hard'
// restituisce un div contenente, rispettivamente, 100, 81 o 49 div con una classe pertinente alla difficulty
// Le variabili e le funzioni che implementano la logica della partita sono dichiarate qui.
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
    // Inizializziamo un array che conterrà le celle "safe" (non-bomba) cliccate dal giocatore
    let safeCellsClicked = [];
    
    //TESTING CODE. REMOVE LATER
    // bombArray = [12,24,30,48];
    let recursiveCount=0;
    // END OF TESTING CODE

    // in questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for (let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span></span>`;
        //invece di popolare l'InnerHTML dell'elemento, popolo l'attributo HTML data-cellno del div della cella.
        newCell.dataset.cellno = i;
        newCell.classList.add('cell');
        newCell.classList.add(difficulty);
        //aggiungiamo un eventListener che applica tutta la logica del gioco quando clicchiamo sul div
        newCell.addEventListener('click', cellClickHandler);
        //secondo eventlistener per il click destro che ci permette di mettere bandierine sulle celle
        newCell.addEventListener('contextmenu', cellRightClick);
        thisGrid.append(newCell);
    }
    //una volta popolata la griglia, è pronta e la restituiamo
    return thisGrid;


    // HELPER FUNCTIONS. Le creo all'interno di questa funzione così possono accedere alla variabili dichiarate al suo interno.

    //Funzione per stabilire cosa succede nel gioco al click sinistro su una cella
    function cellClickHandler() {
        let thisCellNumber = parseInt(this.dataset.cellno);
        // se hai cliccato una bomba, hai perso
        if (bombArray.includes(thisCellNumber)) {
            this.classList.add('bomb');
            gameEnd(false);
        }
        //se hai cliccato una cella pulita
        else {
            //attiviamo la cella
            this.classList.add('active');
            //troviamo le celle adiacenti a questa
            let thisAdjacents = getAdjacents(thisCellNumber,Math.sqrt(gridSize),Math.sqrt(gridSize));
            console.log(thisAdjacents);
            //contiamo quante bombe ci sono nelle celle adiacenti
            let thisAdjacentBombs = countBombsInArray(thisAdjacents);
            //se intorno ci sono bombe, scriviamo il numero di bombe nella cella e le diamo una classe per cambiare colore al testo
            if (thisAdjacentBombs > 0) {
                this.classList.add(`b${thisAdjacentBombs}`);
                this.querySelector('span').textContent = thisAdjacentBombs;
            }
            // se non ci sono bombe intorno, scopriamo anche le celle adiacenti a cascata.
            else {
                //inizio una funzione ricorsiva
                adjacentsDrilldown(thisAdjacents);
            }
            //aggiungo la cella cliccata al conteggio delle celle "pulite" scoperte
            //(se non l'abbiamo già aggiunto dentro la funzione ricorsiva)
            if (!safeCellsClicked.includes(thisCellNumber)) {
                safeCellsClicked.push(thisCellNumber);
            }
            console.log(`Safe cells clicked: ${safeCellsClicked.length} To win: ${gridSize - numberofBombs}`);
            //se hai scoperto tutte le celle pulite, hai vinto.
            if (safeCellsClicked.length >= gridSize - numberofBombs) {
                gameEnd(true);
            }
        }
        // una volta cliccata una cella, non sarà più cliccabile.
        this.removeEventListener('click', cellClickHandler);
    }

    //Funzione per stabilire cosa succede al click DESTRO su una cella (attiva/disattiva la bandiera)
    //prende con argomento l'evento (passato dall'Event Listener)
    function cellRightClick(event) {
        //impediamo che compaia il menù a tendina del browser
        event.preventDefault();
        //se la cella NON È ATTIVA
        if (!this.classList.contains('active')) {
            //se NON è già flaggata, le diamo la classe "flag" e togliamo l'event listener del click sinistro
            if (!this.classList.contains('flag')) {
                this.classList.add('flag');
                this.removeEventListener('click', cellClickHandler)
            }
            // se è già flaggata, togliamo la classe flag e ripristiniamo l'event listener.
            else {
                this.classList.remove('flag');
                this.addEventListener('click', cellClickHandler)
            }
        }
    }

    // questa funzione prende un valore booleano (true === vittoria, false === sconfitta)
    // non ritorna niente e manipola il DOM per mostrare la schermata di fine gioco al giocatore
    function gameEnd(winLose) {
        let result = document.getElementById('result');
        let resultText = '';
        let pluralizedPoint = safeCellsClicked.length ===1 ? 'punto' : 'punti';
        //se winLose è true, hai vinto.
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
    // prende un array di celle,
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
            //troviamo le celle a loro volta adiacenti a questa
            let thisAdjacentAdjacents = getAdjacents(thisAdjacents[i],Math.sqrt(gridSize),Math.sqrt(gridSize));
            console.log('this adjacent cell has he following neighbors:', thisAdjacentAdjacents);
            //contiamo le bombe intorno a questa cella
            let thisAdjacentAdjacentBombs = countBombsInArray(thisAdjacentAdjacents);
            console.log(`this adjacent cell is surrounded by ${thisAdjacentAdjacentBombs} bombs`);
            // controlliamo che non sia già stata scoperta
            let isThisAdjacentAdjacentClicked = thisAdjacentAdjacent.classList.contains('active');
            let isThisAdjacentAdjacentFlagged = thisAdjacentAdjacent.classList.contains('flag');
            console.log('is it active?', isThisAdjacentAdjacentClicked);
            console.log('is it flagged?', isThisAdjacentAdjacentFlagged);
            // se non è attiva (e non è flaggata), la attiviamo
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
    
    if (!isThisEdge[0]) {                   // se la cella non è sul bordo superiore
        adjacents.push(cellno - width);     // pushamo la cella adiacente in alto
    }
    if (!isThisEdge[1]) {                   // se la cella non è sul bordo inferiore
        adjacents.push(cellno + width);     // pushamo la cella adiacente in basso
    }
    if (!isThisEdge[2]) {                   // se la cella non è sul bordo sinistro
        adjacents.push(cellno - 1);        // pushamo la cella adiacente a sinistra
    }
    if (!isThisEdge[3]) {                   // se la cella non è sul bordo destro
        adjacents.push(cellno + 1);         // pushamo la cella adiacente a destra
    }
    if (!isThisEdge[0] && !isThisEdge[2]) { // se la cella non è sul bordo superiore nè sul bordo sinistro
        adjacents.push(cellno - width - 1); // pushamo la cella adiacente in alto a sinistra
    }
    if (!isThisEdge[0] && !isThisEdge[3]) { // se la cella non è sul bordo superiore nè sul bordo destro
        adjacents.push(cellno - width + 1); // pushamo la cella adiacente in alto a destra
    }
    if (!isThisEdge[1] && !isThisEdge[2]) { // se la cella non è sul bordo inferiore nè sul bordo sinistro
        adjacents.push(cellno + width - 1); // pushamo la cella adiacente in basso a sinistra
    }
    if (!isThisEdge[1] && !isThisEdge[3]) { // se la cella non è sul bordo inferiore nè sul bordo destro
        adjacents.push(cellno + width + 1); // pushamo la cella adiacente in basso a destra
    }
    return adjacents;
}

// Prende il numero di cella di una griglia rettangolare dove le celle sono numerate da destra a sinistra, dall'alto verso il basso
// e restituisce un array che rappresenta la sua posizione rispetto ai bordi.
//
// Valori di input:
// cellno (int): il numero della cella
// width (int): il numero delle celle lungo la larghezza della griglia rettangolare
// height (int): il numero delle celle lungo l'altezza della griglia rettangolare
//
// Valore di return:
// edgeArray = [isOnTopEdge,isOnBottomEdge,isOnLeftEdge,isonRightEdge]
// dove ciascun elemento è un valore booleano che è true se la cella si trova lungo il bordo in questione
// (rispettivamente, bordo superiore, inferiore, sinistro e destro)
// Esempi:
// - isEdge(5,4,5) restituirà [false, false, true, false] --> la cella 5 di un quadrato 4*5 è sul bordo sinistro
// - isEdge(20,4,5) resituirà [false, true, false, true]  --> la cella 5 di un quadrato 4*5 è sul bordo destro e anche sul bordo inferiore
function isEdge(cellno,width,height) {
    const isOnTopEdge = Math.floor((cellno - 1) / width) === 0;
    const isOnBottomEdge = Math.floor((cellno - 1) / width) + 1 === height;
    const isOnLeftEdge = cellno % width === 1;
    const isonRightEdge = cellno % width === 0;
    const edgeArray = [isOnTopEdge,isOnBottomEdge,isOnLeftEdge,isonRightEdge];

    return edgeArray;

}