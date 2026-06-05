const fs = require('fs');
const path = require('path');
const https = require('https');

const screens = [
  {
    id: "a8667edc29b74066960b94ec19ccef1e",
    name: "dashboard_desktop",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFlZDFkMDQwOTU1MTQ2OTVhODU1NjE3MDY2NTVkY2Q5EgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "e290521d3c404b89829a1849e88170c6",
    name: "about_grading_desktop",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FjMzFiMDgwMTI1NzRhYWNiNTU3Yjc5NDVjZDUxNDk0EgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "fea376d931844baa987fd1ae7e33d0fb",
    name: "cgpa_performance_desktop",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdiN2E0YWI4MWFkNzRhYTNhODMwYTMxOGM3YmNhMjllEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "b7cb00bbadbf4e93ad233ee27df277a6",
    name: "create_semester_desktop",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY4OWI5NDg2ODRkNjQxODRiM2Q3ZDFmYjViMTBiZjRlEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "c0ee01b9dd6a4802808beaee589b3d55",
    name: "dashboard_mobile",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2VkMzQ1ZDA4NzYxMTRmZmI4NzRmMmZkNjViNjU5NTYzEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "2c8c808c7ac148f38f483db5f55e6988",
    name: "grade_predictor_desktop",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ3MjU5OWQ0OWViYzRlYjE5NWJiODJiZDFlMGZkNWJkEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=96797242"
  },
  {
    id: "37579d9994e1441d8cb7390a1af2f757",
    name: "untitled_mobile_37579",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2YzYzdlNzkyODgyODRkMTdiMDFkYTM4NDlmZDg3MzdhEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  },
  {
    id: "a5f18ab05b5c47a5bf8502b57e8e4418",
    name: "untitled_mobile_a5f18",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc5MWUwYjg3MGU2OTRlNWNiMWJmODcxZDUzYjc1YzZiEgsSBxDXsL-N6QYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzMzE5MTA3ODk0ODA1NTcyMw&filename=&opi=89354086"
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const s of screens) {
    const dest = path.join(__dirname, `${s.name}.html`);
    console.log(`Downloading ${s.name} from ${s.url}...`);
    try {
      await download(s.url, dest);
      console.log(`Saved ${s.name}.html`);
    } catch (e) {
      console.error(`Error downloading ${s.name}:`, e.message);
    }
  }
  console.log('All downloads completed.');
}

main();
