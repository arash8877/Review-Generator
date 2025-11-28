interface LoadingSpinnerProps {
  message?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  showSkeleton?: boolean;
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-400/20 rounded-full animate-shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-cyan-400/20 rounded animate-shimmer"></div>
            <div className="h-3 bg-cyan-400/10 rounded w-3/4 animate-shimmer"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-cyan-400/20 rounded animate-shimmer"></div>
          <div className="h-4 bg-cyan-400/10 rounded w-5/6 animate-shimmer"></div>
          <div className="h-4 bg-cyan-400/10 rounded w-4/6 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({
  message = "Generating response...",
  subtext,
  size = "md",
  showSkeleton = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (showSkeleton) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 text-cyan-100 animate-fade-in-up">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-cyan-200/30 border-t-cyan-400 rounded-full animate-spin neon-glow-cyan`}></div>
        {/* Inner pulsing ring */}
        <div className="absolute inset-2 border-2 border-cyan-400/50 rounded-full animate-pulse"></div>
        {/* Center dot */}
        <div className="absolute inset-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-cyan-400 rounded-full neon-glow-cyan"></div>
      </div>

      <div className="text-center space-y-1">
        <p className={`${textSizeClasses[size]} font-semibold text-cyan-100`}>{message}</p>
        <div className="flex items-center justify-center gap-1">
          <p className="text-xs text-cyan-100/70">
            {subtext || "Crafting personalized response"}
          </p>
          <div className="loading-dots flex gap-1 ml-2">
            <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
            <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
            <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
