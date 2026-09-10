import type { Exercise, Lesson } from '../../types'
import { world1, world1Boss } from './world1'
import { world2, world2Boss } from './world2'
import { world3, world3Boss } from './world3'
import { world4, world4Boss } from './world4'
import { world5, world5Boss } from './world5'

/** 每關的課程（關 → 課列表）。內容分檔在 world1～5.ts。 */
export const lessonsByStage: Record<number, Lesson[]> = { ...world1, ...world2, ...world3, ...world4, ...world5 }

/** 每關的 Boss 題 */
export const bossByStage: Record<number, Exercise> = { ...world1Boss, ...world2Boss, ...world3Boss, ...world4Boss, ...world5Boss }
