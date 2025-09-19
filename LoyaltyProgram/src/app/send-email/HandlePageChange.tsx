const HandlePageChange = ({page,setPage,PAGE_SIZE,totalCount}) => {
     const endIndex = Math.min(page * PAGE_SIZE, totalCount);
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(Number(e.target.value));
  };

      return(
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div className="flex items-center justify-between w-[300px]">
            <select
              value={page}
              onChange={handlePageChange}
              className="border border-[#DEDEDE] rounded-full px-2 py-1"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            Showing {page} to {totalPages} of {endIndex} entries
          </div>

          <div className="space-x-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                p === 1 || // always show first page
                p === totalPages || // always show last page
                (p >= page - 1 && p <= page + 1) // show pages around current
              ) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ boxShadow: "2px 2px 2px 0px #00000040" }}
                    className={`px-3 py-1 rounded ${
                      page === p
                        ? "bg-[#FEFCED] text-black"
                        : "bg-[#FEFCED] text-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                );
              } else if (
                p === page - 2 || // add left ellipsis
                p === page + 2 // add right ellipsis
              ) {
                return <span key={p}>...</span>;
              } else {
                return null;
              }
            })}
          </div>
        </div>
    )
}

export default HandlePageChange;