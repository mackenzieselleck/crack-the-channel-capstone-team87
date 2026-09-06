//base routing for agent
import { NextRequest, NextResponse } from 'next/server'
//placeholder for Agent API call when decided upon
export async function POST(request: NextRequest) {
    const { message } = await request.json()

}