<script setup lang="ts">
interface ArticleProps {
  title: string
  href: string
  description: string
  date?: string
  category?: string
  readTime?: string
  tags?: string[]
}

withDefaults(defineProps<ArticleProps>(), {
  date: '',
  category: '技术博客',
  readTime: '5 分钟阅读',
  tags: () => []
})
</script>

<template>
  <article class="article-card">
    <div class="article-meta">
      <span v-if="category" class="article-category">{{ category }}</span>
      <time v-if="date" class="article-date" :datetime="date">{{ date }}</time>
      <span v-if="readTime" class="article-read-time">{{ readTime }}</span>
    </div>

    <h3 class="article-title">
      <a :href="href" class="article-link">{{ title }}</a>
    </h3>

    <p class="article-description">{{ description }}</p>

    <div class="article-footer">
      <div v-if="tags && tags.length" class="article-tags">
        <span v-for="tag in tags" :key="tag" class="tag-item">#{{ tag }}</span>
      </div>
      <a :href="href" class="read-more-btn" aria-label="阅读全文">
        阅读全文
        <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-card-border);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--site-card-shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: var(--vp-c-brand-1);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--site-text-muted);
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.article-category {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-sm);
}

.article-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
}

.article-link {
  color: var(--site-text-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.article-link:hover {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.article-description {
  margin: 0 0 1.25rem 0;
  color: var(--site-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  flex-grow: 1;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--site-border-color);
}

.article-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag-item {
  font-size: 0.75rem;
  color: var(--site-text-muted);
  background: var(--site-bg-subtle);
  padding: 0.1rem 0.45rem;
  border-radius: var(--site-radius-sm);
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  margin-left: auto;
}

.read-more-btn:hover {
  text-decoration: underline;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.15s ease;
}

.read-more-btn:hover .arrow-icon {
  transform: translateX(3px);
}
</style>
