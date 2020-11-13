const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const express = require('express');
const cors = require('cors');

// [START init_algolia]
// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install

// App ID and API Key are stored in functions config variables

const app = express();
app.use(cors({ origin: true }));

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;


// console.log(ALGOLIA_ID);
// console.log(ALGOLIA_ADMIN_KEY);
// console.log(ALGOLIA_SEARCH_KEY);

const ALGOLIA_PROJ_INDEX_NAME = 'Projects';
const ALGOLIA_PART_INDEX_NAME = 'Components';
const ALGOLIA_RES_INDEX_NAME = 'Resource';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
//const searchClient = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);
//Create
exports.onProjectCreated = functions.firestore.document('Projects/{projId}').onCreate((snap, context)=>{
    const proj = snap.data();

    proj.objectID = context.params.projId;

    console.log("NEW PROJECT");

    const index = client.initIndex(ALGOLIA_PROJ_INDEX_NAME);
    return index.saveObject(proj);
});

exports.onPartCreated = functions.firestore.document('Components/{partId}').onCreate((snap, context)=>{
    const part = snap.data();

    part.objectID = context.params.partId;

    console.log("NEW PART");

    const index = client.initIndex(ALGOLIA_PART_INDEX_NAME);
    return index.saveObject(part);
});

exports.onResourceCreated = functions.firestore.document('Resource/{resId}').onCreate((snap, context)=>{
    const res = snap.data();

    res.objectID = context.params.resId;

    console.log("NEW RESOURCE");

    const index = client.initIndex(ALGOLIA_RES_INDEX_NAME);
    return index.saveObject(res);
});
//Delete
exports.onProjectDeleted = functions.firestore.document('Projects/{projId}').onDelete((snap, context)=>{
    const proj = snap.data();

    proj.objectID = context.params.projId;

    console.log("DELETE PROJECT");

    const index = client.initIndex(ALGOLIA_PROJ_INDEX_NAME);
    return index.deleteObject(proj.objectID);
});

exports.onPartDeleted = functions.firestore.document('Components/{partId}').onDelete((snap, context)=>{
    const part = snap.data();

    part.objectID = context.params.partId;

    console.log("DELETE PART");

    const index = client.initIndex(ALGOLIA_PART_INDEX_NAME);
    return index.saveObject(part.objectID);
});

exports.onResourceDeleted = functions.firestore.document('Resource/{resId}').onDelete((snap, context)=>{
    const res = snap.data();

    res.objectID = context.params.resId;

    console.log("DELETE RESOURCE");

    const index = client.initIndex(ALGOLIA_RES_INDEX_NAME);
    return index.deleteObject(res.objectID);
});
//Update functions
exports.onProjectUpdated = functions.firestore.document('Projects/{projId}').onUpdate((snap, context)=>{
    const proj = snap.after.data();

    proj.objectID = context.params.projId;

    console.log("UPDATE PROJECT");

    const index = client.initIndex(ALGOLIA_PROJ_INDEX_NAME);
    return index.saveObject(proj);
});

exports.onPartUpdated = functions.firestore.document('Components/{partId}').onUpdate((snap, context)=>{
    const part = snap.after.data();

    part.objectID = context.params.partId;

    console.log("UPDATE PART");

    const index = client.initIndex(ALGOLIA_PART_INDEX_NAME);
    return index.saveObject(part);
});

exports.onResourceUpdated = functions.firestore.document('Resource/{resId}').onUpdate((snap, context)=>{
    const res = snap.after.data();

    res.objectID = context.params.resId;

    console.log("UPDATE RESOURCE");

    const index = client.initIndex(ALGOLIA_RES_INDEX_NAME);
    return index.saveObject(res);
});
//projects
app.get("/projSearch/:text", (req, res)=>{
    let index = client.initIndex(ALGOLIA_PROJ_INDEX_NAME);

    index.search(req.params.text).then(({hits})=>{
        res.send(hits);
    });
});

app.get("/projSearch/", (req, res)=>{
    let index = client.initIndex(ALGOLIA_PROJ_INDEX_NAME);

    index.search('').then(({hits})=>{
        res.send(hits);
    });
});
//parts
app.get("/partSearch/:text", (req, res)=>{
    let index = client.initIndex(ALGOLIA_PART_INDEX_NAME);

    index.search(req.params.text).then(({hits})=>{
        res.send(hits);
    });
});

app.get("/partSearch/", (req, res)=>{
    let index = client.initIndex(ALGOLIA_PART_INDEX_NAME);

    index.search('').then(({hits})=>{
        res.send(hits);
    });
});
//resources
app.get("/resSearch/:text", (req, res)=>{
    let index = client.initIndex(ALGOLIA_RES_INDEX_NAME);

    index.search(req.params.text).then(({hits})=>{
        res.send(hits);
    });
});

app.get("/resSearch/", (req, res)=>{
    let index = client.initIndex(ALGOLIA_RES_INDEX_NAME);

    index.search('').then(({hits})=>{
        res.send(hits);
    });
});


exports.api = functions.https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
