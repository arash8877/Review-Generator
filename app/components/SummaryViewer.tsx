import { SummaryResponse, ProductModelFilter } from "@/app/lib/types";

interface SummaryViewerProps {
  data: SummaryResponse;
  isLoading: boolean;
  onGenerate: () => void;
  selectedProduct: ProductModelFilter;
  onProductChange: (product: ProductModelFilter) => void;
  generatedForProduct: ProductModelFilter | null;
}

export function SummaryViewer({ data, isLoading, onGenerate, selectedProduct, onProductChange, generatedForProduct }: SummaryViewerProps) {
  if (!data && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-cyan-100/60 min-h-[300px] space-y-4">
        <p className="text-xl font-semibold text-cyan-200">No summary generated yet</p>
        <p className="max-w-md text-cyan-100/70">
          Select a product and generate an AI-powered summary to get insights from customer reviews.
        </p>
        
        {/* Product Selector */}
        <div className="w-full max-w-xs">
          <label htmlFor="product-select" className="block text-sm font-medium text-cyan-200 mb-2 text-left">
            Select Product
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value as ProductModelFilter)}
            className="w-full px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/5 text-cyan-100 backdrop-blur-sm"
          >
            <option value="all">All Products</option>
            <option value="model-1">TV-Model 1</option>
            <option value="model-2">TV-Model 2</option>
            <option value="model-3">TV-Model 3</option>
            <option value="model-4">TV-Model 4</option>
          </select>
        </div>
        
        <button
          onClick={onGenerate}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan-strong"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 neon-glow-cyan"></div>
        <p className="text-cyan-200 font-medium">Analyzing reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Product Selector */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex-1 max-w-xs">
          <label htmlFor="product-select-loaded" className="block text-sm font-medium text-cyan-200 mb-2">
            Select Product
          </label>
          <select
            id="product-select-loaded"
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value as ProductModelFilter)}
            className="w-full px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/5 text-cyan-100 backdrop-blur-sm"
          >
            <option value="all">All Products</option>
            <option value="model-1">TV-Model 1</option>
            <option value="model-2">TV-Model 2</option>
            <option value="model-3">TV-Model 3</option>
            <option value="model-4">TV-Model 4</option>
          </select>
        </div>
        {selectedProduct === generatedForProduct ? (
          <button
            onClick={onGenerate}
            className="mt-6 px-4 py-2 text-sm text-cyan-300 hover:text-cyan-100 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analysis
          </button>
        ) : (
          <button
            onClick={onGenerate}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan-strong"
          >
            Generate Summary
          </button>
        )}
      </div>
      
      {/* Executive Summary */}
      <section className="glass-card rounded-2xl p-6 border border-cyan-400/30 neon-glow-cyan">
        <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
          <span className="text-2xl">📊</span> Executive Summary
        </h3>
        <p className="text-cyan-50 leading-relaxed">{data.summary}</p>
      </section>

      {/* Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <section className="glass-card rounded-2xl p-6 border border-emerald-400/30 neon-glow-blue">
          <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span> Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-emerald-100">
                <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Weaknesses */}
        <section className="glass-card rounded-2xl p-6 border border-red-400/30 neon-glow-magenta">
          <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">🚩</span> Weaknesses
          </h3>
          <ul className="space-y-2">
            {data.weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-red-100">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recommendations */}
      <section className="glass-card rounded-2xl p-6 border border-purple-400/30 neon-glow-magenta">
        <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> Recommendations for DanTV
        </h3>
        <div className="grid gap-3">
          {data.recommendations.map((item, index) => (
            <div
              key={index}
              className="glass rounded-xl border border-purple-400/20 p-4 flex items-start gap-3 hover:border-purple-400/40 transition-all"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500/30 text-purple-300 rounded-full flex items-center justify-center font-bold text-sm neon-border-magenta">
                {index + 1}
              </span>
              <p className="text-cyan-50">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
