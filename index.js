
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));

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

// Verify middleware function to check authorization header
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

// Home route
app.get("/", (req, res) => {
  res.send("Hello World!");
});


// ADD STUDIO


// API URL: http://localhost:5000/add-studios
app.post("/add-studios", verifyToken, async (req, res) => {
  try {
    const data = {
      ...req.body,

      // UPDATED: Login করা Owner-এর Email Save করা হচ্ছে
      ownerEmail: req.user.email,
    };

    const result = await addDataCollection.insertOne(data);

    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to add studio",
    });
  }
});


// EXPLORE STUDIOS


app.get("/exploreStudios", async (req, res) => {
  const result = await addDataCollection.find().toArray();
  res.send(result);
});

// NEW: MY STUDIO LISTINGS


// NEW: শুধু Login করা Owner-এর Studio দেখাবে
// API URL: http://localhost:5000/my-studios
app.get("/my-studios", verifyToken, async (req, res) => {
  try {
    const result = await addDataCollection
      .find({
        ownerEmail: req.user.email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to get my studios",
    });
  }
});


// STUDIO DETAILS


app.get("/studios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await addDataCollection.findOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

// UPDATE STUDIO


app.patch("/studios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  // UPDATED: Owner Email দিয়ে Ownership Verify করা হচ্ছে
  const result = await addDataCollection.updateOne(
    {
      _id: new ObjectId(id),
      ownerEmail: req.user.email, // UPDATED
    },
    {
      $set: req.body,
    }
  );

  // NEW: অন্য Owner-এর Studio Edit করতে পারবে না
  if (result.matchedCount === 0) {
    return res.status(403).send({
      message: "You cannot edit this studio",
    });
  }

  res.send(result);
});

// DELETE STUDIO


// API URL: http://localhost:5000/studios/:id
app.delete("/studios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  // UPDATED: শুধু নিজের Studio Delete করতে পারবে
  const result = await addDataCollection.deleteOne({
    _id: new ObjectId(id),
    ownerEmail: req.user.email, // UPDATED
  });

  // NEW: অন্য Owner-এর Studio Delete করতে পারবে না
  if (result.deletedCount === 0) {
    return res.status(403).send({
      message: "You cannot delete this studio",
    });
  }

  res.send(result);
});


// BOOKING

app.post("/booking", verifyToken, async (req, res) => {
  try {
    const bookingData = req.body;
    const bookingCollection = db.collection("bookings");

    const existingBooking = await bookingCollection.findOne({
      studioId: bookingData.studioId,
    });

    if (existingBooking) {
      return res.status(409).send({
        message: "This studio is already booked!",
      });
    }

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


// MY BOOKINGS


app.get("/my-bookings", verifyToken, async (req, res) => {
  // UPDATED: Query Email-এর পরিবর্তে Verified Token-এর Email ব্যবহার
  const email = req.user.email;

  const bookingCollection = db.collection("bookings");

  const result = await bookingCollection
    .find({
      customerEmail: email,
    })
    .toArray();

  res.send(result);
});


// SERVER


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
