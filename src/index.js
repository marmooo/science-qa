import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
} from "https://cdn.jsdelivr.net/npm/chart.js@4.5.0/+esm";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
);

const charts = {};
let totalTrials = 100;
const categoryToSubject = {
  "植物": "生物",
  "物質": "物理",
  "音・光・力": "物理",
  "地震・地層": "地学",
  "火山": "地学",
  "原子と分子": "物理",
  "化学変化": "化学",
  "生物": "生物",
  "人体": "生物",
  "電流": "物理",
  "気象": "地学",
  "イオン": "化学",
  "運動とエネルギー": "物理",
  "地球": "地学",
  "宇宙": "地学",
  "自然と科学技術": "地学",
};
const subjectIds = [
  "middle1",
  "middle2",
  "middle3",
];
const subjectDict = {
  "物理": 0,
  "化学": 1,
  "生物": 2,
  "地学": 3,
};
const allProblems = [];
let problems = [];
let incorrect = false;
let firstRun = true;
let audioContext;
const audioBufferCache = {};
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("error", "mp3/cat.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
    loadAudio("incorrect", "mp3/incorrect1.mp3");
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  for (let i = array.length; 1 < i; i--) {
    const k = Math.floor(Math.random() * i);
    [array[k], array[i - 1]] = [array[i - 1], array[k]];
  }
  return array;
}

async function fetchProblems() {
  const urls = [
    "data/中1.csv",
    "data/中2.csv",
    "data/中3.csv",
  ];
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  const texts = await Promise.all(responses.map((res) => res.text()));
  texts.forEach((text, i) => {
    const grade = urls[i].slice(5, 7);
    text.trimEnd().split("\n").forEach((line) => {
      const [answer, category, sentence, choicesString] = line.split(
        ",",
      );
      const subject = categoryToSubject[category];
      const choices = choicesString.split(" ");
      const problem = { grade, subject, answer, category, sentence, choices };
      allProblems.push(problem);
    });
  });
  console.log(allProblems);
}

function getQuestionScope() {
  const scope = new Set();
  const form = document.getElementById("questionScope");
  const checkedInputs = form.querySelectorAll(":checked");
  for (const input of checkedInputs) {
    const grade =
      input.parentNode.parentNode.parentNode.firstElementChild.dataset.subject;
    const category = input.parentNode.dataset.category;
    const subject = categoryToSubject[category];
    scope.add(`${grade}:${subject}:${category}`);
  }
  return scope;
}

function initRadarData() {
  const radarCounts = new Array(4);
  const radarScores = new Array(4);
  for (let i = 0; i < 4; i++) {
    radarScores[i] = getRandomInt(0, 100);
  }
  return {
    labels: ["物理", "化学", "生物", "地学"],
    datasets: [{
      label: "平均点",
      data: radarScores,
      counts: radarCounts,
      fill: true,
    }],
  };
}

function initLineData() {
  const results = [];
  const lineScores = [];
  const lineLabels = Array.from({ length: totalTrials }, (_, i) => i + 1);
  for (let i = 0; i < totalTrials; i++) {
    const newResult = Math.random() < 0.5 ? 1 : 0;
    results.push(newResult);
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = (sum / results.length) * 100;
    lineScores.push(avg);
  }
  return {
    labels: lineLabels,
    datasets: [{
      label: "平均点",
      data: lineScores,
      pointRadius: 0,
      pointHoverRadius: 0,
    }],
  };
}

function clearRadarChart() {
  const info = charts.radar.data.datasets[0];
  for (let i = 0; i < info.data.length; i++) {
    info.data[i] = 0;
    info.counts[i] = 0;
  }
}

function clearLineChart() {
  const chart = charts.line;
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
}

function clearBarCharts() {
  for (let i = 0; i < subjectIds.length; i++) {
    const chart = charts[subjectIds[i]];
    const info = chart.data.datasets[0];
    for (let j = 0; j < info.data.length; j++) {
      info.data[j] = 0;
      info.counts[j] = 0;
    }
  }
}

function updateRadarChart(problem, incorrect) {
  const newResult = incorrect ? 0 : 1;
  const info = charts.radar.data.datasets[0];
  const i = subjectDict[problem.subject];
  const correct = info.data[i] * info.counts[i] / 100;
  info.counts[i] += 1;
  info.data[i] = (correct + newResult) / info.counts[i] * 100;
  charts.radar.update();
}

function updateLineChart(incorrect) {
  const newResult = incorrect ? 0 : 1;
  const count = charts.line.data.labels.length + 1;
  const data = charts.line.data.datasets[0].data;
  charts.line.data.labels.push(count);
  if (count === 1) {
    data.push(newResult / count) * 100;
  } else {
    const avg = (data.at(-1) * (count - 1) + newResult) / count;
    data.push(avg);
  }
  charts.line.update();
}

