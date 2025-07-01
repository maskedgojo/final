
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {

  return (
   
<div className={`mx-auto w-full max-w-sm rounded-md border border-blue-300 p-4 ${className}`}>
  <div className="flex animate-pulse space-x-4">
    <div
      className={
        size === "sm"
          ? "size-6"
          : size === "lg"
          ? "size-14"
          : size === "xl"
          ? "size-20"
          : "size-10"
      + " rounded-full bg-gray-200"}
    ></div>
    <div className="flex-1 space-y-6 py-1">
      <div className="h-2 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-2 rounded bg-gray-200"></div>
          <div className="col-span-1 h-2 rounded bg-gray-200"></div>
        </div>
        <div className="h-2 rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
</div>

  );
}