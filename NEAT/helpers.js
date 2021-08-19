

export function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

export function makeGuess(currentNodeId, endNodeId, edge, normalizationValue, brain, cy) {
  // Hämta koordinater för alla noder
  let nodeCordinates = []
  for (let elem of cy.elements()) {
    //ändra sen nod med x koordinat = 0, big bang
    elem.position().x != 0 ? nodeCordinates.push(elem.position()) : null
  }

  let input = []
  //Temporary normalizationValue
  input.push(nodeCordinates[currentNodeId].x / normalizationValue)
  input.push(nodeCordinates[currentNodeId].y / normalizationValue)
  input.push(nodeCordinates[edge.data().target].x / normalizationValue)
  input.push(nodeCordinates[edge.data().target].y / normalizationValue)
  input.push(edge.data().weight / normalizationValue)
  input.push(nodeCordinates[endNodeId].x / normalizationValue)
  input.push(nodeCordinates[endNodeId].y / normalizationValue)
  return brain.activate(input)
}