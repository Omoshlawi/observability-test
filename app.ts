/*app.ts*/
import doenv from "dotenv";
doenv.config();
import express, { Request, Express } from "express";
import { rollTheDice } from "./dice";
import morgan from "morgan";
import axios from "axios";
const PORT: number = parseInt(process.env.PORT || "8080");
import opentelemetry from "@opentelemetry/api";

const tracer = opentelemetry.trace.getTracer("observability-service", "1.0.0");

const app: Express = express();
app.use(morgan("tiny"));
app.get("/rolldice", async (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }

  const span = tracer.startSpan("test-span");
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
  span.end();
  try {
    const todod = await axios({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
    });
    console.log(todod.data);
  } catch (error) {
    console.log(error);
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
