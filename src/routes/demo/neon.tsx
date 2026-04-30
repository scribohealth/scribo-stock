import { createServerFn } from '@tanstack/react-start'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'

import { getDb } from '#/db/index'
import { todos, type Todo } from '#/db/schema'

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  const db = getDb()
  return await db.query.todos.findMany({
    orderBy: [desc(todos.createdAt)],
  })
})

const insertTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((d: { title: string }) => d)
  .handler(async ({ data }) => {
    const db = getDb()
    await db.insert(todos).values({ title: data.title })
  })

export const Route = createFileRoute('/demo/neon')({
  component: App,
  loader: async () => {
    const todosList = await getTodos()
    return { todos: todosList }
  },
})

function App() {
  const { todos } = Route.useLoaderData()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)
    await insertTodo({ data: { title: data.title as string } })
    router.invalidate()
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold">D1 demo (was Neon)</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Same todos UI backed by Cloudflare D1 via Drizzle. Run{" "}
          <code className="rounded bg-muted px-1">wrangler d1 migrations apply …</code> first.
        </p>
        <ul className="mb-6 space-y-2">
          {(todos as Todo[]).map((todo) => (
            <li key={todo.id} className="rounded border p-3">
              <span className="font-medium">{todo.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">#{todo.id}</span>
            </li>
          ))}
          {todos.length === 0 && <li className="text-muted-foreground">No todos yet.</li>}
        </ul>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            name="title"
            placeholder="New todo"
            className="flex-1 rounded border bg-background px-3 py-2"
          />
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            Add
          </button>
        </form>
      </div>
    </div>
  )
}
