const csv = require("csvtojson");
const converter = require('json-2-csv');
const fs = require("fs");

// ターミナルで
// npm install
// 実施するのは：npm run serve
// 試験のデータはinput.csvに書いてある
// 結果はoutput.csvファイルに印刷されている

var vertexData = {
    vertices: {},
    unvisitedCounter: 0,
    updateVisitedCounter: function () {
        vertexData.unvisitedCounter = objectToArray(vertexData.vertices).filter(i => !i.visited).length;
    }
};

function objectToArray(inputObject) {
    return Object.keys(inputObject).map(function (k) {
        return inputObject[k]
    });
}

function setUpVertexData(testingData) {
    Object.keys(testingData).forEach(function (key) {
        vertexData.vertices[key] = {
            id: key,
            visited: false,
            previousVertexId: "",
            calculatedDistance: undefined,
            adjacentVertexIds: Object.keys(testingData[key]),
            adjacentVertices: testingData[key]
        }
    });

    vertexData.updateVisitedCounter();
}

function getCurrentVertex() {
    var validVertices = objectToArray(vertexData.vertices).filter(i => !i.visited && i.calculatedDistance !== undefined);

    if (validVertices.length === 0) {
        return null;
    }

    var currentVertex = validVertices[0];

    if (validVertices.length === 1) {
        return currentVertex;
    }

    validVertices.forEach(vertex => {
        if (vertex.calculatedDistance <= currentVertex.calculatedDistance) {
            currentVertex = vertex;
        }
    }
    );

    return currentVertex;
}

function getUnvisitedAdjacentVerticesOfTheCurrentVertex(currentVertexId) {
    return vertexData.vertices[currentVertexId].adjacentVertexIds.filter(i => !vertexData.vertices[i].visited);
}

function anylizeData(testingData, startVertexId) {
    setUpVertexData(testingData);
    vertexData.vertices[startVertexId].calculatedDistance = 0;
    vertexData.vertices[startVertexId].previousVertexId = startVertexId;

    while (vertexData.unvisitedCounter > 0) {
        var currentVertex = getCurrentVertex();
        var adjacentVertexIds = getUnvisitedAdjacentVerticesOfTheCurrentVertex(currentVertex.id);

        adjacentVertexIds.forEach(id => {
            var distanceToCurrentVertex = vertexData.vertices[id].adjacentVertices[currentVertex.id];

            if (vertexData.vertices[id].calculatedDistance === undefined || vertexData.vertices[id].calculatedDistance > (currentVertex.calculatedDistance + distanceToCurrentVertex)) {
                vertexData.vertices[id].calculatedDistance = currentVertex.calculatedDistance + distanceToCurrentVertex;
                vertexData.vertices[id].previousVertexId = currentVertex.id;
            }
        }
        );

        vertexData.vertices[currentVertex.id].visited = true;
        vertexData.updateVisitedCounter();
    }
}

function groupData(inputData) {
    var result = {};

    inputData.forEach(item => {
        !result[item.StartVertex] && (result[item.StartVertex] = {});
        result[item.StartVertex][item.AdjacentVertex] = parseInt(item.Distance)
    })

    return result;
}

function createOutput() {
    var jsonOutput = objectToArray(vertexData.vertices).map(item => {
        return {
            StartVertex: item.id,
            PreviousVertex: item.previousVertexId,
            ShortestDistance: item.calculatedDistance
        }
    });
    converter.json2csv(jsonOutput, (err, csv) => {
        if (err) {
            throw err;
        }

        fs.writeFileSync('output.csv', csv);
    });
}

function executeAlgorithm(startVertexId) {
    const csvFilePath = __dirname + '/input.csv';
    csv()
        .fromFile(csvFilePath)
        .then((jsonObj) => {
            var jsonInput = groupData(jsonObj);

            anylizeData(jsonInput, startVertexId);
            createOutput();
        })
}

executeAlgorithm("a");
