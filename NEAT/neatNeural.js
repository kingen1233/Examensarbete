import { getCy } from './nodeNetwork.js'
import { getPop} from './pop.js'
import { download, makeGuess } from './helpers.js'

//Import neataptic
let Neat = neataptic.Neat
let methods = neataptic.methods
let config = neataptic.config
let architect = neataptic.architect
let network = neataptic.Network

//Constants
const POPULATION_SIZE = 50
const MUTATION_RATE = 0.1
const ELITISM_RATE = 0.1
const START_HIDDEN_SIZE = 0
const AMNT_ITERATIONS = 13
const AMNT_GENERATIONS = 500
const PATHS_TO_TEST = 30
const USE_TRAINED_POP = false

// Graph.js variables
NODE_RADIUS = 10
REPEL_FORCE = 0
LINK_DISTANCE = 100
WIDTH = 500
HEIGHT = 500

//Global vars
let neat
let trucks
let highestScore
let bestPath
let edgesPassed
let cheapestWeight
let dijkstraLength
let savedPopulation

//Node network
let cy = getCy()

if (USE_TRAINED_POP) {
  savedPopulation = []
  let jsonPop = getPop()
  let bestNetwork = neataptic.Network.fromJSON(jsonPop)
  for (let i = 0; i < POPULATION_SIZE; i++) {
    savedPopulation.push(bestNetwork)
  }
}

initNeat()
for(let i = 0; i < PATHS_TO_TEST; i++){
  console.time('path')
  // 25 = amount of nodes
  let startNode = Math.floor(Math.random()*25)
  let endNode = Math.floor(Math.random()*25)
  while(startNode == endNode){
    startNode = Math.floor(Math.random()*25)
  }
  //Takes startnode and end node
  runProgram(startNode, endNode)
  neat.generation = 0
  console.timeEnd('path')
}

function initNeat() {

  let options = {
    mutation: [
      methods.mutation.ADD_NODE,
      methods.mutation.SUB_NODE,
      methods.mutation.ADD_CONN,
      methods.mutation.SUB_CONN,
      methods.mutation.MOD_WEIGHT,
      methods.mutation.MOD_BIAS,
      methods.mutation.MOD_ACTIVATION,
      methods.mutation.ADD_GATE,
      methods.mutation.SUB_GATE,
      methods.mutation.ADD_BACK_CONN,
      methods.mutation.SUB_BACK_CONN
    ],
    popsize: POPULATION_SIZE,
    mutationRate: MUTATION_RATE,
    elitism: Math.round(ELITISM_RATE * POPULATION_SIZE),
    threads: 2000,
    network: new architect.Random(7, START_HIDDEN_SIZE, 1)
  }

  neat = new Neat(7, 1, null, options)

  methods.mutation.MOD_ACTIVATION.allowed = [
    //methods.activation.LOGISTIC,
    methods.activation.TANH,
    //methods.activation.RELU,
    //Activation.IDENTITY,
    //methods.activation.STEP,
    //Activation.SOFTSIGN,
    //Activation.SINUSOID,
    //methods.activation.GAUSSIAN,
    //methods.activation.BENT_IDENTITY,
    //methods.activation.BIPOLAR,
    methods.activation.BIPOLAR_SIGMOID,
    methods.activation.HARD_TANH,
    //Activation.ABSOLUTE
  ];

  if (USE_TRAINED_POP) {
    neat.population = savedPopulation
  }
  else{
    for (var i = 0; i < 100; i++) neat.mutate();  
  }
}

function drawPath(path, edgeGroup){
  // Travel path and change color to edges
  for (let d of path) {
    const id = d.data('id')
    const ele = cy.elements().getElementById(id)
    if (ele.data('source')) ele.classes(edgeGroup)
  }
}

function dijkstra(startId, endId) {

  let options = {
    root: cy.elements().getElementById(startId),
    weight: function (edge) {
      return edge.data('weight')
    },
    directed: true,
  }
  var dijkstra = cy.elements().dijkstra(options)
  var goalNode = cy.elements().getElementById(endId)
  var pathToJ = dijkstra.pathTo(goalNode);
  var distToJ = dijkstra.distanceTo(goalNode);

  // Travel path and change color to edges
  drawPath(pathToJ, 'edge2')
  dijkstraLength = distToJ
  console.log('Total weight traveled:', distToJ)
}

function startEval(startNode, endNode) {
  trucks = []
  highestScore = -Infinity

  for (let genome in neat.population) {
    genome = neat.population[genome]
    trucks.push(new Truck(genome))
  }

  // Start the trucks
  for (let t of trucks) {
    t.startIteration(startNode, endNode)
  }
}

