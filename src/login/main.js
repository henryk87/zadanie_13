import { supabase } from '../../lib/supabase'

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert('Niepoprawne dane logowania')
    return
  }
  window.location.href = '/'
})