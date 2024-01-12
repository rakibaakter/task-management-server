const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection

const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bysunmk.mongodb.net/?retryWrites=true&w=majority`;

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
    
    const userCollection = client.db("taskDB").collection("users");
    const taskCollection = client.db("taskDB").collection("tasks");

     // users related api
     app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isUserExist = await userCollection.findOne(query);

      if (isUserExist) {
        return res.send({
          message: `${user.email} already exist in database`,
          insertedId: null,
        });
      }
      // console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    

    // task realted api
    app.get("/tasks", async (req, res) => {
      const email = req.query.email;
      const query = {email : email}
      const cursor = taskCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    
    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = {_id : new ObjectId (id)}
      // const cursor = taskCollection.findOne(query);
      const result = await taskCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          title : updatedTask.title,
          description : updatedTask.description,
          deadline : updatedTask.deadline,
          priority : updatedTask.priority
        },
      };
      const result = await taskCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("todooooo now...");
  });
  
  app.listen(port, () => {
    console.log(`${port} is booked for doing now`);
  });