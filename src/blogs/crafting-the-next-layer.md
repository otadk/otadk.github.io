# Crafting the Next Layer: Aesthetics, Automation, and AI Integration  
*Phase 3 Blog Notes · Nov 2025*

The past two weeks have remained busy, yet filled with a strong sense of accomplishment. This phase focused mainly on three areas: visual upgrades for my website, algorithm training toward competition preparation, and exploration of automation & backend development. Work has been quite packed, but seeing the results makes me feel like **the future has moved one step forward again**.

## 🏠 1. Home Page & Dream Page: Visual Upgrades and Structural Rebuilding

The core achievement of this phase is the reconstruction of the **Home page** and **Dream page**. With the help of Codex’s AI tool (I spent around $2), I iterated through the design and implementation quickly—turning my old “functional but ugly” pages into cleaner, more elegant, and more user-friendly versions.

**My biggest takeaway:**  
All those UI details that I used to struggle with for hours—AI can generate several clear design directions in minutes, and I just pick and refine. The efficiency boost is insane.

It wasn’t just a visual improvement—my codebase was also completely reshaped:
- Modularized  
- Cleaner logic  
- Reasonable component splitting  
- Noticeably improved loading performance  

**It’s the kind of work that makes you want to pat yourself on the shoulder afterward.**

## 🧠 2. Algorithm Practice: From Sliding Window to Graph Theory, Preparing for Competition

I picked algorithms back up and completed six sections in total:  
**Sliding Window → Binary Search → Monotonic Stack → Grid Graph → Bit Manipulation → Graph Theory**

The reason is simple:  
I registered for the **CCF algorithm competition on December 6th**, which will be held at Shenzhen University. Since it’s an on-site competition, it brings a bit of ceremony and excitement.

Current status:
- Problem solving feels smooth  
- Ideas come more naturally  
- More confident than before  

I’ll continue practicing to keep my rhythm until competition day.

## 🧪 3. Fastify & Backend Exploration: An Unexpected Turn and a Small Experiment

Originally, I thought I would be in charge of developing a backend build tool at work and could officially use **Fastify**. But the task ended up being reassigned to someone else—so for now, I don’t actually need Fastify for work.

Still, I spent some time building a **small demo**:  
(Note: You still need a `.env` file containing the API key and port.)

```json
{
  "name": "fastify-learning",
  "version": "1.0.0",
  "scripts": {
    "d": "ts-node server.ts"
  },
  "author": "otadk",
  "license": "ISC",
  "devDependencies": {
    "ts-node": "^10.9.2"
  },
  "dependencies": {
    "dotenv": "^17.2.3",
    "fastify": "^5.6.1",
    "openai": "^6.7.0"
  }
}
```

``` typescript
import OpenAI from "openai";
import Fastify from 'fastify';
import * as dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "qwen3-coder-plus", // Example model; replace with another if needed.
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { 
        role: "user", 
        content: 
          "Write a Python function find_prime_numbers that accepts an integer n and returns a list of all prime numbers less than n. A prime number is a positive integer that is divisible only by 1 and itself, e.g. 2, 3, 5, 7. Do not output any non-code content or Markdown code blocks."
      }
    ],
  });

  console.log("=".repeat(20) + "Response Content" + "=".repeat(20));
  console.log(completion.choices[0].message.content);

  console.log("=".repeat(20) + "Token Usage" + "=".repeat(20));
  if (completion.usage) {
    console.log(`Input Tokens: ${completion.usage.prompt_tokens}`);
    console.log(`Output Tokens: ${completion.usage.completion_tokens}`);
    console.log(`Total Tokens: ${completion.usage.total_tokens}`);
  }
}


const app = Fastify({ logger: true })

app.get('/', () => {
  return { msg: 'Hello Fastify!', code: 200 }
})

app.get('/add', (request) => {
  const {x, y} = request.query as { x: string, y: string};
  return {result: Number(x) + Number(y), request: request.headers};
})

app.get('/echo', (request) => {
  return request;
})

app.get('/ai', async () => {
  const r = await main();
  return { r }
})

app.listen({ port: Number(process.env.PORT) }, () => {
  console.log(`✅ Server running on http://localhost:${Number(process.env.PORT)}`);
})
```

Used Fastify to simply forward an AI API.  
Although lightweight, it genuinely runs through the entire flow end-to-end, and Fastify will still be my first choice when I build a backend service in the future.

## 🤖 4. Automation Script: Fulfilling a Promise from When I Joined

When I first joined the company, I said I wanted to work on automated testing, but the team never really pursued it.  
However, this week I did help a friend build a very practical automation script:

> Using Playwright to automatically fill medical data on a website,  
> saving them a huge amount of repetitive and meaningless manual work.

Seeing a script save people time and boost efficiency feels incredibly rewarding.  
Unfortunately, due to process changes on their side, this automation is now “no longer needed,” and those data entries will be handwritten moving forward.

It’s a bit bittersweet:  
**Tools that genuinely increase efficiency aren’t always appreciated by every organization.**

## 🧭 5. Plans for the Next Two Weeks: A Pre-New-Year Sprint

I’ve already set my direction for the next two weeks — basically a small sprint before the New Year.

### **1. Continue Algorithm Training**
- Maintain my problem-solving routine  
- Participate in at least one weekly contest (virtual is fine)

### **2. Upload a Component to Universe**
- A component I frequently use at work  
- Plan to create a more generic, elegant version

### **3. Migrate and Showcase the Node Multithreading Project**
This project was originally implemented by me,  
but properly organizing, migrating, and showcasing it will actually be a big task.

### **4. Build a Personal Finance System**
Right now I only track expenses in a document — too primitive.  
I want to build a real, usable system with:

- Cash flow
- Expense categories
- Investment portfolio
- Trend analysis

Something that will help me make better financial decisions in the future.

## ✨ Summary

These two weeks were busy but incredibly fulfilling.  
My website looks better, my codebase is cleaner, the automation script genuinely helped someone, and my algorithm skills have noticeably improved.

Maybe real happiness is simply this:  
**Keep building, keep improving, keep moving forward.**

In the next issue, I hope I’ll have more new outputs to share in the blog.
