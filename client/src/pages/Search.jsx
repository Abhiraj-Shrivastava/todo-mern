import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import TaskList from '../components/TaskList.jsx';
import { tasksApi } from '../api/tasks.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTaskActions } from '../context/TaskActionsContext.jsx';

export default function Search() {
  const navigate = useNavigate();
  const { version } = useTaskActions();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const term = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    setParams(term ? { q: term } : {}, { replace: true });
  }, [term, setParams]);

  const results = useFetch(
    (signal) => (term ? tasksApi.list({ search: term }, signal) : Promise.resolve([])),
    term,
    version
  );

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  return (
    <div className="px-5 pt-6 pb-10">
      <button
        type="button"
        onClick={goBack}
        aria-label="Back"
        className="-ml-1.5 rounded p-1.5 text-ink hover:bg-brand-50"
      >
        <ArrowLeft className="size-5" />
      </button>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or description"
          aria-label="Search tasks"
          autoFocus
          className="w-full rounded-[4px] border border-line bg-white py-3 pr-11 pl-4 text-[13px] outline-none placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        ) : (
          <SearchIcon className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2" strokeWidth={1.8} />
        )}
      </form>

      <div className="mt-4">
        {!term ? (
          <p className="py-10 text-center text-[13px] text-muted">Type a keyword to find tasks by title or description.</p>
        ) : (
          <>
            {results.data && results.data.length > 0 && (
              <p className="mb-1 text-[11px] text-muted">
                {results.data.length} {results.data.length === 1 ? 'result' : 'results'}
              </p>
            )}
            <TaskList
              tasks={results.data}
              error={results.error}
              onRetry={results.reload}
              showDate
              highlight={term}
              emptyText={`No tasks match “${term}”.`}
            />
          </>
        )}
      </div>
    </div>
  );
}
