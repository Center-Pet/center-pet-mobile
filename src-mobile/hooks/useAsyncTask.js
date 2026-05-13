import { useCallback, useEffect, useState } from "react";

export function useAsyncTask(task, deps = []) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const run = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await task();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { data, setData, loading, error, reload: run };
}
