import axios from "axios";
import { load as cheerio, Cheerio, Element } from "cheerio";
import { parse } from "url";
import { extract } from "zs-extract";

export type Resolusi = "360p" | "480p" | "720p" | "all";

export class Otakudesu {
  public get baseLink() {
    return "https://otakudesu.bid/";
  }

  public async home() {
    const { data, status } = await axios.get(this.baseLink);

    let result: any = {
      ongoing: [],
      complete: [],
    };

    if (status == 200 && data) {
      const $ = cheerio(data);
      const rseries = $("div.rseries").get()[0];

      const res = $(rseries)
        .map((i, el) => {
          return $(el)
            .find("li")
            .map((i, el) => {
              const e: Cheerio<Element> = $(el);
              return {
                id: parse(e.find("a").attr("href") || "")
                  .path?.split("/")
                  .at(-2),
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
        } else {
          result.complete.push(res[i]);
        }
      }
    }

    return { status, result };
  }

  public async anime(id: string) {
    const { data, status } = await axios.get(this.baseLink + "anime/" + id);

    let result: any = {};

    if (status == 200 && data) {
      const $ = cheerio(data);
      const episodeList = $(".episodelist").get()[1];
      const fotoanime = $(".fotoanime");

      result.img = $(fotoanime).find("img").attr("src");
      result.eposides = $(episodeList)
        .find("li")
        .map((i, el) => {
          const e: Cheerio<Element> = $(el);
          return {
            id: parse(e.find("a").attr("href") || "")
              .path?.split("/")
              .at(-2),
            title: e.find("a").text(),
            tanggal: e.find(".zeebr").text(),
          };
        })
        .get();
      result.info = $(fotoanime)
        .find(".infozin")
        .find("p")
        .map((i, el) => {
          const e: Cheerio<Element> = $(el);
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
          const e: Cheerio<Element> = $(el);
          return e.text();
        })
        .get()
        .join("\n");
    }

    return { status, result };
  }

  public async episode(id: string, resolusi: Resolusi) {
    const { data, status } = await axios.get(this.baseLink + "episode/" + id);

    let result: any[] = [];

    if (status == 200 && data) {
      const $ = cheerio(data);

      const downloads = await $(".download")
        .find("li")
        .map((i, el) => {
          const e: Cheerio<Element> = $(el);

          if (e.find("strong").text().toLowerCase().match(/mkv/g)) return;

          const res: string = e
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
          if (downloads[i].resolusi !== resolusi) continue;
        }

        const url = downloads[i].url;
        const { data } = await axios.get(url ?? "");
        const loadZippyshare = cheerio(data);
        let zippyUrl = loadZippyshare('meta[property="og:url"]').attr(
          "content",
        );

        if (zippyUrl?.startsWith("//")) zippyUrl = "https:" + zippyUrl;

        const dlUrl = (await extract(zippyUrl || "")).download;

        downloads[i].url = dlUrl;
      }

      if (resolusi === "all") result = downloads;
      else result = downloads.filter((v) => v.resolusi === resolusi);
    }

    return { status, result };
  }
}
