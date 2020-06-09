
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const parse = require('csv-parse/lib/sync')


exports.nuevoArchivo = functions.storage.object().onFinalize(async (object) => {
  console.log(">>>>>>INICIO")
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
  console.log(filePath)
  // [END eventAttributes]
  // [START stopConditions]
  // Exit if this is triggered on a file that is not an image.
  //if (!contentType.startsWith('text/csv')) {
  //  return console.log('Esto no es csv.');
  // }
  // [START thumbnailGeneration]
  // Download file from bucket.
  
  const bucket = admin.storage().bucket(fileBucket);
  const filename = path.basename(object.name);
  console.log(">>>>>> ",  filename)

  bucket.file(filename).download((err, contents) => {
    if (err) {
      console.log('error', err);
      return null;
    }
    console.log(">>>>>> ", contents);
    if (filename === "preguntas.csv") {
      toJSON(contents.toString());
    } else if (filename === "sistemas.csv") {
      ToJSON2(contents.toString());
    }
    return null;
  });
});

function toJSON(content) {
  try {
    const filas = parse(content, {
      columns: false,
      skip_empty_lines: true,
    })
    // Extraccion de datos y
    // Estructurar JSON
    let jsonObject = {}
    for (let i = 0; i < filas.length; i++) {
      const columnas = filas[i];
      if (columnas[0].trim() in jsonObject) {
        // Si es de opcion multiple crear una lista de respuestas, si no, no guardar campo de respuestas
        if (columnas[2].trim() === 'opcion multiple') {
          // Crear nodo de pregunta con lista de respuestas
          let valorRespuestas = columnas[3].trim().split('|');
          let pregunta = {
            pregunta: columnas[1].trim(),
            tipoPregunta: columnas[2].trim(),
            respuestas: valorRespuestas
          };
          // agregar a la lista de preguntas
          jsonObject[columnas[0].trim()].push(pregunta);
        } else {
          // Crear nodo de pregunta sin lista de respuestas
          let pregunta = {
            pregunta: columnas[1].trim(),
            tipoPregunta: columnas[2].trim(),
          };
          // agregar a la lista de preguntas

          jsonObject[columnas[0].trim()].push(pregunta);
        }
      } else {
        // El tema aun no existe, crear nueva lista de preguntas
        jsonObject[columnas[0].trim()] = [];
        // Si es de opcion multiple crear una lista de respuestas, si no, no guardar campo de respuestas
        if (columnas[2].trim() === 'opcion multiple') {
          // Crear nodo de pregunta con lista de respuestas, las respuestas se toman de la columna 4
          let valorRespuestas = columnas[3].trim().split('|');
          let pregunta = {
            pregunta: columnas[1].trim(),
            tipoPregunta: columnas[2].trim(),
            respuestas: valorRespuestas
          };
          // agregar a la lista de preguntas
          jsonObject[columnas[0].trim()].push(pregunta);
        } else {
          // Crear nodo de pregunta sin lista de respuestas
          let pregunta = {
            pregunta: columnas[1].trim(),
            tipoPregunta: columnas[2].trim(),
          };
          // agregar a la lista de preguntas
          jsonObject[columnas[0].trim()].push(pregunta);
        }
      }
    }
    console.log(jsonObject);
    // Guardar en base de datos
    toDB(jsonObject)
  } catch (error) {
    console.log('>>> Error', error)
  }
}

function toDB(jsn) {
  admin.database().ref("plantilla").set(jsn);
}

function ToJSON2(content){
  try {
    const filas = parse(content, {
      columns: false,
      skip_empty_lines: true,
    })
    // Extraccion de datos y
    // Estructurar JSON
    let jsonObject = {}
    for (let i = 0; i < filas.length; i++) {
      const columnas = filas[i];
      if (columnas[0].trim() in jsonObject) {
        //jsonObject[columnas[0].trim()] = [];
      } else {
        jsonObject[columnas[0].trim()] = [];
      }
      if (columnas[0].trim() in jsonObject){
        let municipio = {
          plantel: columnas[1].trim(),
        };
        // agregar a la lista de planteles
        jsonObject[columnas[0].trim()].push(municipio);
      };
    }
    console.log(jsonObject);
    // Guardar en base de datos
    toDB2(jsonObject)
  } catch (error) {
    console.log('>>> Error', error)
  }
}
function toDB2(jsn) {
  admin.database().ref("acceso").set(jsn);
}
