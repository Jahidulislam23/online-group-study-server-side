const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT ||3000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json())

// pass: Ne1V8tK93b8BOK2N
// nam:category_DBUser




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgx1gaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const assignmentUserCollection = client.db("assignmentDB").collection("users");
    const assignmentCollection = client.db("assignmentDB").collection("assignment");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    // my assignment ar kaj
    app.get("/assignments/:email", async (req, res) => {
      console.log(req.params.email);
      const email = req.params.email;
      const query = { email };
      console.log(query);
      const result = await assignmentCollection.findOne(query).toArray();
      res.send(result);
    });

    // app.get("/homeAssignment", async (req, res) => {
    //   const result = await assignmentCollection.find().limit(6).toArray()
    //   res.send(result);
    // });

    //  assignment er delete er kaj
    app.delete('/assignment/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result= await assignmentCollection.deleteOne(query)
        res.send(result)
    })

    //  assignment ar edit korar kaj
    app.put('/assignment/:id',async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updateAss = req.body;
        const options = {upsert: true}
        const updateDoct ={
            $set:updateAss
        }
        const result = await assignmentCollection.updateOne(filter,updateDoct,options)
        res.send(result)
    })
    // viewDetailsAssignmentPage kico jak add kora
    app.put('/viewAssignmentViewDetails/:id',async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updateAssignment = req.body;
        const options = {upsert: true}
        const updateDoct ={
            $set:updateAssignment
        }
        const result = await assignmentCollection.updateOne(filter,updateDoct,options)
        res.send(result)
    })

    app.get('/assignment',async(req,res)=>{
        const result = await assignmentCollection.find().toArray()
        res.send(result)
    })


    // all assignment ar sort korar kaj baki ase

    // app.get('/assignment',async(req,res)=>{
    //     const result = await assignmentCollection.find().sort({startDate:1}).toArray();
    //     res.send(result)
    // })

    //  all assignment ar kaj
    app.get("/assignment", async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result);
    });

    app.post("/assignment", async (req, res) => {
      const newTree = req.body;
      console.log(newTree,"newTree");
      const result = await assignmentCollection.insertOne(newTree);
      res.send(result);
    });

    // update data
    app.get("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });



    // register and login er kaj
    app.get("/users", async (req, res) => {
      const result = await assignmentUserCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile);
      const result = await assignmentUserCollection.insertOne(userProfile);
      res.send(result);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentUserCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/users", async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await assignmentUserCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('simple crud server running')
});

app.listen(port,()=>{
    console.log(`simple crud server running on ,${port}`)
})