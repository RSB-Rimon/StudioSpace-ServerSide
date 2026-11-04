import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studiospase");
const addDataCollection = db.collection("addnewstudio");




// mongoDbname: studiospase
// verify middleware function to check for authorization header

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Unauthorized access",
      });
    }

    const token = authHeader.split(" ")[1];

    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
    );

    const { payload } = await jwtVerify(token, JWKS);

    console.log("Verified Payload:", payload);

    req.user = payload;

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return res.status(401).send({
      message: "Unauthorized access",
    });
  }
};




app.get("/", (req, res) => {
  res.send("Hello World!");
});

// post operation
// api url http://localhost:5000/add-studios
app.post("/add-studios", verifyToken, async (req, res) => {
  const data = req.body; 
  const result = await addDataCollection.insertOne(data);
  console.log(result);
  res.send(result);
});

// get explore studios
// url : http://localhost:5000/exploreStudios
app.get("/exploreStudios", async (req, res) => {
  const result = await addDataCollection.find().toArray();
  res.send(result);
});


// details pages api toiri


app.get('/studios/:id', verifyToken, async (req,res)=>{
  const {id} = req.params
  const result = await  addDataCollection.findOne({_id: new ObjectId(id)})
  
  res.send(result)  

});

// update datar jonno api

app.patch('/studios/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await addDataCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  res.send(result);
});

// delete operation
// url : http://localhost:5000/studios/:id
app.delete('/studios/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await addDataCollection.deleteOne({ _id: new ObjectId(id) });

  res.json(result);
}); 


app.post("/booking", verifyToken, async (req, res) => {
  try {
    const bookingData = req.body;
    const bookingCollection = db.collection("bookings");

    // Check if studio is already booked
    const existingBooking = await bookingCollection.findOne({
      studioId: bookingData.studioId,
    });

    if (existingBooking) {
      return res.status(409).send({
        message: "This studio is already booked!",
      });
    }

    // Insert new booking
    const result = await bookingCollection.insertOne(bookingData);

    res.status(201).send({
      acknowledged: true,
      insertedId: result.insertedId,
      message: "Booking successful!",
    });

  } catch (error) {
    console.error("Booking Error:", error);

    res.status(500).send({
      message: "Failed to create booking",
    });
  }
});


app.get("/my-bookings", verifyToken, async (req, res) => {
  const email = req.query.email;

  const bookingCollection = db.collection("bookings");

  const result = await bookingCollection
    .find({ customerEmail: email })
    .toArray();

  res.send(result);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
