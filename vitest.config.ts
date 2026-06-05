import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        environment: 'node',
        env: {
            API_SECRET: 'some-long-random-string'
        }
    }
})

