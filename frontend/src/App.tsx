import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { CiHeart } from "react-icons/ci";

interface Data {
  title: string;
  path: string;
  liked_count: number;
  published_at: string;
}

function App() {
  const [articles, setArticles] = useState<Data[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [likeSum, setLikeSum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const itemsPerPage = 20;
  const totalPages = Math.ceil(count / itemsPerPage);

  useEffect(() => {
    axios
      .get(backendURL, { params: { page: currentPage, limit: itemsPerPage } })
      .then((res) => {
        setArticles(res.data.articles);
        setCount(res.data.articles.length);
        const totalLikes = res.data.articles.reduce(
          (sum: number, article: Data) => sum + article.liked_count,
          0
        );
        setLikeSum(totalLikes);
        setIsLoading(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return !isLoading ? (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
      <ClipLoader size={100} />
    </div>
  ) : (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {" "}
        記事一覧 ({count}記事 / いいね合計 {likeSum})
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-left">
                No.
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                タイトル
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                <CiHeart />
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-blue-600"
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
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            前
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? "bg-blue-500 text-white" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            次
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
