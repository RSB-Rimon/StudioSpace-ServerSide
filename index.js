import { MongoClient } from "mongodb";
import "dotenv/config";
import cors from "cors";
import express from "express";
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// post operation
// api url http://localhost:5000/add-studios
app.post("/add-studios", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
