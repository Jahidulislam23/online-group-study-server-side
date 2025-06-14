const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
require("dotenv").config();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
  console.log("inside the logger middleware");
  next();
};
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log("cookies in the middleware", token);
  if (!token) {
    return res.this.status(401).send({ message: "unauthorized access" });
  }
  // verify
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgx1gaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const assignmentUserCollection = client
      .db("assignmentDB")
      .collection("users");
    const assignmentCollection = client
      .db("assignmentDB")
      .collection("assignment");
    const assignmentModal = client
      .db("assignmentDB")
      .collection("assignmentModal");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // jwt token related api

    app.post("/jwt", async (req, res) => {
      const userData = req.body;
      const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1h",
      });
      // set the token
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });
      res.send({ token });
    });

    // modal er kaj
    app.get("/assignmentModal", async (req, res) => {
      const result = await assignmentModal.find().toArray();
      res.send(result);
    });

    app.post("/assignmentModal", verifyToken, async (req, res) => {
      const newAssignment = req.body;
      console.log(newAssignment, "newAssignment");
      const result = await assignmentModal.insertOne(newAssignment);
      res.send(result);
    });

//     app.get('/assignmentModal', verifyToken, async (req, res) => {
//   const userEmail = req.user.email;
//   const pending = await assignmentModal.find({
//     status: "pending",
//     examineeEmail: { $ne: userEmail }
//   });
//   res.send(pending);
// });

// app.post('/assignmentModal/:id', verifyToken, async (req, res) => {
//   const { marksGiven, feedback } = req.body;
//   const evaluatedBy = req.user.email;

//   const result = await assignmentModal.updateOne(
//     { _id: req.params.id },
//     {
//       $set: {
//         marksGiven,
//         feedback,
//         evaluatedBy,
//         status: "completed"
//       }
//     }
//   );

//   res.send(result);
// });

    // my assignment ar kaj
    app.get("/assignments/:email", verifyToken, async (req, res) => {
      console.log(req.params.email);
      const email = req.params.email;
      const query = { email };
      console.log(query);
      const result = await assignmentCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/homeAssignment", async (req, res) => {
      const result = await assignmentCollection.find().limit(6).toArray();
      res.send(result);
    });

    //  assignment er delete er kaj
    app.delete("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });

    //  assignment ar edit korar kaj
    app.put("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateAss = req.body;
      const options = { upsert: true };
      const updateDoct = {
        $set: updateAss,
      };
      const result = await assignmentCollection.updateOne(
        filter,
        updateDoct,
        options
      );
      res.send(result);
    });
    // viewDetailsAssignmentPage kico jak add kora
    app.put("/viewAssignmentViewDetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateAssignment = req.body;
      const options = { upsert: true };
      const updateDoct = {
        $set: updateAssignment,
      };
      const result = await assignmentCollection.updateOne(
        filter,
        updateDoct,
        options
      );
      res.send(result);
    });

    // app.get("/assignment", logger, verifyToken, async (req, res) => {
    //   // const email =req.query.email

    //   // console.log('inside application cookie',req.cookies);

    //   // if(email !==req.decoded.email){
    //   //   return res.status(403).send({message:'forbidden access'})
    //   // }
    //   // console.log(email)

    //   // const query ={
    //   //     applicant:email
    //   // }
    //   const result = await assignmentCollection.find().toArray();
    //   res.send(result);
    // });

    //  all assignment ar kaj
    app.get("/assignment", async (req, res) => {
      let query = {}
      if(req.query.filterType){
      query = {careLevel: req.query.filterType}
      }
      console.log(query)
      const result = await assignmentCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/assignment", verifyToken, async (req, res) => {
      const newTree = req.body;
      console.log(newTree, "newTree");
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
      const result = await assignmentUserCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("simple crud server running ");
});

app.listen(port, () => {
  console.log(`simple crud server running on ,${port}`);
});
