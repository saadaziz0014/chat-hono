import { Hono } from 'hono'
import auth from './routes/auth.router'
import chat from './routes/chat.router'

const app = new Hono()

app.route('/auth', auth)
app.route("/chat", chat)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
