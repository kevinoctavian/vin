import { Router } from "express";
import Otakudesu from "./router/otakudesu";

const route = Router();

route.use("/otakudesu", Otakudesu);

export default route;
