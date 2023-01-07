import { Router } from "express";

import { Otakudesu, Resolusi } from "../crawler/otakudesu";

const router = Router();

router.get("/", async (req, res) => {
  const otakudesu = new Otakudesu();

  const home = await otakudesu.home();

  res.status(home.status).json(home.result);
});

router.get("/anime/:id", async (req, res) => {
  const id = req.params.id;
  const otakudesu = new Otakudesu();

  const anime = await otakudesu.anime(id);

  res.status(anime.status).json(anime.result);
});

router.get("/episode/:id", async (req, res) => {
  const id = req.params.id;
  const resolusi = <Resolusi>req.query.res || "all";

  const otakudesu = new Otakudesu();

  const episode = await otakudesu.episode(id, resolusi);

  res.status(episode.status).json(episode);
});

export default router;
