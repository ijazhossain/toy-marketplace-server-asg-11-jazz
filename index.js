const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.0nsziui.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        const toysCollection = client.db("toyDB").collection('toys');
        // Get or read toy by name
        app.get('/getToysByName/:name', async (req, res) => {
            const name = req.params.name;
            console.log(name);
            const result = await toysCollection.find({ toyName: { $regex: name, $options: "i" } }).toArray();
            res.send(result)
        })
        // Get or Read data from DB
        app.get('/allToys', async (req, res) => {
            const cursor = toysCollection.find({}).limit(20)
            const result = await cursor.toArray();
            res.send(result)
        })
        // Add or create Data to DB
        app.post('/addToy', async (req, res) => {
            const newToy = req.body;
            console.log(newToy);
            const result = await toysCollection.insertOne(newToy)
            res.send(result)
        })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('TOY STORE SERVER IS RUNNING');
})

app.listen(port, () => {
    console.log(`Toy store server is listening to port ${port}`);
})