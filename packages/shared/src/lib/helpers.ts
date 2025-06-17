import dotenv from "dotenv";

const config = {
  WIKI_ACCESS_TOKEN: process.env.WIKI_ACCESS_TOKEN,
};

type Article = {
  title: string;
  url: string;
  content: string;
  imageURL?: string;
  source: string;
  time: string;
};

export async function fetchTodayWiki(): Promise<Article[]> {
  dotenv.config();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const day = String(new Date().getDate()).padStart(2, "0");
  const response = await fetch(
    `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`,
    {
      headers: {
        Authorization: `Bearer ${config.WIKI_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: any = await response.json();
  if (!data || !data.mostread || !data.news) {
    throw new Error("Invalid data format received from Wikipedia API");
  }
  return parseTodayWiki(data);
}

function parseTodayWiki(data: any) {
  const threads = data.mostread.articles || [];
  const news = data.news.map((n: any) => n.links).flat() || [];

  const articles = threads.map((article: any) => {
    return {
      title: article.normalizedtitle,
      url: `https://en.wikipedia.org/wiki/${article.title}`,
      content: article.extract,
      imageURL: article.thumbnail?.source,
      source: "Wikipedia",
      time: article.timestamp,
    };
  });

  const newsArticles = news.map((article: any) => {
    return {
      title: article.title,
      url: `https://en.wikipedia.org/wiki/${article.title}`,
      content: article.extract,
      imageURL: article.thumbnail?.source,
      source: "Wikipedia",
      time: article.timestamp,
    };
  });

  const allArticles = [...articles, ...newsArticles];

  return allArticles;
}
