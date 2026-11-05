// Vercel entry point: runs the compiled Express API as one function. Vercel's CDN serves
// the website, so production is off here to skip Express's static-file handling.
import { createApp } from '../backend/dist/app.js'
import { readEnv } from '../backend/dist/env.js'

export default createApp({ ...readEnv(), production: false })
