import { getPop } from '../NEAT/pop.js'
import { getCy } from '../NEAT/nodeNetwork.js'
import { makeGuess } from '../NEAT/helpers.js'

const GA_POPULATION_SIZE = 100
const ITERATIONS = 50

let cy = getCy()
let population = []
let jsonPop = getPop()
let brain = neataptic.Network.fromJSON(jsonPop)

init()
/*
for(let i = 0; i < 24; i++){
    calculateProbabilities(i, 23)
    let edges = cy.elements().getElementById(i).connectedEdges()
    edges.forEach(e => {
        if(e.data('source') == i)
        console.log(e.data());
    })
}
*/

let es = cy.elements().getElementById(4).connectedEdges()
for (let i = 0; i < 100; i++) {
    for (let e of es) {
        if (e.data('source') == 4 && e.data('target') == 9)
            console.log(makeGuess(4, 23, e, 1000, brain, cy))
       //brain = neataptic.Network.fromJSON(jsonPop)
    }
}


/*
begin(4, 23)
population.forEach(e => {
    console.log(e);
});
*/
function begin(startNodeId, endNodeId) {

    for (let p of population) {
        iterate(p, startNodeId, endNodeId)
    }
}

function iterate(p, startNodeId, endNodeId) {
    let currentNodeId = startNodeId
    p.traversalOrder.push(startNodeId)
    for (let i = 0; i < ITERATIONS; i++) {
        if (currentNodeId == endNodeId) {
            //End reached
            //Give score?
            console.log('reached end wooo!');
            break;
        }
        calculateProbabilities(currentNodeId, endNodeId)
        let nextNodeId = getNextNodeId(currentNodeId)
        currentNodeId = nextNodeId
        p.traversalOrder.push(currentNodeId)
    }
}

function getNextNodeId(currentNodeId) {
    let edges = cy.elements().getElementById(currentNodeId).connectedEdges()
    let randomChoice = Math.random()
    let probabilities = []
    let chosenEdge = null
    let sum = 0
    
    for (let e of edges) {
        if (e.data('source') == currentNodeId) {
            probabilities.push(e)
        }
    }
    
    for (let i = 0; i < probabilities.length; i++) {
        sum += probabilities[i].data('probability')
        if (randomChoice < sum) {
            return probabilities[i].data('target')
        }
    }
    
    if (chosenEdge == null) {
        console.error("getNextNodeId(): Something went wrong")
    }
    
}


function init() {
    for (let i = 0; i < GA_POPULATION_SIZE; i++) {
        let truck = { traversalOrder: [], score: 0 }
        population.push(truck)
    }
}

/*
function calculateProbabilities(currentNodeId, endNodeId) {
    let edges = cy.elements().getElementById(currentNodeId).connectedEdges()
    let edgeGuess = []
    let sum = 0
    let updatedGuesses = false
    for (let e of edges) {
        let guess = 0
        if (e.data('source') == currentNodeId) {
            if (e.data('probability') == 0) {
                guess = makeGuess(currentNodeId, endNodeId, e, 1000, brain, cy)
                brain = neataptic.Network.fromJSON(jsonPop)
                console.log(currentNodeId, endNodeId, e.data(), '.guess', guess)
                edgeGuess.push(guess[0])
                sum += guess[0]
                updatedGuesses = true
            }
        }
    }
    if (updatedGuesses) {
        let index = 0
        for (let e of edges) {
            if (e.data('source') == currentNodeId) {
                let normalizedGuess = (edgeGuess[index] / sum)
                e.data('probability', normalizedGuess)
                index++
            }
        }
    }
}
*/

//Traversera med sannolikhet (Guesses)
    //Slumpvalt bryt av traversal order (Kör nya Guesses därifrån)
    //Spara en kopia av bästa truck
    //Mutera kopior av bästa truck
    //Beräkna totala vikten till jämförelse

    //Helt random vägar
    //Bedöm kostnad för vägar med NN, (Kräver supervised learning, vi har inte tid för detta !_!)
    //Fittness utifrån vikter från NN, Om den uppfyller kriterier. 
    //Mutering och Crossover blir crazy. 