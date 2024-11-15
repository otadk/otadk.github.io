import { createServer } from "node:http";
import { parse as parseUrl } from "node:url";
import { parse as parseQuery } from "node:querystring";
import router from "./router.js";

const hostname = "127.0.0.1";
const port = 6886;
const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Content-Type", "text/plain");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, x-csrf-token"
  );
  response.setHeader("Access-Control-Allow-Origin", request.headers.origin);
  response.setHeader("Access-Control-Allow-Methods", "*");
  const url = parseUrl(request.url).pathname;
  let post = "";
  request.on("data", (chunk) => {
    post += chunk;
  });
  request.on("end", () => {
    response.end(router(url, parseQuery(post)));
  });
});

server.listen(port, hostname, () => {
  console.log(`serviceUrl替换为 http://${hostname}:${port}`);
});




// const useHeap = (): { toArray: () => number[], push: (value: number) => void, pop: () => number | null } => { const innerArray: number[] = []; const popGetChildIndex = (parentIndex: number): number => { const leftChildIndex = parentIndex * 2 + 1; const rightChildIndex = parentIndex * 2 + 2; if (leftChildIndex >= innerArray.length) { return -1; } if (rightChildIndex >= innerArray.length) { return leftChildIndex; } return innerArray[leftChildIndex] < innerArray[rightChildIndex] ? rightChildIndex : leftChildIndex; }; return { toArray: (): number[] => innerArray, push: (value: number): void => { innerArray.push(value); let currentIndex = innerArray.length - 1; let parentIndex = Math.floor((currentIndex - 1) / 2); while (innerArray[parentIndex] < innerArray[currentIndex]) { const temp = innerArray[parentIndex]; innerArray[parentIndex] = innerArray[currentIndex]; innerArray[currentIndex] = temp; currentIndex = parentIndex; parentIndex = Math.floor((currentIndex - 1) / 2); } }, pop: (): number | null => { if (innerArray.length === 0) { return null; } const root = innerArray[0]; innerArray[0] = innerArray[innerArray.length - 1]; innerArray.pop(); let parentIndex = 0; let currentIndex = popGetChildIndex(parentIndex); while (innerArray[parentIndex] < innerArray[currentIndex]) { const temp = innerArray[parentIndex]; innerArray[parentIndex] = innerArray[currentIndex]; innerArray[currentIndex] = temp; parentIndex = currentIndex; currentIndex = popGetChildIndex(parentIndex); } return root; } }; };

const useHeap = (): ({ toArray: () => number[], push: (value: number) => void, pop: () => number | null }) => {
    const innerArray: number[] = [];
    const popGetChildIndex = (parentIndex: number): number => {
      const leftChildIndex = parentIndex * 2 + 1;
      const rightChildIndex = parentIndex * 2 + 2;
      if (leftChildIndex >= innerArray.length) {
        return -1;
      }
      if (rightChildIndex >= innerArray.length) {
        return leftChildIndex;
      }
      return innerArray[leftChildIndex] < innerArray[rightChildIndex] ? rightChildIndex : leftChildIndex;
    };
    return {
      toArray: (): number[] => innerArray,
      push: (value: number): void => {
        innerArray.push(value);
        let currentIndex = innerArray.length - 1;
        let parentIndex = Math.floor((currentIndex - 1) / 2);
        while (innerArray[parentIndex] < innerArray[currentIndex]) {
          const temp = innerArray[parentIndex];
          innerArray[parentIndex] = innerArray[currentIndex];
          innerArray[currentIndex] = temp;
          currentIndex = parentIndex;
          parentIndex = Math.floor((currentIndex - 1) / 2);
        }
      },
      pop: (): number | null => {
        if (innerArray.length === 0) {
          return null;
        }
        const root = innerArray[0];
        innerArray[0] = innerArray[innerArray.length - 1];
        innerArray.pop();
        let parentIndex = 0;
        let currentIndex = popGetChildIndex(parentIndex);
        while (innerArray[parentIndex] < innerArray[currentIndex]) {
          const temp = innerArray[parentIndex];
          innerArray[parentIndex] = innerArray[currentIndex];
          innerArray[currentIndex] = temp;
          parentIndex = currentIndex;
          currentIndex = popGetChildIndex(parentIndex);
        }
        return root;
      }
    };
  };
  
