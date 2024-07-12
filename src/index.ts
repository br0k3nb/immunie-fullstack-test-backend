import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_URL as string), (err: unknown) => err && console.log(err);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(port, () => {
  if (process.env.NODE_ENV === "development")
    console.log(`Server is running at port ${port}`);
});

export default app;
