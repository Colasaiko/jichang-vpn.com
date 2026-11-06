import fs from 'node:fs'
import path from 'node:path'

const HOST = 'jichang-vpn.com'
const SITE_URL = `https://${HOST}`

// 1. Locate IndexNow key file from docs/public
const publicDir = path.resolve('docs/public')
const keyFile = fs.readdirSync(publicDir).find(f => /^[a-f0-9]{32}\.txt$/.test(f))

if (!keyFile) {
  console.error('[IndexNow Error] No 32-char hex key file found in docs/public!')
  process.exit(1)
}

const KEY = keyFile.replace('.txt', '')
const KEY_LOCATION = `${SITE_URL}/${keyFile}`

console.log(`[IndexNow] Using host: ${HOST}`)
console.log(`[IndexNow] Key file: ${keyFile}`)
console.log(`[IndexNow] Key location: ${KEY_LOCATION}`)

// 2. Extract URLs from sitemap.xml
async function getUrlList() {
  let xml = ''
  const localSitemap = path.resolve('docs/.vitepress/dist/sitemap.xml')
  
  if (fs.existsSync(localSitemap)) {
    xml = fs.readFileSync(localSitemap, 'utf8')
    console.log(`[IndexNow] Reading URLs from local sitemap (${localSitemap})`)
  } else {
    console.log(`[IndexNow] Fetching URLs from live sitemap (${SITE_URL}/sitemap.xml)`)
    const res = await fetch(`${SITE_URL}/sitemap.xml`)
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap: HTTP ${res.status}`)
    }
    xml = await res.text()
  }

  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
  const validUrls = matches.filter(u => u.startsWith(SITE_URL))
  return [...new Set(validUrls)]
}

// 3. Submit batches to IndexNow endpoints
async function submitBatch(endpointName, endpointUrl, urls) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  })

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: payload
  })

  const text = await res.text()
  const statusOk = res.status === 200 || res.status === 202
  console.log(`  -> [${endpointName}] Status: ${res.status} ${statusOk ? '✓ (OK)' : '✗ (Failed)'} ${text ? `- ${text}` : ''}`)
  return statusOk
}

async function main() {
  try {
    const urls = await getUrlList()
    console.log(`[IndexNow] Total URLs discovered: ${urls.length}`)

    if (urls.length === 0) {
      console.warn('[IndexNow] Warning: 0 URLs found to submit!')
      return
    }

    const BATCH_SIZE = 100
    let allSuccess = true

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE)
      console.log(`\n[IndexNow] Submitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1} - ${i + batch.length} of ${urls.length}):`)
      
      // Submit to api.indexnow.org
      const ok1 = await submitBatch('api.indexnow.org', 'https://api.indexnow.org/indexnow', batch)
      // Submit directly to Bing
      const ok2 = await submitBatch('www.bing.com', 'https://www.bing.com/indexnow', batch)

      if (!ok1 || !ok2) {
        allSuccess = false
      }
    }

    if (allSuccess) {
      console.log('\n=============================================')
      console.log(`🎉 [IndexNow] Successfully pushed all ${urls.length} URLs to Bing & IndexNow!`)
      console.log('=============================================\n')
    } else {
      console.warn('\n⚠️ [IndexNow] Some batches encountered non-200 responses. Check logs above.\n')
    }
  } catch (err) {
    console.error('[IndexNow Fatal Error]', err)
    process.exit(1)
  }
}

main()
