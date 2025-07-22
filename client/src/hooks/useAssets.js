import { useState, useEffect, useCallback } from "react";
import {
  getSoundEffects,
  getVideoEffects,
  getMusic,
} from "../services/assetService";

const SERVICE_MAP = {
  sfx: getSoundEffects,
  vfx: getVideoEffects,
  music: getMusic,
};

/**
 * Generic hook to fetch paginated asset lists (sfx, vfx, music).
 *
 * @param {"sfx" | "vfx" | "music"} assetType - Type of asset to fetch.
 * @param {{ page: number, limit: number, search: string }} options - Pagination & search options.
 */
export default function useAssets(assetType, { page, limit, search }) {
  const [files, setFiles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    const serviceFn = SERVICE_MAP[assetType];
    if (!serviceFn) return;

    try {
      setIsLoading(true);
      const data = await serviceFn({ page, limit, search });
      setFiles(data.files || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [assetType, page, limit, search]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    files,
    totalPages,
    error,
    isLoading,
    refetch: fetchAssets,
  };
}
