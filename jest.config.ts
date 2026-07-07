import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Đường dẫn tới ứng dụng Next.js để load next.config.js và .env
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  
  // 1. Chỉ định Jest chỉ tìm và chạy test trong thư mục /unit-tests
  testMatch: [
    '<rootDir>/unit-tests/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],

  // Hoặc bạn có thể giới hạn vùng quét bằng thuộc tính roots thay thế:
  // roots: ['<rootDir>/unit-tests'],

  // Thêm setupFilesAfterEnv nếu bạn muốn cấu hình custom matchers cho Jest Dom
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Xử lý các path alias nếu bạn dùng (ví dụ: @/components)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)