import { useState } from "react";

export function usePagination(initialLimit = 50) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const goToPage = (pageNum) => setPage(pageNum);
  const resetPage = () => setPage(1);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    resetPage
  };
}