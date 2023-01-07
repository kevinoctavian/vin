import Express from "express";
import cors from "cors";

import Api from "./api";

const app = Express();
const port = process.env.PORT || 5050;

app.use(cors());

app.get("/", (_, res) => res.send("tidak ada apa apa disini"));
app.get("/ping", (_, res) => res.status(200).send("pingging"));

app.use("/api", Api);

app.listen(port, () => console.log("Server Run on port " + port));
