import type {ComponentType, JSX} from 'react'

import {IndexPage} from '@/pages/IndexPage/IndexPage'
import {InitDataPage} from '@/pages/InitDataPage/InitDataPage'
import {LaunchParamsPage} from '@/pages/LaunchParamsPage/LaunchParamsPage.tsx'
import {ThemeParamsPage} from '@/pages/ThemeParamsPage/ThemeParamsPage.tsx'
import {GenerateWallet} from '@/pages/MultiversX/GenerateWalletPage'

interface Route {
  path: string
  Component: ComponentType
  title?: string
  icon?: JSX.Element
}

export const routes: Route[] = [
  {path: '/', Component: IndexPage},
  {path: '/init-data', Component: InitDataPage, title: 'Init Data'},
  {path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params'},
  {path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params'},
  {path: '/generate-mvx', Component: GenerateWallet, title: 'Multiversx'},
]
