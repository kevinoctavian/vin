"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otakudesu = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const url_1 = require("url");
const zs_extract_1 = require("zs-extract");
class Otakudesu {
    get baseLink() {
        return "https://otakudesu.bid/";
    }
    async home() {
        const { data, status } = await axios_1.default.get(this.baseLink);
        let result = {
            ongoing: [],
            complete: [],
        };
        if (status == 200 && data) {
            const $ = (0, cheerio_1.load)(data);
            const rseries = $("div.rseries").get()[0];
            const res = $(rseries)
                .map((i, el) => {
                return $(el)
                    .find("li")
                    .map((i, el) => {
                    var _a;
                    const e = $(el);
                    return {
                        id: (_a = (0, url_1.parse)(e.find("a").attr("href") || "")
                            .path) === null || _a === void 0 ? void 0 : _a.split("/").at(-2),
                        title: e.find("h2.jdlflm").text(),
                        image: e.find("img").attr("src"),
                        hari: e.find(".epztipe").text(),
                        tanggal: e.find(".newnime").text(),
                        total_episode: e.find(".epz").text(),
                    };
                })
                    .get();
            })
                .get();
            for (let i = 0; i < res.length; i++) {
                if (i < (res.length - 1) / 2) {
                    result.ongoing.push(res[i]);
                }
                else {
                    result.complete.push(res[i]);
                }
            }
        }
        return { status, result };
    }
    async anime(id) {
        const { data, status } = await axios_1.default.get(this.baseLink + "anime/" + id);
        let result = {};
        if (status == 200 && data) {
            const $ = (0, cheerio_1.load)(data);
            const episodeList = $(".episodelist").get()[1];
            const fotoanime = $(".fotoanime");
            result.img = $(fotoanime).find("img").attr("src");
            result.eposides = $(episodeList)
                .find("li")
                .map((i, el) => {
                var _a;
                const e = $(el);
                return {
                    id: (_a = (0, url_1.parse)(e.find("a").attr("href") || "")
                        .path) === null || _a === void 0 ? void 0 : _a.split("/").at(-2),
                    title: e.find("a").text(),
                    tanggal: e.find(".zeebr").text(),
                };
            })
                .get();
            result.info = $(fotoanime)
                .find(".infozin")
                .find("p")
                .map((i, el) => {
                const e = $(el);
                const info = e.text().split(":");
                return {
                    name: info[0],
                    value: info[1].trim(),
                };
            })
                .get();
            result.sinopsi = $(fotoanime)
                .find(".sinopc")
                .find("p")
                .map((i, el) => {
                const e = $(el);
                return e.text();
            })
                .get()
                .join("\n");
        }
        return { status, result };
    }
    async episode(id, resolusi) {
        const { data, status } = await axios_1.default.get(this.baseLink + "episode/" + id);
        let result = [];
        if (status == 200 && data) {
            const $ = (0, cheerio_1.load)(data);
            const downloads = await $(".download")
                .find("li")
                .map((i, el) => {
                const e = $(el);
                if (e.find("strong").text().toLowerCase().match(/mkv/g))
                    return;
                const res = e
                    .find("strong")
                    .text()
                    .toLowerCase()
                    .replace(/mp4/g, "")
                    .trim();
                const url = e
                    .find("a")
                    .filter((i, el) => $(el).text().toLowerCase() === "zippy")
                    .attr("href");
                return {
                    resolusi: res,
                    size: e.find("i").text(),
                    url,
                };
            })
                .get();
            for (const i in downloads) {
                if (resolusi != "all") {
                    if (downloads[i].resolusi !== resolusi)
                        continue;
                }
                const url = downloads[i].url;
                const { data } = await axios_1.default.get(url !== null && url !== void 0 ? url : "");
                const loadZippyshare = (0, cheerio_1.load)(data);
                let zippyUrl = loadZippyshare('meta[property="og:url"]').attr("content");
                if (zippyUrl === null || zippyUrl === void 0 ? void 0 : zippyUrl.startsWith("//"))
                    zippyUrl = "https:" + zippyUrl;
                const dlUrl = (await (0, zs_extract_1.extract)(zippyUrl || "")).download;
                downloads[i].url = dlUrl;
            }
            if (resolusi === "all")
                result = downloads;
            else
                result = downloads.filter((v) => v.resolusi === resolusi);
        }
        return { status, result };
    }
}
exports.Otakudesu = Otakudesu;
