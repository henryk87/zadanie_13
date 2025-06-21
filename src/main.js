import { supabase } from '../lib/supabase.js'

const app = document.getElementById('app')

async function fetchArticles() {
  const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
  renderArticles(data)
}

function renderArticles(articles) {
  app.innerHTML = ''
  const user = supabase.auth.getUser().then(res => {
    const isLoggedIn = !!res.data.user
    const addBtn = document.createElement('button')
    addBtn.textContent = 'Dodaj artykuł'
    addBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4'
    addBtn.onclick = () => openModal()
    if (isLoggedIn) app.appendChild(addBtn)

    articles.forEach(article => {
      const div = document.createElement('div')
      div.className = 'border p-4 mb-4 rounded shadow'
      div.innerHTML = `
        <h2 class="text-xl font-bold">${article.title}</h2>
        <h3 class="text-md text-gray-500">${article.subtitle}</h3>
        <p class="text-sm mt-2">${article.content}</p>
        <div class="text-xs text-gray-400 mt-2">${article.author} - ${new Date(article.created_at).toLocaleString()}</div>
      `

      if (isLoggedIn) {
        const delBtn = document.createElement('button')
        delBtn.textContent = 'Usuń'
        delBtn.className = 'text-red-600 hover:underline mr-2'
        delBtn.onclick = async () => {
          await supabase.from('articles').delete().eq('id', article.id)
          fetchArticles()
        }

        const editBtn = document.createElement('button')
        editBtn.textContent = 'Edytuj'
        editBtn.className = 'text-blue-600 hover:underline'
        editBtn.onclick = () => openModal(article)

        div.appendChild(editBtn)
        div.appendChild(delBtn)
      }

      app.appendChild(div)
    })
  })
}

function openModal(article = null) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'
  modal.innerHTML = `
    <div class="bg-white p-6 rounded w-full max-w-md">
      <input id="title" placeholder="Tytuł" class="border p-2 w-full mb-2" value="${article?.title || ''}">
      <input id="subtitle" placeholder="Podtytuł" class="border p-2 w-full mb-2" value="${article?.subtitle || ''}">
      <input id="author" placeholder="Autor" class="border p-2 w-full mb-2" value="${article?.author || ''}">
      <textarea id="content" placeholder="Treść" class="border p-2 w-full mb-2">${article?.content || ''}</textarea>
      <div class="flex justify-end">
        <button id="save" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">Zapisz</button>
        <button id="cancel" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Anuluj</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  document.getElementById('cancel').onclick = () => modal.remove()
  document.getElementById('save').onclick = async () => {
    const title = document.getElementById('title').value
    const subtitle = document.getElementById('subtitle').value
    const content = document.getElementById('content').value
    const author = document.getElementById('author').value
    const created_at = new Date().toISOString()

    if (article) {
      await supabase.from('articles').update({ title, subtitle, content, author, created_at }).eq('id', article.id)
    } else {
      await supabase.from('articles').insert({ title, subtitle, content, author, created_at })
    }

    modal.remove()
    fetchArticles()
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchArticles()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const logout = document.createElement('button')
    logout.textContent = 'Wyloguj'
    logout.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
    logout.onclick = async () => {
      await supabase.auth.signOut()
      location.reload()
    }
    document.body.appendChild(logout)
  }
})