
import QuoteForm from './components/QuoteForm';
import QuoteSummary from './components/QuoteSummary';
import RecentQuotes from './components/RecentQuotes';

function QuoteManagement() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Quản lý báo giá</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: QuoteForm */}
        <div className="w-full lg:w-1/2">
          <QuoteForm />
        </div>
        {/* Right: QuoteSummary above RecentQuotes */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <QuoteSummary />
          <RecentQuotes />
        </div>
      </div>
    </div>
  );
}

export default QuoteManagement;
