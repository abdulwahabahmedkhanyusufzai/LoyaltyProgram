import { useCustomers } from "../utils/fetchCustomer";

const DeletedDialog = ({selectedCustomer,setDeleting,setShowDialog,setSelectedCustomer,showDialog,deleting}) =>{
  const { fetchCustomers } = useCustomers();

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      // Refetch customers after delete
      await fetchCustomers();
    } catch (err) {
      console.error("❌ Error deleting customer:", err);
    } finally {
      setDeleting(false);
      setShowDialog(false);
      setSelectedCustomer(null);
    }
  };

    return(
     <>
    {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background grid w-full max-w-sm gap-4 rounded-lg border p-6 shadow-lg">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold">
                Are you sure you want to delete <span className="font-bold">{selectedCustomer?.name}</span>?
              </h2>
              <p className="text-muted-foreground text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="cursor-pointer hover:opacity-70 inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 h-9"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="cursor-pointer hover:opacity-70 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white px-4 py-2 h-9"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-[#3B82F6] rounded-full animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    )}

export default DeletedDialog;