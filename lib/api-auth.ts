/**
 * API Authentication Utility
 * Validates x-api-key header for ESP32 device authentication
 */

import { NextResponse } from 'next/server'

/**
 * Validates the API key from request headers
 * Returns null if valid, or a NextResponse with 401 error if invalid
 */
export function validateApiKey(request: Request): NextResponse | null {
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.ESP32_API_KEY

    // If no API key is configured, allow all requests (development mode)
    if (!expectedKey) {
        console.warn('[API Auth] ESP32_API_KEY not configured - allowing request')
        return null
    }

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Missing API key. Include x-api-key header.' },
            { status: 401 }
        )
    }

    if (apiKey !== expectedKey) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        )
    }

    return null // Valid - continue processing
}

/**
 * Middleware wrapper for API routes requiring ESP32 authentication
 */
export function withApiAuth(
    handler: (request: Request) => Promise<NextResponse>
): (request: Request) => Promise<NextResponse> {
    return async (request: Request) => {
        const authError = validateApiKey(request)
        if (authError) {
            return authError
        }
        return handler(request)
    }
}
