import { Card } from '../common/Card';
import { formatNumber } from '../../utils/currencyHelpers';

export function ProductWordCloudChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Common words to filter out (stop words)
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'pack',
    'set',
    'new',
    'inch',
    'size',
    'color',
    'model',
    'brand',
    'type',
    'style',
    'piece',
    'pcs',
    'count',
    'product',
    'item',
    'x',
    'by',
    'of',
    'in',
    'to',
    'a',
    'an',
    'or',
    'on',
    'at',
    'from',
    'as',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'can',
    'could',
    'may',
    'might',
    'must',
    'shall',
    'not',
    'no',
    'yes',
    'name',
    'associated',
    'asin',
    'ft',
    'oz',
    'lb',
    'lbs',
    'kg',
    'cm',
    'mm',
    'ml',
    'gal',
    'qt',
    'pt',
    'cup',
    'tbsp',
    'tsp',
  ]);

  // Extract and count words from product names
  const wordCount = {};

  orders.forEach(order => {
    if (!order.productName) return;

    // Clean and split product name into words
    const words = order.productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ') // Remove special characters except hyphen
      .split(/\s+/)
      .filter(word => {
        // Filter: length > 2, not a number, not a stop word
        return (
          word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word) && !/^[0-9]/.test(word) // Filter words starting with numbers
        );
      });

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Convert to array and sort by frequency
  const wordArray = Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 words

  // Get top 20 for main display
  const topWords = wordArray.slice(0, 20);

  // Calculate font sizes for word cloud effect
  const maxCount = topWords[0]?.count || 1;
  const minCount = topWords[topWords.length - 1]?.count || 1;

  const getWordSize = count => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    return 12 + ratio * 32; // Font size between 12 and 44
  };

  const getWordColor = count => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    if (ratio > 0.7) return 'text-blue-600';
    if (ratio > 0.4) return 'text-purple-600';
    if (ratio > 0.2) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <Card
      title="☁️ Product Name Word Cloud"
      subtitle={`Most common words from ${formatNumber(orders.length, 0)} orders`}
    >
      {/* Word Cloud Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 mb-6 min-h-96 flex items-center justify-center">
        <div className="flex flex-wrap justify-center items-center gap-3">
          {topWords.map((item, index) => (
            <div
              key={index}
              className={`font-bold ${getWordColor(item.count)} hover:scale-110 transition-transform duration-200 cursor-default`}
              style={{ fontSize: `${getWordSize(item.count)}px` }}
              title={`${item.word}: ${item.count} occurrences`}
            >
              {item.word}
            </div>
          ))}
        </div>
      </div>

      {/* Top Words Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 10 Words */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🏆 Top 10 Words</h3>
          <div className="space-y-2">
            {topWords.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-gray-500 w-6">{index + 1}.</span>
                  <span className="text-sm font-medium text-gray-800 capitalize">{item.word}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-blue-100 h-2 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}px` }}
                  ></div>
                  <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Words 11-20 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 Words 11-20</h3>
          <div className="space-y-2">
            {topWords.slice(10, 20).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-gray-500 w-6">{index + 11}.</span>
                  <span className="text-sm font-medium text-gray-800 capitalize">{item.word}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-purple-100 h-2 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}px` }}
                  ></div>
                  <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">🔍 Shopping Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatNumber(Object.keys(wordCount).length, 0)}
            </div>
            <div>Unique Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {formatNumber(
                Object.values(wordCount).reduce((sum, count) => sum + count, 0),
                0
              )}
            </div>
            <div>Total Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 capitalize">
              {topWords[0]?.word || 'N/A'}
            </div>
            <div>Most Common</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {formatNumber(
                Object.values(wordCount).reduce((sum, count) => sum + count, 0) /
                  Object.keys(wordCount).length,
                1
              )}
            </div>
            <div>Avg Frequency</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
