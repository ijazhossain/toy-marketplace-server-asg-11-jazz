const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

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
        // Get all images from DB
        app.get('/images', async (req, res) => {
            const options = {
                projection: { imageUrl: 1 },
            };
            const result = await toysCollection.find({}, options).sort({ imageUrl: 1 }).toArray()
            res.send(result)
        })

        // Get data from DB by subcategory name
        app.get('/category/:categoryName', async (req, res) => {
            const categoryName = req.params.categoryName;
            console.log(categoryName);
            const query = { category: categoryName }
            if (categoryName === 'teddy bear' ||
                categoryName === 'bird' ||
                categoryName === 'dragon' ||
                categoryName === 'fish' ||
                categoryName === 'animal') {
                const result = await toysCollection.find(query).limit(6).toArray();
                res.send(result)
            } else {
                const result = await toysCollection.find({}).limit(6).toArray();
                res.send(result)
            }
        })

        // Get Data from DB sort by price ascending
        app.get('/myDescendingToy', async (req, res) => {
            console.log(req.query.email);

            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email };
            }
            const result = await toysCollection.find(query).sort({ price: -1 }).toArray()
            res.send(result)
        })

        // Get Data from DB sort by price ascending
        app.get('/myAscendingToy', async (req, res) => {
            console.log(req.query.email);

            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email };
            }
            const result = await toysCollection.find(query).sort({ price: 1 }).toArray()
            res.send(result)
        })

        // Delete data from DB
        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })

        // Update toy data to DB
        app.patch('/updateToy/:toyId', async (req, res) => {
            const toyId = req.params.toyId;
            // console.log(toyId);
            const filter = { _id: new ObjectId(toyId) }
            const updatedToy = req.body;
            // console.log(updatedToy);
            const updatedInfo = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description
                }
            }
            const result = await toysCollection.updateOne(filter, updatedInfo)
            res.send(result)
        })

        // Get or read toy data by user email
        app.get('/myToy', async (req, res) => {
            // console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email };
            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })

        // Get or read toy by id
        app.get('/toy/:toyId', async (req, res) => {
            const toyId = req.params.toyId;
            // console.log(toyId);
            const query = { _id: new ObjectId(toyId) };
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        // Get or read toy by toyName
        app.get('/getToysByName/:name', async (req, res) => {
            const name = req.params.name;
            // console.log(name);
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
            // console.log(newToy);
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