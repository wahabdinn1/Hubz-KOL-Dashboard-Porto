
export default function Loading() {
    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <h2 className="text-xl font-bold tracking-tight">LOADING...</h2>
        </div>
    );
}
