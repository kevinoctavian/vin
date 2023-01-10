"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otakudesu_1 = require("../crawler/otakudesu");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const otakudesu = new otakudesu_1.Otakudesu();
    const home = await otakudesu.home();
    res.status(home.status).json(home.result);
});
router.get("/anime/:id", async (req, res) => {
    const id = req.params.id;
    const otakudesu = new otakudesu_1.Otakudesu();
    const anime = await otakudesu.anime(id);
    res.status(anime.status).json(anime.result);
});
router.get("/episode/:id", async (req, res) => {
    const id = req.params.id;
    const resolusi = req.query.res || "all";
    const otakudesu = new otakudesu_1.Otakudesu();
    const episode = await otakudesu.episode(id, resolusi);
    res.status(episode.status).json(episode);
});
exports.default = router;
