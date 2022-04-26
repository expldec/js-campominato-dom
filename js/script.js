//imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('generate-button').addEventListener('click', function(){

    //nell'Event listener, leggiamo la difficolta scelta dall'utente (nel select)
    userPickedDifficulty = document.getElementById('difficulty').value;
    //imbrigliamo il container della griglia
    let grid = document.querySelector('.grid-container');
    
    //creiamo un nuovo container generandolo con la funzione buildGrid 
    let newGrid = buildGrid(userPickedDifficulty);

    //sostituiamo il container della griglia con quello generato dalla funzione
    grid.parentNode.replaceChild(newGrid, grid);
})

// Questa funzione prende una stringa ("size") che può essere "easy", "medium", "hard"
// e costruisce un div contenente, rispettivamente, 100, 81 o 49 div con una classe pertinente alla size 
function buildGrid(size) {
    //creiamo un div e gli diamo la classe 'grid-container'
    const thisGrid = document.createElement('div')
    thisGrid.classList.add('grid-container');
    //inizializziamo la variabile gridSize e gli diamo un valore numerico con uno switch
    let gridSize = '';
    switch (size) {
        case 'easy':
            gridSize = 100;
            break;
        case 'medium':
            gridSize = 81;
            break;
        case 'hard':
            gridSize = 49;
            break;
    }
    // in questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for (let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span>${i}</span>`;
        newCell.classList.add('cell');
        newCell.classList.add(size);
        //aggiungiamo un eventListener che attiva/disattiva la classe "active" se si clicca sul div
               newCell.addEventListener('click',
            function() {
                this.classList.toggle('active');
            }
        )
        thisGrid.append(newCell);
    }
    //una volta popolata la griglia, è pronta e la restituiamo
    return thisGrid;
}