import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changesApi, servicesApi, impactApi } from '../../api/client';
import type { ChangeRequestDetail, ImpactSummary } from './types';

// ---- Query hooks ----

export function useChangeRequest(id: string | undefined) {
  return useQuery<ChangeRequestDetail>({
    queryKey: ['change', id],
    queryFn: () => changesApi.get(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useImpactReport(changeRequestId: string | undefined) {
  return useQuery<ImpactSummary>({
    queryKey: ['impact', changeRequestId],
    queryFn: () => impactApi.get(changeRequestId!),
    enabled: !!changeRequestId,
    retry: false, // Impact may not exist yet — don't spam
    staleTime: 30_000,
  });
}

export function useServiceList() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list({ limit: 100 }),
    staleTime: 60_000,
    select: (data: any) => data?.data ?? [],
  });
}

// ---- Mutation hooks ----

export function useCreateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: changesApi.createDraft,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['changes'] }),
  });
}

export function useSubmitChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => changesApi.submit(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['change', id] });
      qc.invalidateQueries({ queryKey: ['changes'] });
    },
  });
}

export function useReviewChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { action: string; comment: string } }) =>
      changesApi.review(id, payload),
    onMutate: async ({ id, payload }) => {
      // Optimistic update: immediately add the comment locally
      await qc.cancelQueries({ queryKey: ['change', id] });
      const previous = qc.getQueryData<ChangeRequestDetail>(['change', id]);
      if (previous) {
        qc.setQueryData<ChangeRequestDetail>(['change', id], {
          ...previous,
          comments: [
            ...previous.comments,
            {
              id: `optimistic-${Date.now()}`,
              authorId: 'you',
              content: payload.comment,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      return { previous };
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.previous) qc.setQueryData(['change', id], ctx.previous);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: ['change', id] });
      qc.invalidateQueries({ queryKey: ['changes'] });
    },
  });
}
