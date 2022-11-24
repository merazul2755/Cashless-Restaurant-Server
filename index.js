const express = require("express");
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${
    process.env.DB_USER
}:${
    process.env.DB_PASSWORD
}@restaurant.ts83rrg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        await client.connect();
        const userCollection = client.db("Restaurant").collection("users");
        const itemsCollection = client.db("Restaurant").collection("items");
        const reservationCollection = client.db("Restaurant").collection("reservations");
        const ordersCollection = client.db("Restaurant").collection("orders");
        const reviewCollection = client.db("Restaurant").collection("reviews");

        // User creation
        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {
                email: email
            };
            const option = {
                upsert: true
            };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        });
        // Get users
        app.get("/user", async (req, res) => {
            const query = {};
            const cursor = await userCollection.find(query).toArray();
            res.send(cursor);
        });

        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // Get the all items
        app.get("/items", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = await itemsCollection.find(query);
            let items;
            if(page || size){
                items = await cursor.skip(page*size).limit(size).toArray();
            }else{
                items = await cursor.toArray();
            }
            
            res.send(items);
        });

        app.get("/itemsCount", async (req, res) => {
            const count = await itemsCollection.estimatedDocumentCount();
            res.send({count});
        });



        // Add items
        app.post("/items", async (req, res) => {
            const items = req.body;
            const result = await itemsCollection.insertOne(items);
            res.send(result);
        });
        
        app.put("/items/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = {
                _id: ObjectId(id)
            };
            const option = {
                upsert: true
            };
            const updateDoc = {
                $set: data
            };
            const result = await itemsCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        });

        // Get the single itme by id
        app.get("/items/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const singleItem = await itemsCollection.findOne(query);
            res.send(singleItem);
        });
        // items delete
        app.delete("/items/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        });

        // Make orders
        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        // MAke Reservation
        app.post("/reservation", async (req, res) => {
            const reservation = req.body;
            const result = await reservationCollection.insertOne(reservation);
            res.send(result);
        });
        app.get("/reservation", async (req, res) => {
            const query = {};
            const result = await reservationCollection.find(query).toArray();
            res.send(result);
        });

        // order get by email
        app.get("/orders", async (req, res) => {
            const email = req.query.email;
            const query = {
                email
            };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });
        // get all orders
        app.get("/allorders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/chef/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const ischef = user.roll === 'chef';
            res.send({chef: ischef});
        })

        // Make user chef
        app.put("/user/chef/:email", async (req, res) => {
            const email = req.params.email;
            const filter = {
                email: email
            };
            const updateDoc = {
                $set: {
                    roll: "chef"
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Set Time
        app.put("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const time= req.body;
            const filter = {
                _id:ObjectId(id)
            };
            const updateDoc = {
                $set: time
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.post("/review", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get("/review", async (req, res) => {
            const query = {}
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        });

    } finally {}
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Welcome To Cashless Restaurant");
});

app.listen(port, () => {
    console.log("listening port", port);
});
