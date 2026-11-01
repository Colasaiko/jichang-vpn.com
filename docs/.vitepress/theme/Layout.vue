<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import CustomNotFound from './components/CustomNotFound.vue'
import BrandBuyBox from './components/BrandBuyBox.vue'

const { Layout } = DefaultTheme

interface ActiveImage {
  src: string
  alt: string
}

const isMounted = ref(false)
const activeImg = ref<ActiveImage | null>(null)

const openZoom = (src: string, alt: string) => {
  activeImg.value = { src, alt }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

const closeZoom = () => {
  activeImg.value = null
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && activeImg.value) {
    closeZoom()
  }
}

const attachZoom = () => {
  if (typeof document === 'undefined') return
  const imgs = document.querySelectorAll<HTMLImageElement>(
    '.tutorial-img-wrap img, .vp-doc img:not(.no-zoom):not(.logo)'
  )
  imgs.forEach((img) => {
    img.style.cursor = 'zoom-in'
    img.onclick = (e) => {
      e.stopPropagation()
      openZoom(img.getAttribute('src') || img.src, img.getAttribute('alt') || '')
    }
  })
}

const route = useRoute()

onMounted(() => {
  isMounted.value = true
  attachZoom()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

watch(
  () => route.path,
  () => {
    nextTick(() => {
      attachZoom()
    })
  }
)
</script>

<template>
  <Layout>
    <template #not-found>
      <CustomNotFound />
    </template>
    <template #aside-outline-after>
      <BrandBuyBox variant="aside" />
    </template>
    <template #doc-after>
      <BrandBuyBox variant="bar" />
    </template>
    <template #layout-bottom>
      <ClientOnly>
        <Teleport to="body" v-if="isMounted">
          <Transition name="lightbox-fade">
            <div
              v-if="activeImg"
              class="image-lightbox-overlay"
              @click="closeZoom"
            >
              <button
                class="image-lightbox-close"
                aria-label="关闭预览"
                title="关闭 (按 ESC 或点击背景)"
                @click.stop="closeZoom"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div class="image-lightbox-content" @click.stop>
                <img
                  :src="activeImg.src"
                  :alt="activeImg.alt"
                  class="image-lightbox-img"
                  @click="closeZoom"
                />
                <div v-if="activeImg.alt" class="image-lightbox-caption">
                  {{ activeImg.alt }}
                </div>
              </div>
              <div class="image-lightbox-tip">点击任意位置或按 ESC 退出全屏查看</div>
            </div>
          </Transition>
        </Teleport>
      </ClientOnly>
    </template>
  </Layout>
</template>
