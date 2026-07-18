import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Room {
  id: string;
  name: string;
  buildingName: string;
  capacity: number;
  gender: "L" | "P";
  supervisorId: string | null;
  supervisorName?: string | null;
  filledCapacity?: number;
  isActive: boolean;
}

export function useRooms(searchQuery: string = "", building: string = "", pageIndex: number = 0, pageSize: number = 10) {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Room[]; total: number }>({
    queryKey: ["sekretariat-rooms", searchQuery, building, pageIndex, pageSize],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      });
      if (searchQuery) queryParams.append("q", searchQuery);
      if (building) queryParams.append("building", building);

      const url = `/api/admin/rooms?${queryParams.toString()}`;
      const res = await apiRequest<{ data: Room[]; total: number }>(url);
      return {
        data: res.data || [],
        total: res.total || 0,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newRoom: Omit<Room, "id" | "isActive" | "supervisorName" | "filledCapacity">) => {
      const res = await apiRequest<{ data: Room }>("/api/admin/rooms", {
        method: "POST",
        body: JSON.stringify(newRoom),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-rooms"] });
      // Invalidate dashboard stats since total rooms might change if we added stats for rooms
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Room, "id" | "supervisorName" | "filledCapacity">> }) => {
      const res = await apiRequest<{ data: Room }>(`/api/admin/rooms/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/rooms/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  return {
    ...query,
    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRoom: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRoom: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
