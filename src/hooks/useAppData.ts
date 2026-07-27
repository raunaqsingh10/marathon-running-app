import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { todayISO } from '../lib/date'
import { createRun, deleteRun, getComparison, getPlan, getProfile, getRuns, restoreRun, updateRun } from '../services/data'
import type { RunInput } from '../types'

export function useProfile() {
  const { userId } = useAuth()
  return useQuery({ queryKey: ['profile', userId], queryFn: () => getProfile(userId!), enabled: Boolean(userId) })
}

export function usePlan() {
  return useQuery({ queryKey: ['plan'], queryFn: getPlan, staleTime: Infinity })
}

export function useRuns() {
  const { userId } = useAuth()
  return useQuery({ queryKey: ['runs', userId], queryFn: () => getRuns(userId!), enabled: Boolean(userId) })
}

export function useComparison() {
  return useQuery({ queryKey: ['comparison', todayISO()], queryFn: () => getComparison(todayISO()) })
}

export function useRunMutations() {
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['runs', userId] }),
      queryClient.invalidateQueries({ queryKey: ['comparison'] }),
    ])
  }
  return {
    save: useMutation({ mutationFn: (input: RunInput) => input.id ? updateRun(userId!, input) : createRun(userId!, input), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (runId: string) => deleteRun(userId!, runId), onSuccess: refresh }),
    restore: useMutation({ mutationFn: (runId: string) => restoreRun(userId!, runId), onSuccess: refresh }),
  }
}