function updateBarCharts(problem, incorrect) {
  const newResult = incorrect ? 0 : 1;
  const subjects = document.querySelectorAll("#questionScope > details");
  const summaries = new Array(subjects.length);
  for (let i = 0; i < subjects.length; i++) {
    summaries[i] = subjects[i].querySelector("summary").dataset.subject;
  }
  const subjectPos = summaries.findIndex((grade) => grade === problem.grade);
  const subjectId = subjectIds[subjectPos];
  const labelNodes = subjects[subjectPos].querySelectorAll("label");
  const labels = new Array(labelNodes.length);
  for (let i = 0; i < labelNodes.length; i++) {
    labels[i] = labelNodes[i].dataset.category;
  }
  const labelPos = labels.findIndex((label) => label === problem.category) - 1;
  const chart = charts[subjectId];
  const info = chart.data.datasets[0];
  const count = info.counts[labelPos] + 1;
  const avg = (info.data[labelPos] * (count - 1) + newResult) / count;
  info.data[labelPos] = avg;
  info.counts[labelPos] += 1;
  chart.update();
}

function updateChart(problem, incorrect) {
  totalTrials += 1;
  updateRadarChart(problem, incorrect);
  updateLineChart(incorrect);
  updateBarCharts(problem, incorrect);
}

function addSolvedProblems(problem) {
  const tbody = document.getElementById("solvedProblems");
  const html =
    `<tr><td>${problem.subject}</td><td>${problem.category}</td><td>${problem.answer}</td><td>${problem.sentence}</td></tr>`;
  tbody.insertAdjacentHTML("beforeend", html);
}

function setProblem() {
  incorrect = false;
  const problem = problems[getRandomInt(0, problems.length)];
  document.getElementById("problem").textContent = problem.sentence;
  const choiceNodes = document.getElementById("choices").querySelectorAll(
    "button",
  );
  const choices = Array.from(choiceNodes);
  shuffle(choices);
  choices[0].textContent = problem.answer;
  choices[0].onclick = () => {
    if (incorrect) addSolvedProblems(problem);
    updateChart(problem, incorrect);
    choices[0].textConent = `⭕ ${choices[0].textContent}`;
    playAudio("correct");
    setProblem();
  };
  if (problem.subject.endsWith("人物")) {
    const sameSubjectProblems = problems.filter((p) =>
      problem.subject === p.subject
    );
    for (let i = 1; i < 4; i++) {
      const index = getRandomInt(0, sameSubjectProblems.length);
      const choice = sameSubjectProblems[index];
      const choiceText = choice.answer;
      choices[i].textContent = choiceText;
      choices[i].onclick = () => {
        incorrect = true;
        choices[i].textContent = `❌ ${choiceText}`;
        playAudio("incorrect");
      };
    }
  } else {
    const numbers = Array.from({ length: problem.choices.length }, (_, i) => i);
    shuffle(numbers);
    for (let i = 0; i < 3; i++) {
      const choiceText = problem.choices[numbers[i]];
      choices[i + 1].textContent = choiceText;
      choices[i + 1].onclick = () => {
        incorrect = true;
        choices[i + 1].textContent = `❌ ${choiceText}`;
        playAudio("incorrect");
      };
    }
  }
}

function setSelectAllEvents() {
  const subjects = document.querySelectorAll("#questionScope > details");
  for (const subject of subjects) {
    const categories = subject.querySelectorAll("div");
    const input = categories[0].querySelector("input");
    input.addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        for (let i = 1; i < categories.length; i++) {
          categories[i].querySelector("input").checked = true;
        }
      } else {
        for (let i = 1; i < categories.length; i++) {
          categories[i].querySelector("input").checked = false;
        }
      }
    });
  }
}

function startGame() {
  if (firstRun) {
    firstRun = false;
    totalTrials = 0;
    clearRadarChart();
    clearLineChart();
    clearBarCharts();
  }
  const scope = getQuestionScope();
  problems = [];
  allProblems.forEach((problem) => {
    if (scope.has(`${problem.grade}:${problem.subject}:${problem.category}`)) {
      problems.push(problem);
    }
  });
  setProblem();
}

function initCharts() {
  initRadarChart();
  initLineChart();
  initBarCharts();
}

function initBarCharts() {
  const forms = document.querySelectorAll("#questionScope > details");
  for (let i = 0; i < forms.length; i++) {
    const labels = Array.from(forms[i].querySelectorAll("label"))
      .slice(1)
      .map((label) => label.textContent.trimEnd());
    const points = new Array(labels.length);
    for (let j = 0; j < labels.length; j++) {
      points[j] = Math.random() * 100;
    }
    const data = {
      labels,
      datasets: [{
        axis: "y",
        label: "平均点",
        data: points,
        counts: new Array(labels.length),
      }],
    };
    initBarChart(subjectIds[i], data);
  }
}

function initRadarChart() {
  const ctx = document.getElementById("radar");
  const chart = new Chart(ctx, {
    type: "radar",
    data: initRadarData(),
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          pointLabels: {
            font: {
              size: 16,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      elements: {
        line: {
          borderWidth: 3,
        },
      },
    },
  });
  charts.radar = chart;
}

function initLineChart() {
  const ctx = document.getElementById("line");
  const chart = new Chart(ctx, {
    type: "line",
    data: initLineData(),
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    },
  });
  charts.line = chart;
}

function initBarChart(id, data) {
  const ctx = document.getElementById(id);
  const chart = new Chart(ctx, {
    type: "bar",
    data,
    options: {
      indexAxis: "y",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    },
  });
  charts[id] = chart;
}

await fetchProblems();
setSelectAllEvents();
initCharts();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = startGame;
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
