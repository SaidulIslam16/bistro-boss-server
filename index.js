const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ======= MongoDB =========//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hla3ttg.mongodb.net/?retryWrites=true&w=majority`;

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

        const usersCollection = client.db("bistroDB").collection("users");
        const menuCollection = client.db("bistroDB").collection("menu");
        const reviewsCollection = client.db("bistroDB").collection("reviews");
        const cartCollection = client.db("bistroDB").collection("cart");

        // user related API
        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const result = await usersCollection.insertOne(userInfo);
            res.send(result);
        })

        // menu API
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })

        // reviews API
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // cart collection APIs

        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([]);
            }
            else {
                const query = { email: email };
                const result = await cartCollection.find(query).toArray();
                res.send(result);
            }
        })

        app.post('/cart', async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item);
            res.send(result)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Bistro Boss server Running');
})

app.listen(port, () => {
    console.log("Server Running on Port", port);
})