function endEval(startNode, endNode) {

  neat.sort()
  //console.log('Generation:', neat.generation, '- average score:', neat.getAverage())
  //console.log('Fittest score:', Math.round(neat.getFittest().score));

  var newPopulation = []

  // Elitism
  for (var i = 0; i < neat.elitism; i++) {
    newPopulation.push(neat.population[i])
  }


  //byt ut startvärde till neat.elitism
  // flytta ELitism till efter mutate?
  // Breed the next individuals
  for (var i = 0; i < neat.popsize - neat.elitism; i++) {
    newPopulation.push(neat.getOffspring())
  }


  // Replace the old population with the new population
  // console.log(neat.population)
  neat.population = newPopulation
  neat.mutate()
  neat.generation++
  startEval(startNode, endNode)
}

function runProgram(startNode, endNode) {

  dijkstra(startNode, endNode)
  
  startEval(startNode, endNode)

  // Done with all generations, stop doing stuff
  while (neat.generation <= AMNT_GENERATIONS) {
    //This will loop untill generation goal is met. Since new eval is started in endEval
    endEval(startNode, endNode)
  }

  //Display and print final values
  neat.sort()
  let fittestNetwork = neat.population[0]
  drawGraph(fittestNetwork.graph(WIDTH, HEIGHT), '.draw')
  
  //color neat path, print lenghts
  drawPath(edgesPassed, 'edge3')
  document.getElementById("dijkstraCost").innerHTML = dijkstraLength
  document.getElementById("neatCost").innerHTML = cheapestWeight
  
  console.log(bestPath,'path weight:', cheapestWeight,'score', highestScore)

  download(JSON.stringify(fittestNetwork), 'json.txt', 'text/plain')

}

function Truck(genome) {
  this.startNodeId = 0
  this.endNodeId = 0
  this.iterations = 0

  this.edgesPassed = []
  this.path = []

  this.brain = genome
  this.brain.score = 0

  Truck.prototype.startIteration = function (startNodeId, endNodeId) {
    this.startNodeId = startNodeId
    this.endNodeId = endNodeId
    this.path = []
    this.iteration(startNodeId)
  }

  Truck.prototype.iteration = function (currentNodeId) {


    while (AMNT_ITERATIONS > this.iterations) {

      if (this.path.includes(Number(currentNodeId))) {
        this.brain.score -= 100
      }

      this.path.push(Number(currentNodeId))

      if (currentNodeId == this.endNodeId) {
        //Goal reached, give reward
        this.brain.score += 100 
        break;
      }

      let edges = this.getEdges(currentNodeId)
      let edgeChoice = { edge: null, guess: -Infinity }

      for (let e of edges) {

        let guess = makeGuess(currentNodeId, this.endNodeId, e, 1000, this.brain, cy)

        if (guess > edgeChoice.guess) {
          edgeChoice.edge = e
          edgeChoice.guess = guess
        }
      }

      this.edgesPassed.push(edgeChoice.edge)
      let nextNodeId = edgeChoice.edge.data().target
      this.iterations++
      currentNodeId = nextNodeId
    }

    let sco = 0
    for (let e of this.edgesPassed) {
      sco += e.data().weight
    }
    
    this.brain.score -= Math.pow(sco, 1.6)
    // Save highest score ever
    if(this.brain.score > highestScore){
      highestScore = this.brain.score
      bestPath = this.path
      cheapestWeight = sco
      edgesPassed = this.edgesPassed
    }
  }


  Truck.prototype.getEdges = function (nodeId) {

    let edges = cy.elements().getElementById(nodeId).connectedEdges()
    let edgeData = []
    for (let e of edges) {
      if (e.data().source == nodeId) {
        edgeData.push(e)
        //Do stuff with edges
      }
    }
    return edgeData
  }
}


/* May not be needed
function calcFitness() {
  fitness = 0



  return fitness
}
*/

/*
async function xor(){

  var trainingSet = [
  { input: [0,0], output: [0] },
  { input: [0,1], output: [1] },
  { input: [1,0], output: [1] },
  { input: [1,1], output: [0] }
]

let options = {
    log: 10,
    popsize: 100,
    mutation: methods.mutation.FFW,
    elitism: 10,
    equal: true,
    error: 0.0001,
    mutationRate: 0.5,
    iterations: 2000,
    threads: 1
}

let myNetwork = new Network(2, 1);
await myNetwork.evolve(trainingSet, options);

drawGraph(myNetwork.graph(300, 300), '.draw')

console.log(myNetwork.activate([0,0])); // [0]
console.log(myNetwork.activate([0,1])); // [1]
console.log(myNetwork.activate([1,0])); // [1]
console.log(myNetwork.activate([1,1])); // [0]

}
xor()
*/