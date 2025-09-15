export const LoadingButton = ({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean }) => (
  <button
    disabled={loading}
    className={`mt-6 w-full flex items-center justify-center gap-2 bg-[#734A00] text-white py-3 rounded-full font-semibold transition ${
      loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#5a3800]"
    }`}
    {...props}
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        Saving...
      </>
    ) : (
      children
    )}
  </button>
);
