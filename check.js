const filenames = ["中1", "中2", "中3"];
for (let i = 0; i < filenames.length; i++) {
  const dict = {};
  const csv = Deno.readTextFileSync(`src/data/${filenames[i]}.csv`);
  csv.trimEnd().split("\n").forEach((line) => {
    const category = line.split(",")[1];
    if (dict[category]) {
      dict[category] += 1;
    } else {
      dict[category] = 1;
    }
  });
  console.log(dict);
}
