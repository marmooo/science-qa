import { assert, assertEquals } from "jsr:@std/assert";
import { TextLineStream } from "jsr:@std/streams";

Deno.test("解答と選択肢の重複", async () => {
  const filePaths = [
    "src/data/中1.csv",
    "src/data/中2.csv",
    "src/data/中3.csv",
  ];
  for (let i = 0; i < filePaths.length; i++) {
    const file = await Deno.open(filePaths[i]);
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lineStream) {
      const arr = line.split(",");
      const answer = arr[0];
      const choices = arr[3].split(" ");
      assert(!choices.includes(answer), line);
    }
  }
});
Deno.test("選択肢の数", async () => {
  const filePaths = [
    "src/data/中1.csv",
    "src/data/中2.csv",
    "src/data/中3.csv",
  ];
  for (let i = 0; i < filePaths.length; i++) {
    const file = await Deno.open(filePaths[i]);
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lineStream) {
      const arr = line.split(",");
      const choices = arr[3].split(" ");
      assertEquals(new Set(choices).size, 10, line);
      assertEquals(choices.length, 10, line);
    }
  }
});
Deno.test("解答と問題文の重複", async () => {
  const filePaths = [
    "src/data/中1.csv",
    "src/data/中2.csv",
    "src/data/中3.csv",
  ];
  for (let i = 0; i < filePaths.length; i++) {
    const file = await Deno.open(filePaths[i]);
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lineStream) {
      const arr = line.split(",");
      const answer = arr[0];
      const sentence = arr[2];
      assert(!sentence.includes(answer), line);
    }
  }
});
Deno.test("カテゴリ・中1", async () => {
  const categories = [
    "植物",
    "物質",
    "音・光・力",
    "鉱物",
    "地震・地層",
    "火山",
  ];
  const file = await Deno.open("src/data/中1.csv");
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const arr = line.split(",");
    const categoryRange = arr[1];
    categoryRange.split(/[〜｜]/).forEach((category) => {
      assert(categories.includes(category), line);
    });
  }
});
Deno.test("カテゴリ・中2", async () => {
  const categories = [
    "物質の分解",
    "原子と分子",
    "化学変化",
    "生物",
    "人体",
    "電流",
    "気象",
  ];
  const file = await Deno.open("src/data/中2.csv");
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const arr = line.split(",");
    const categoryRange = arr[1];
    categoryRange.split(/[〜｜]/).forEach((category) => {
      assert(categories.includes(category), line);
    });
  }
});
Deno.test("カテゴリ・中3", async () => {
  const categories = [
    "イオン",
    "生物",
    "運動とエネルギー",
    "地球",
    "宇宙",
    "自然と科学技術",
  ];
  const file = await Deno.open("src/data/中3.csv");
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const arr = line.split(",");
    const categoryRange = arr[1];
    categoryRange.split(/[〜｜]/).forEach((category) => {
      assert(categories.includes(category), line);
    });
  }
});
