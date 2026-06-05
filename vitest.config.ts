import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        environment: 'node',
        env: {
            ALLOWED_ORIGIN: 'http://localhost:5173',
            API_SECRET: 'some-long-random-string'
        }
    }
})

