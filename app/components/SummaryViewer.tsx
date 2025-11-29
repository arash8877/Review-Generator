import { SummaryResponse, ProductModelFilter } from "@/app/lib/types";
import { LoadingSpinner } from "./LoadingSpinner";

interface SummaryViewerProps {
  data?: SummaryResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  selectedProduct: ProductModelFilter;
  onProductChange: (product: ProductModelFilter) => void;
  generatedForProduct: ProductModelFilter | null;
}

interface ProductSelectProps {
  value: ProductModelFilter;
  onChange: (product: ProductModelFilter) => void;
  id?: string;
}

function ProductSelect({ value, onChange, id = "product-select" }: ProductSelectProps) {
  return (
    <div className="flex-1 max-w-xs">
      <label htmlFor={id} className="block text-sm font-medium text-cyan-200 mb-2 text-left">
        Select Product
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ProductModelFilter)}
        className="w-full px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/5 text-cyan-100 backdrop-blur-sm"
      >
        <option value="all">All Products</option>
        <option value="model-1">TV-Model 1</option>
        <option value="model-2">TV-Model 2</option>
        <option value="model-3">TV-Model 3</option>
        <option value="model-4">TV-Model 4</option>
      </select>
    </div>
  );
}

function AnalysisGrid({ data }: { data: SummaryResponse }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
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
  );
}

function Recommendations({ data }: { data: SummaryResponse }) {
  return (
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
  );
}

export function SummaryViewer({
  data,
  isLoading,
  onGenerate,
  selectedProduct,
  onProductChange,
  generatedForProduct,
}: SummaryViewerProps) {
  if (!data && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-cyan-100/60 min-h-[320px] space-y-5">
        <p className="text-xl font-semibold text-cyan-200">No summary generated yet</p>
        <p className="max-w-md text-cyan-100/70">
          Select a product or keep it broad to see a cross-model pulse. We will surface an executive summary, strengths/weaknesses, and actions in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-end gap-3 w-full max-w-xl pt-2">
          <div className="flex-1 w-full">
            <ProductSelect value={selectedProduct} onChange={onProductChange} />
          </div>
          <button
            onClick={onGenerate}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan-strong w-full sm:w-auto"
          >
            {selectedProduct === "all" ? "Analyze All Products" : "Generate Summary"}
          </button>
        </div>
        <p className="text-xs text-cyan-100/60">Tip: “All Products” gives a high-level pulse; pick a model for deeper focus.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200/10 rounded-xl">
        <LoadingSpinner message="Analyzing reviews..." subtext="Reading through feedback" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <ProductSelect value={selectedProduct} onChange={onProductChange} id="product-select-loaded" />
        <button
          onClick={onGenerate}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan-strong"
        >
          {selectedProduct === generatedForProduct ? "Refresh Analysis" : "Generate Summary"}
        </button>
      </div>
      
      <section className="glass-card rounded-2xl p-6 border border-cyan-400/30 neon-glow-cyan">
        <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
          <span className="text-2xl">📊</span> Executive Summary
        </h3>
        <p className="text-cyan-50 leading-relaxed">{data.summary}</p>
      </section>

      <AnalysisGrid data={data} />
      <Recommendations data={data} />
    </div>
  );
}
