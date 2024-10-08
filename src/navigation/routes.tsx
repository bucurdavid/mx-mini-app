import type {ComponentType, JSX} from 'react'

import {InitDataPage} from '@/pages/InitDataPage/InitDataPage'
import {LaunchParamsPage} from '@/pages/LaunchParamsPage/LaunchParamsPage.tsx'
import {ThemeParamsPage} from '@/pages/ThemeParamsPage/ThemeParamsPage.tsx'
import Dashboard from '@/pages/Dashboard'
import QuestPage from '@/pages/Quests'
import SwapPage from '@/pages/Swap'

interface Route {
  path: string
  Component: ComponentType
  title?: string
  icon?: JSX.Element
}

export const routes: Route[] = [
  {path: '/', Component: Dashboard},
  {path: '/init-data', Component: InitDataPage, title: 'Init Data'},
  {path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params'},
  {path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params'},
  {path: '/quests', Component: QuestPage, title: 'Quests'},
  {path: '/swaps', Component: SwapPage, title: 'Swaps'},
]
