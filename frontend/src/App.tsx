import { useEffect, useState } from "react";
import axios from "axios";

interface Data {
  title: string;
  path: string;
  liked_count: number
  published_at: string;
}

function App() {
  const [articles, setArticles] = useState<Data[]>([]);
  const [count, setCount] = useState<number>(0);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios
      .get(backendURL)
      .then((res) => {
        setArticles(res.data.articles);
        setCount(res.data.articles.length);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">記事一覧 ({count}記事)</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                No.
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                タイトル
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                いいね数
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                公開日
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href={`https://zenn.dev/${article.path}`}
                    className="text-black hover:underline hover:text-blue-600"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {article.liked_count}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {article.published_at.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
