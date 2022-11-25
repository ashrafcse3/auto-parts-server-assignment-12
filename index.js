const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 6000;


//middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('resale server is running');
})

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4qifqp4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productsCollection = client.db('resaleProducts').collection('products');
        const categoriesCollection = client.db('resaleProducts').collection('categories');
        const usersCollection = client.db('resaleProducts').collection('users');

        // categories api's 
        app.post('/categories', async (req, res) => {
            const result = await categoriesCollection.insertOne(req.body);
            res.send(result);
        })

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        })

        app.patch('/categories', async (req, res) => {
            const data = req.body;

            const filter = { _id: ObjectId(data._id) };
            const options = { upsert: true };
            const updateCategory = {
                $set: {
                    name: data.name,
                    image: data.image
                }
            };

            const result = await categoriesCollection.updateOne(filter, updateCategory, options);

            res.send(result);
        })

        app.delete('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await categoriesCollection.deleteOne(query);

            res.send(result);
        })

        // products api's 
        app.post('/products', async (req, res) => {
            const result = await productsCollection.insertOne(req.body);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();

            res.send(result);
        })

        //users api's
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);

            res.send(result);
        })

        app.get('/allusers', async (req, res) => {
            const query = { role: 'User' };
            const allusers = await usersCollection.find(query).toArray();

            res.send(allusers);
        })

        app.get('/allsellers', async (req, res) => {
            const query = { role: 'seller' };
            const allsellers = await usersCollection.find(query).toArray();

            res.send(allsellers);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);

            res.send(result);
        })

        // check database for same users for social login
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await usersCollection.findOne(query);

            if (result === null) {
                res.send(false)
            }
            else res.send(true);
        })

    }
    finally { }
}

run().catch(error => console.error(error));


app.listen(port, () => {
    console.log(`resale running on port ${port}`);
})