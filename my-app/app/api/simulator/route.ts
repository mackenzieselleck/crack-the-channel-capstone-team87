//base routing to qiskit waiting on qiskit and docker setup
export async function POST() {
    const res = await fetch('http://localhost:8000/bb84/run', { method: 'POST'})
    const data = await res.json()
    return Response.json(data)
}