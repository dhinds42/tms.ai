import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function LiveUpdates({ entities = [], interval = 10000, enabled = true }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || entities.length === 0) return;

    const refreshData = () => {
      entities.forEach(entity => {
        queryClient.invalidateQueries([entity]);
      });
    };

    refreshData();
    const intervalId = setInterval(refreshData, interval);

    return () => clearInterval(intervalId);
  }, [entities, interval, enabled, queryClient]);

  return null;
}