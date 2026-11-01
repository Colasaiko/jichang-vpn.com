import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import BrandCard from './components/BrandCard.vue'
import CompareTable from './components/CompareTable.vue'
import ArticleCard from './components/ArticleCard.vue'
import CategoryGrid from './components/CategoryGrid.vue'
import SearchPanel from './components/SearchPanel.vue'
import ProviderRecommendList from './components/ProviderRecommendList.vue'
import PlanFilter from './components/PlanFilter.vue'
import MultiplierCalculator from './components/MultiplierCalculator.vue'
import CouponCenter from './components/CouponCenter.vue'
import SubscriptionChecker from './components/SubscriptionChecker.vue'
import BrandComparator from './components/BrandComparator.vue'
import UnlockStatusChecker from './components/UnlockStatusChecker.vue'
import MaintenanceTimeline from './components/MaintenanceTimeline.vue'
import GoTransition from './components/GoTransition.vue'
import CustomNotFound from './components/CustomNotFound.vue'
import NetSlowdownAnim from './components/NetSlowdownAnim.vue'
import TopPick from './components/TopPick.vue'
import BrandPromo from './components/BrandPromo.vue'
import PricePerGbRanking from './components/PricePerGbRanking.vue'
import AppleIdShare from './components/AppleIdShare.vue'

import './styles/vars.css'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Register custom reusable components globally
    app.component('BrandCard', BrandCard)
    app.component('CompareTable', CompareTable)
    app.component('ArticleCard', ArticleCard)
    app.component('CategoryGrid', CategoryGrid)
    app.component('SearchPanel', SearchPanel)
    app.component('ProviderRecommendList', ProviderRecommendList)
    app.component('PlanFilter', PlanFilter)
    app.component('MultiplierCalculator', MultiplierCalculator)
    app.component('CouponCenter', CouponCenter)
    app.component('SubscriptionChecker', SubscriptionChecker)
    app.component('BrandComparator', BrandComparator)
    app.component('UnlockStatusChecker', UnlockStatusChecker)
    app.component('UnlockChecker', UnlockStatusChecker)
    app.component('MaintenanceTimeline', MaintenanceTimeline)
    app.component('Timeline', MaintenanceTimeline)
    app.component('GoTransition', GoTransition)
    app.component('CustomNotFound', CustomNotFound)
    app.component('NetSlowdownAnim', NetSlowdownAnim)
    app.component('TopPick', TopPick)
    app.component('BrandPromo', BrandPromo)
    app.component('PricePerGbRanking', PricePerGbRanking)
    app.component('AppleIdShare', AppleIdShare)
  }
} satisfies Theme
