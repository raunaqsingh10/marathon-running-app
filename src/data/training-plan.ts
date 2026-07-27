import type { PlannedWorkout } from '../types'

export const PLAN_START = '2026-07-28'
export const PLAN_END = '2026-09-20'

export const trainingPlan: PlannedWorkout[] = [
  { id: 'w1-quality', week: 1, date: '2026-07-28', day: 'Tuesday', session: 'Quality', plannedKm: 5.5, targetPace: 'Reps: 5:05–5:15/km', workoutDetail: '1.5 km easy WU → 3 × 800 m @ 5:05–5:15/km with 400 m easy jog → cool down to 5.5 km' },
  { id: 'w1-easy', week: 1, date: '2026-07-29', day: 'Wednesday', session: 'Easy', plannedKm: 5, targetPace: '6:15–6:45/km', workoutDetail: '5 km conversational' },
  { id: 'w1-strides', week: 1, date: '2026-07-31', day: 'Friday', session: 'Easy + Strides', plannedKm: 4.5, targetPace: '6:15–6:45/km on easy running', workoutDetail: '4.5 km easy + 4 × 20 sec relaxed strides, full recovery' },
  { id: 'w1-long', week: 1, date: '2026-08-02', day: 'Sunday', session: 'Long', plannedKm: 9, targetPace: '6:05–6:30/km', workoutDetail: '9 km steady, fully conversational' },
  { id: 'w2-quality', week: 2, date: '2026-08-04', day: 'Tuesday', session: 'Quality', plannedKm: 6.5, targetPace: 'Reps: 5:05–5:15/km', workoutDetail: '1.5 km easy WU → 3 × 1 km @ 5:05–5:15/km with 400 m easy jog → cool down to 6.5 km' },
  { id: 'w2-easy', week: 2, date: '2026-08-05', day: 'Wednesday', session: 'Easy', plannedKm: 5.5, targetPace: '6:15–6:45/km', workoutDetail: '5.5 km conversational' },
  { id: 'w2-strides', week: 2, date: '2026-08-07', day: 'Friday', session: 'Easy + Strides', plannedKm: 5, targetPace: '6:15–6:45/km on easy running', workoutDetail: '5 km easy + 4 × 20 sec relaxed strides, full recovery' },
  { id: 'w2-long', week: 2, date: '2026-08-09', day: 'Sunday', session: 'Long', plannedKm: 10, targetPace: '6:05–6:30/km', workoutDetail: '10 km steady' },
  { id: 'w3-quality', week: 3, date: '2026-08-11', day: 'Tuesday', session: 'Quality', plannedKm: 7, targetPace: 'Tempo: 5:20–5:25/km', workoutDetail: '2 km easy WU → 3 km continuous tempo @ 5:20–5:25/km → 2 km easy CD' },
  { id: 'w3-easy', week: 3, date: '2026-08-12', day: 'Wednesday', session: 'Easy', plannedKm: 6, targetPace: '6:15–6:45/km', workoutDetail: '6 km conversational' },
  { id: 'w3-strides', week: 3, date: '2026-08-14', day: 'Friday', session: 'Easy + Strides', plannedKm: 5.5, targetPace: '6:15–6:45/km on easy running', workoutDetail: '5.5 km easy + 5 × 20 sec relaxed strides' },
  { id: 'w3-long', week: 3, date: '2026-08-16', day: 'Sunday', session: 'Long', plannedKm: 11, targetPace: '6:05–6:30/km', workoutDetail: '11 km steady' },
  { id: 'w4-quality', week: 4, date: '2026-08-18', day: 'Tuesday', session: 'Quality', plannedKm: 5.5, targetPace: 'Fast reps: 5:15–5:20/km', workoutDetail: '1.5 km easy WU → 6 × 2 min @ ~5:15–5:20/km / 2 min easy → cool down to 5.5 km' },
  { id: 'w4-easy', week: 4, date: '2026-08-19', day: 'Wednesday', session: 'Easy', plannedKm: 5, targetPace: '6:20–6:50/km', workoutDetail: '5 km very easy' },
  { id: 'w4-friday', week: 4, date: '2026-08-21', day: 'Friday', session: 'Easy', plannedKm: 4.5, targetPace: '6:20–6:50/km', workoutDetail: '4.5 km easy; no strides required' },
  { id: 'w4-long', week: 4, date: '2026-08-23', day: 'Sunday', session: 'Long', plannedKm: 9, targetPace: '6:10–6:35/km', workoutDetail: '9 km relaxed' },
  { id: 'w5-quality', week: 5, date: '2026-08-25', day: 'Tuesday', session: 'Quality', plannedKm: 7.5, targetPace: 'Reps: 5:00–5:10/km', workoutDetail: '1.5 km easy WU → 4 × 1 km @ 5:00–5:10/km with 400 m easy jog → cool down to 7.5 km' },
  { id: 'w5-easy', week: 5, date: '2026-08-26', day: 'Wednesday', session: 'Easy', plannedKm: 6, targetPace: '6:10–6:40/km', workoutDetail: '6 km conversational' },
  { id: 'w5-strides', week: 5, date: '2026-08-28', day: 'Friday', session: 'Easy + Strides', plannedKm: 6, targetPace: '6:10–6:40/km on easy running', workoutDetail: '6 km easy + 5 × 20 sec relaxed strides' },
  { id: 'w5-long', week: 5, date: '2026-08-30', day: 'Sunday', session: 'Long', plannedKm: 12, targetPace: '6:00–6:25/km', workoutDetail: '12 km steady' },
  { id: 'w6-quality', week: 6, date: '2026-09-01', day: 'Tuesday', session: 'Quality', plannedKm: 8, targetPace: 'Tempo: 5:20–5:25/km', workoutDetail: '2 km easy WU → 4 km tempo @ 5:20–5:25/km → 2 km easy CD' },
  { id: 'w6-easy', week: 6, date: '2026-09-02', day: 'Wednesday', session: 'Easy', plannedKm: 6.5, targetPace: '6:10–6:40/km', workoutDetail: '6.5 km conversational' },
  { id: 'w6-strides', week: 6, date: '2026-09-04', day: 'Friday', session: 'Easy + Strides', plannedKm: 6.5, targetPace: '6:10–6:40/km on easy running', workoutDetail: '6.5 km easy + 5 × 20 sec relaxed strides' },
  { id: 'w6-long', week: 6, date: '2026-09-06', day: 'Sunday', session: 'Long', plannedKm: 14, targetPace: 'Easy section 6:00–6:25/km', workoutDetail: '12 km easy → optional final 2 km @ 5:45–5:50/km if legs feel good' },
  { id: 'w7-quality', week: 7, date: '2026-09-08', day: 'Tuesday', session: 'Quality', plannedKm: 8.5, targetPace: 'Cruise reps: 5:15–5:20/km', workoutDetail: '2 km easy WU → 3 × 1.5 km @ 5:15–5:20/km with 500 m easy jog → 1 km easy CD' },
  { id: 'w7-easy', week: 7, date: '2026-09-09', day: 'Wednesday', session: 'Easy', plannedKm: 7, targetPace: '6:10–6:40/km', workoutDetail: '7 km conversational' },
  { id: 'w7-strides', week: 7, date: '2026-09-11', day: 'Friday', session: 'Easy + Strides', plannedKm: 6.5, targetPace: '6:10–6:40/km on easy running', workoutDetail: '6.5 km easy + 6 × 20 sec relaxed strides' },
  { id: 'w7-long', week: 7, date: '2026-09-13', day: 'Sunday', session: 'Long', plannedKm: 15.5, targetPace: 'Do not race the workout', workoutDetail: '12.5 km easy → final 3 km @ 5:40–5:50/km if controlled' },
  { id: 'w8-quality', week: 8, date: '2026-09-15', day: 'Tuesday', session: 'Quality', plannedKm: 8.5, targetPace: 'HM pace: 5:30/km', workoutDetail: '1.5 km easy WU → 5 km @ goal HM pace 5:30/km → 2 km easy CD' },
  { id: 'w8-easy', week: 8, date: '2026-09-16', day: 'Wednesday', session: 'Easy', plannedKm: 6.5, targetPace: '6:15–6:45/km', workoutDetail: '6.5 km conversational' },
  { id: 'w8-strides', week: 8, date: '2026-09-18', day: 'Friday', session: 'Easy + Strides', plannedKm: 6, targetPace: '6:15–6:45/km on easy running', workoutDetail: '6 km easy + 4 × 20 sec relaxed strides' },
  { id: 'w8-long', week: 8, date: '2026-09-20', day: 'Sunday', session: 'Long', plannedKm: 16, targetPace: 'Finish strong, not exhausted', workoutDetail: '12 km easy → final 4 km gradual 5:55 → 5:40/km; never faster than 5:40' },
]

export const totalPlannedKm = trainingPlan.reduce((sum, workout) => sum + workout.plannedKm, 0)
