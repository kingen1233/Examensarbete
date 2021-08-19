import { download } from './helpers.js'
import { getNodeNetwork } from './nodes.js'

const USE_PREDEFINED_NETWORK = true

let cy

// Add method to reset edges.data.guess => null

if(USE_PREDEFINED_NETWORK){
  let network = getNodeNetwork()
  initNetwork()
  cy = cy.json(network)

} else {
  initNetwork()
  download(JSON.stringify(cy.json()), 'Node Network', 'text/plain')
}

cy.fit()

export function getCy() {
  return cy
}

function initNetwork() {
  let nodes = []
  const amntNodes = 25
  for (let i = 0; i < amntNodes; i++) {
    let nodeObj = {
      data: { id: i }
    }
    nodes.push(nodeObj)
  }
  let edgeId = 100
  let idx = 0;
  const MAX_WEIGHT = 10

  //refactorisera, den är ful
  for (let k = 0; k < 5; k++) {
    for (let j = 0; j < 5; j++) {
      if (j < 4) {
        let weight = Number(Math.floor(Math.random() * MAX_WEIGHT))
        let nodeObj = {
          data: { id: edgeId, source: idx, target: idx + 1, weight: weight, probability: 0},
        }
        edgeId++;
        nodes.push(nodeObj)
      }
      if (j > 0) {
        let weight = Number(Math.floor(Math.random() * MAX_WEIGHT))
        let nodeObj = {
          data: { id: edgeId, source: idx, target: idx - 1, weight: weight, probability: 0},
        }
        edgeId++;
        nodes.push(nodeObj)
      }
      if (k < 4) {
        let weight = Number(Math.floor(Math.random() * MAX_WEIGHT))
        let nodeObj = {
          data: { id: edgeId, source: idx, target: idx + 5, weight: weight, probability: 0},
        }
        edgeId++;
        nodes.push(nodeObj)
      }
      if (k > 0) {
        let weight = Number(Math.floor(Math.random() * MAX_WEIGHT))
        let nodeObj = {
          data: { id: edgeId, source: idx, target: idx - 5, weight: weight, probability: 0},
        }
        edgeId++;
        nodes.push(nodeObj)
      }
      idx++;
    }
  }

  cy = cytoscape({

    container: document.getElementById('cy'), // container to render in

    elements: nodes,

    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      },

      {
        selector: '.edge2',
        style: {
          'width': 3,
          'line-color': '#0F0',
          'target-arrow-color': '#0F0',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      },

      {
        selector: '.edge3',
        style: {
          'width': 3,
          'line-color': '#00F',
          'target-arrow-color': '#00F',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }

    ],

    layout: {
      name: 'grid',
      rows: 5
    }

  });
}