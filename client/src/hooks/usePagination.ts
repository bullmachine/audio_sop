import { useState } from 'react';

interface UsePaginationProps {
  defaultPageSize?: number;
}

export const usePagination = ({ defaultPageSize = 10 }: UsePaginationProps = {}) => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchText, setSearchText] = useState("");

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (search: string) => {
    setSearchText(search);
    setPage(1); // Reset to first page when searching
  };

  const resetPagination = () => {
    setPage(1);
    setSearchText("");
  };

  return {
    page,
    setPage: handlePageChange,
    total,
    setTotal,
    pageSize,
    setPageSize: handlePageSizeChange,
    searchText,
    setSearchText: handleSearchChange,
    totalPages,
    resetPagination,
  };
};
