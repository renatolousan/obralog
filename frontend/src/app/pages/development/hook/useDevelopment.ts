import { useEffect, useState } from "react";
import type { Development } from "../types/developments";
import { fetchDevelopments } from "../developmentTable";

export function useDevelopments() {
    const [data, setData] = useState<Development[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const ctrl = new AbortController();
        setLoading(true);
        setError(null);

        fetchDevelopments(ctrl.signal)
            .then(({ data, total }) => {
                setData(data);
                setTotal(total);
            })
            .catch((e) => {
                if (e.name !== "AbortError") setError(e.message ?? "Erro ao carregar");
            })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, []);

    return { data, total, loading, error };
}
