import { Hono } from 'hono'
import auth from './routes/auth.router'

const app = new Hono()

app.route('/auth', auth)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
