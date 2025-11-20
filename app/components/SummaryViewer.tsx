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
      <div className="flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px] space-y-4">
        <p className="text-xl font-semibold text-gray-700">No summary generated yet</p>
        <p className="max-w-md">
          Select a product and generate an AI-powered summary to get insights from customer reviews.
        </p>
        
        {/* Product Selector */}
        <div className="w-full max-w-xs">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Select Product
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value as ProductModelFilter)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 font-medium">Analyzing reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Product Selector */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex-1 max-w-xs">
          <label htmlFor="product-select-loaded" className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            id="product-select-loaded"
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value as ProductModelFilter)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="mt-6 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analysis
          </button>
        ) : (
          <button
            onClick={onGenerate}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Generate Summary
          </button>
        )}
      </div>
      
      {/* Executive Summary */}
      <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">📊</span> Executive Summary
        </h3>
        <p className="text-blue-800 leading-relaxed">{data.summary}</p>
      </section>

      {/* Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <section className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span> Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-green-800">
                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Weaknesses */}
        <section className="bg-red-50 rounded-xl p-6 border border-red-100">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🚩</span> Weaknesses
          </h3>
          <ul className="space-y-2">
            {data.weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-red-800">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recommendations */}
      <section className="bg-purple-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> Recommendations for DanTV
        </h3>
        <div className="grid gap-3">
          {data.recommendations.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm flex items-start gap-3"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <p className="text-gray-800">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
