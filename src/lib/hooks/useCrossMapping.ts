import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Find all questions sharing the same datapoint_key as the given question
export function useLinkedQuestions(questionId: string | undefined) {
  return useQuery<{ datapoint_key: string; linked_question_ids: string[] } | null>({
    queryKey: ['linked-questions', questionId],
    queryFn: async () => {
      // Get the datapoint_key(s) for this question
      const { data: mappings, error } = await supabase
        .from('datapoint_mappings')
        .select('datapoint_key')
        .eq('question_id', questionId!)

      if (error) throw error
      if (!mappings || mappings.length === 0) return null

      const key = mappings[0].datapoint_key

      // Get all other questions in this datapoint group
      const { data: linked, error: e2 } = await supabase
        .from('datapoint_mappings')
        .select('question_id, framework_code, conversion_factor, conversion_from_unit')
        .eq('datapoint_key', key)
        .neq('question_id', questionId!)

      if (e2) throw e2
      return {
        datapoint_key: key,
        linked_question_ids: (linked ?? []).map(l => l.question_id),
      }
    },
    enabled: !!questionId,
    staleTime: 10 * 60 * 1000,
  })
}

// Auto-populate linked questions after a response is saved
export function useAutoPopulate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questionId,
      periodId,
      value,
      numericValue,
    }: {
      questionId:   string
      periodId:     string
      value:        string
      numericValue: number | null
    }) => {
      const { data, error } = await supabase.rpc('auto_populate_linked_responses', {
        p_source_question_id: questionId,
        p_period_id:          periodId,
        p_value:              value,
        // PG function handles NULL explicitly; type-gen types the arg as
        // non-nullable, so cast to keep passing null through at runtime.
        p_numeric_value:      numericValue as number,
      })
      if (error) throw error
      return (data as number) ?? 0
    },
    onSuccess: (count) => {
      if (count > 0) {
        qc.invalidateQueries({ queryKey: ['response'] })
        qc.invalidateQueries({ queryKey: ['assignments'] })
      }
    },
    // Silent failure — cross-mapping is best-effort
    onError: () => { /* no toast for auto-populate failure */ },
  })
}
