import { useState, useMemo } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { glossary, searchGlossary } from '@/data/glossary';

export default function GlossaryPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return glossary;
    return searchGlossary(query);
  }, [query]);

  // 按分类分组
  const grouped = useMemo(() => {
    const map: Record<string, typeof glossary> = {};
    for (const term of results) {
      if (!map[term.category]) map[term.category] = [];
      map[term.category].push(term);
    }
    return map;
  }, [results]);

  const categories = Object.keys(grouped);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 头部 */}
      <div className="mb-4">
        <h1 className="text-lg font-bold glow-text flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          术语库
        </h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          内置 {glossary.length}+ 条机器人专业名词 · 研报阅读时可点触查询
        </p>
      </div>

      {/* 搜索 */}
      <div className="relative mb-5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="搜索术语名称或解释..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-8 h-9 text-xs bg-muted border-border"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* 结果 */}
      {results.length === 0 ? (
        <div className="terminal-card p-8 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">未找到该术语</p>
          <p className="text-xs text-muted-foreground/60 mt-1">尝试更换关键词</p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                  {cat}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  ({grouped[cat].length} 条)
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {grouped[cat].map((term) => (
                  <div
                    key={term.term}
                    className="terminal-card p-3 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="text-xs font-semibold text-primary mb-1">{term.term}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}